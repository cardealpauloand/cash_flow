<?php
namespace App\Http\Controllers;

use App\Http\Requests\TransactionRequest;
use App\Models\{Transaction, TransactionType, TransactionInstallment, TransactionSub, TransactionCategory, TransactionTag};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        // Nova listagem baseada em parcels (transactions_installments)
        $q = TransactionInstallment::query()
            ->with(['subs.categoryLink.category', 'subs.categoryLink.subCategory', 'tags', 'transaction'])
            ->where('transactions_installments.user_id', auth('api')->id())
            ->join('transactions', 'transactions.id', '=', 'transactions_installments.transaction_id')
            ->select([
                'transactions_installments.*',
                'transactions.date as transaction_date',
                'transactions.notes as transaction_notes',
                'transactions.transaction_type_id as root_transaction_type_id',
                'transactions.account_out_id as root_account_out_id',
                'transactions.account_id as root_account_id',
            ]);

        if ($request->filled('type')) {
            $typeName = $request->type; // income|expense|transfer
            $typeId = TransactionType::where('name', $typeName)->value('id');
            if ($typeId) {
                // Filtra pelo tipo da parcela OU, se transfer, pelo tipo raiz transfer
                if ($typeName === 'transfer') {
                    $rootTransferId = $typeId; // id do tipo transfer
                    $q->where('transactions.transaction_type_id', $rootTransferId);
                } else {
                    $q->where('transactions_installments.transaction_type_id', $typeId);
                }
            }
        }
        if ($request->filled('date_from'))
            $q->whereDate('transactions.date', '>=', $request->date_from);
        if ($request->filled('date_to'))
            $q->whereDate('transactions.date', '<=', $request->date_to);
        if ($request->filled('account_id'))
            $q->where('transactions_installments.account_id', $request->account_id);

        $paginated = $q->orderBy('transactions.date', 'desc')->paginate(20);

        $paginated->getCollection()->transform(function ($inst) {
            return [
                'id' => $inst->id,
                'value' => $inst->value,
                'transaction_type_id' => $inst->transaction_type_id,
                'account_id' => $inst->account_id,
                'transaction_id' => $inst->transaction_id,
                'date' => (string) $inst->transaction_date,
                'notes' => $inst->transaction_notes,
                'root_transaction_type_id' => $inst->root_transaction_type_id,
                'account_out_id' => $inst->root_account_out_id,
                'root_account_id' => $inst->root_account_id,
                'subs' => $inst->subs->map(fn($s) => [
                    'id' => $s->id,
                    'value' => $s->value,
                    'category_id' => optional($s->categoryLink)->category_id,
                    'sub_category_id' => optional($s->categoryLink)->sub_category_id,
                ]),
                'tags' => $inst->tags->map(fn($t) => ['id' => $t->tag_id ?? $t->id]),
            ];
        });
        return response()->json($paginated);
    }

    public function store(TransactionRequest $request)
    {
        $userId = auth('api')->id();
        $typeRow = TransactionType::where('name', $request->transaction_type)->firstOrFail();

        return DB::transaction(function () use ($request, $userId, $typeRow) {
            $installmentsCount = (int) $request->input('installments_count', 1);

            // Regras específicas para transferência: validar saldo e propriedade das contas
            if ($request->transaction_type === 'transfer') {
                // Origem = account_out_id, Destino = account_id
                $origin = \App\Models\Account::findOrFail($request->account_out_id);
                $destination = \App\Models\Account::findOrFail($request->account_id);
                // Verifica se ambas as contas pertencem ao usuário logado
                if ($origin->user_id !== $userId || $destination->user_id !== $userId) {
                    abort(403, 'Conta não pertence ao usuário.');
                }

                $incomeId = TransactionType::where('name', 'income')->value('id');
                $expenseId = TransactionType::where('name', 'expense')->value('id');

                // Saldo atual da conta de origem: abertura + entradas - saídas (parcelas)
                $originOpening = (float) ($origin->opening_balance ?? 0);
                $originIncome = (float) \App\Models\TransactionInstallment::where('user_id', $userId)
                    ->where('account_id', $origin->id)
                    ->where('transaction_type_id', $incomeId)
                    ->sum('value');
                $originExpense = (float) \App\Models\TransactionInstallment::where('user_id', $userId)
                    ->where('account_id', $origin->id)
                    ->where('transaction_type_id', $expenseId)
                    ->sum('value');
                $originBalance = round($originOpening + $originIncome - $originExpense, 2);
                if ($originBalance + 1e-6 < (float) $request->value) {
                    return response()->json([
                        'error' => 'Saldo insuficiente na conta de origem.'
                    ], 422);
                }
            }

            $tx = Transaction::create([
                'value' => $request->value,
                'transaction_type_id' => $typeRow->id,
                'date' => $request->date,
                'account_id' => $request->account_id,
                'account_out_id' => $request->transaction_type === 'transfer' ? $request->account_out_id : null,
                'user_id' => $userId,
                'notes' => $request->notes,
                'transfer_group' => null,
                'created_at' => now(),
            ]);

            // Transfer segue lógica antiga (sempre 2 installments, não parcelado)
            if ($request->transaction_type === 'transfer') {
                $incomeId = TransactionType::where('name', 'income')->value('id');
                $expenseId = TransactionType::where('name', 'expense')->value('id');

                $inInst = TransactionInstallment::create([
                    'value' => $request->value,
                    'transaction_id' => $tx->id,
                    'transaction_type_id' => $incomeId,
                    'account_id' => $request->account_id,
                    'user_id' => $userId,
                ]);
                $outInst = TransactionInstallment::create([
                    'value' => $request->value,
                    'transaction_id' => $tx->id,
                    'transaction_type_id' => $expenseId,
                    'account_id' => $request->account_out_id,
                    'user_id' => $userId,
                ]);

                foreach ([$inInst, $outInst] as $inst) {
                    // Se o request trouxer subs, criá-los proporcionalmente (apenas para a parcela de entrada?)
                    if ($request->filled('subs') && is_array($request->subs) && $inst->transaction_type_id === $incomeId) {
                        foreach ($request->subs as $subPayload) {
                            $sub = TransactionSub::create([
                                'transactions_installments_id' => $inst->id,
                                'value' => $subPayload['value'],
                            ]);
                            if (!empty($subPayload['category_id'])) {
                                TransactionCategory::create([
                                    'transactions_sub_id' => $sub->id,
                                    'category_id' => $subPayload['category_id'],
                                    'sub_category_id' => $subPayload['sub_category_id'] ?? null,
                                ]);
                            }
                        }
                    } else {
                        $sub = TransactionSub::create([
                            'transactions_installments_id' => $inst->id,
                            'value' => $inst->value,
                        ]);
                        if ($inst->transaction_type_id === $incomeId && $request->filled('category_id')) {
                            TransactionCategory::create([
                                'transactions_sub_id' => $sub->id,
                                'category_id' => $request->category_id,
                                'sub_category_id' => $request->sub_category_id,
                            ]);
                        }
                    }
                    if ($request->filled('tags')) {
                        foreach ($request->tags as $tagId) {
                            TransactionTag::firstOrCreate([
                                'transactions_installments_id' => $inst->id,
                                'tag_id' => $tagId,
                            ]);
                        }
                    }
                }
            } else {
                // Parcelamento para income / expense
                if ($installmentsCount <= 1) {
                    $installmentsCount = 1; // fallback
                }
                // Cálculo das parcelas: dividir value igualmente e ajustar última para corrigir arredondamento
                $total = (float) $request->value;
                $baseValue = round(floor(($total / $installmentsCount) * 100) / 100, 2); // trunc
                $accum = 0.0;
                $startDate = \Carbon\Carbon::parse($request->date); // mantido caso futuro adicionemos date por parcela
                for ($i = 0; $i < $installmentsCount; $i++) {
                    if ($i < $installmentsCount - 1) {
                        $val = $baseValue;
                        $accum += $val;
                    } else {
                        $val = round($total - $accum, 2); // última
                    }

                    $inst = TransactionInstallment::create([
                        'value' => $val,
                        'transaction_id' => $tx->id,
                        'transaction_type_id' => $typeRow->id,
                        'account_id' => $request->account_id,
                        'user_id' => $userId,
                    ]);

                    if ($request->filled('subs') && is_array($request->subs)) {
                        // Distribui subs proporcionalmente ao valor da parcela
                        $ratio = $val / $total; // proporção
                        foreach ($request->subs as $subPayload) {
                            $subVal = round($subPayload['value'] * $ratio, 2);
                            $sub = TransactionSub::create([
                                'transactions_installments_id' => $inst->id,
                                'value' => $subVal,
                            ]);
                            if (!empty($subPayload['category_id'])) {
                                TransactionCategory::create([
                                    'transactions_sub_id' => $sub->id,
                                    'category_id' => $subPayload['category_id'],
                                    'sub_category_id' => $subPayload['sub_category_id'] ?? null,
                                ]);
                            }
                        }
                    } else {
                        $sub = TransactionSub::create([
                            'transactions_installments_id' => $inst->id,
                            'value' => $inst->value,
                        ]);
                        if ($request->filled('category_id')) {
                            TransactionCategory::create([
                                'transactions_sub_id' => $sub->id,
                                'category_id' => $request->category_id,
                                'sub_category_id' => $request->sub_category_id,
                            ]);
                        }
                    }
                    if ($request->filled('tags')) {
                        foreach ($request->tags as $tagId) {
                            TransactionTag::firstOrCreate([
                                'transactions_installments_id' => $inst->id,
                                'tag_id' => $tagId,
                            ]);
                        }
                    }
                }
            }

            // Retorna as parcelas criadas (uma ou duas) para o frontend já usar na listagem
            $installments = TransactionInstallment::where('transaction_id', $tx->id)
                ->with(['subs.categoryLink.category', 'subs.categoryLink.subCategory', 'tags'])
                ->get();
            return response()->json([
                'transaction_id' => $tx->id,
                'date' => (string) $tx->date,
                'installments' => $installments->map(fn($inst) => [
                    'id' => $inst->id,
                    'value' => $inst->value,
                    'transaction_type_id' => $inst->transaction_type_id,
                    'account_id' => $inst->account_id,
                    'transaction_id' => $inst->transaction_id,
                    'date' => (string) $tx->date,
                    'subs' => $inst->subs->map(fn($s) => [
                        'id' => $s->id,
                        'value' => $s->value,
                        'category_id' => optional($s->categoryLink)->category_id,
                        'sub_category_id' => optional($s->categoryLink)->sub_category_id,
                    ]),
                    'tags' => $inst->tags->map(fn($t) => ['id' => $t->tag_id ?? $t->id]),
                ]),
            ], 201);
        });
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return response()->json($transaction->load(['type', 'account', 'accountOut', 'installments.subs', 'installments.tags']));
    }

    public function update(TransactionRequest $request, $id)
    {
        $userId = auth('api')->id();
        $transaction = Transaction::findOrFail($id);
        if ($transaction->user_id !== $userId) {
            abort(403, 'Forbidden');
        }

        $typeRow = TransactionType::where('name', $request->transaction_type)->firstOrFail();

        return DB::transaction(function () use ($request, $transaction, $typeRow, $userId) {
            // Regras específicas para transferência: validar saldo e propriedade das contas
            if ($request->transaction_type === 'transfer') {
                $origin = \App\Models\Account::findOrFail($request->account_out_id);
                $destination = \App\Models\Account::findOrFail($request->account_id);
                if ($origin->user_id !== $userId || $destination->user_id !== $userId) {
                    abort(403, 'Conta não pertence ao usuário.');
                }

                $incomeId = TransactionType::where('name', 'income')->value('id');
                $expenseId = TransactionType::where('name', 'expense')->value('id');

                $originOpening = (float) ($origin->opening_balance ?? 0);
                $originIncome = (float) \App\Models\TransactionInstallment::where('user_id', $userId)
                    ->where('account_id', $origin->id)
                    ->where('transaction_type_id', $incomeId)
                    ->sum('value');
                $originExpense = (float) \App\Models\TransactionInstallment::where('user_id', $userId)
                    ->where('account_id', $origin->id)
                    ->where('transaction_type_id', $expenseId)
                    ->sum('value');
                // If keeping the same origin, add back the current transaction's expense to simulate replacement
                $originBalance = round($originOpening + $originIncome - $originExpense, 2);
                $prevOriginId = $transaction->account_out_id;
                if ($prevOriginId && (int)$prevOriginId === (int)$origin->id) {
                    $prevExpense = (float) \App\Models\TransactionInstallment::where('transaction_id', $transaction->id)
                        ->where('transaction_type_id', $expenseId)
                        ->where('account_id', $origin->id)
                        ->sum('value');
                    $originBalance = round($originBalance + $prevExpense, 2);
                }
                if ($originBalance + 1e-6 < (float) $request->value) {
                    return response()->json([
                        'error' => 'Saldo insuficiente na conta de origem.'
                    ], 422);
                }
            }
            // Update root transaction fields
            $transaction->value = $request->value;
            $transaction->transaction_type_id = $typeRow->id;
            $transaction->date = $request->date;
            $transaction->account_id = $request->account_id;
            $transaction->account_out_id = $request->transaction_type === 'transfer' ? $request->account_out_id : null;
            $transaction->notes = $request->notes;
            $transaction->save();

            // Remove existing installments and related subs/tags/categories
            $instIds = TransactionInstallment::where('transaction_id', $transaction->id)->pluck('id');
            $subIds = TransactionSub::whereIn('transactions_installments_id', $instIds)->pluck('id');
            TransactionTag::whereIn('transactions_installments_id', $instIds)->delete();
            TransactionCategory::whereIn('transactions_sub_id', $subIds)->delete();
            TransactionSub::whereIn('id', $subIds)->delete();
            TransactionInstallment::whereIn('id', $instIds)->delete();

            // Recreate installments
            $installmentsCount = (int) $request->input('installments_count', 1);
            if ($request->transaction_type === 'transfer') {
                $incomeId = TransactionType::where('name', 'income')->value('id');
                $expenseId = TransactionType::where('name', 'expense')->value('id');

                $inInst = TransactionInstallment::create([
                    'value' => $request->value,
                    'transaction_id' => $transaction->id,
                    'transaction_type_id' => $incomeId,
                    'account_id' => $request->account_id,
                    'user_id' => $userId,
                ]);
                $outInst = TransactionInstallment::create([
                    'value' => $request->value,
                    'transaction_id' => $transaction->id,
                    'transaction_type_id' => $expenseId,
                    'account_id' => $request->account_out_id,
                    'user_id' => $userId,
                ]);

                foreach ([$inInst, $outInst] as $inst) {
                    if ($request->filled('subs') && is_array($request->subs) && $inst->transaction_type_id === $incomeId) {
                        foreach ($request->subs as $subPayload) {
                            $sub = TransactionSub::create([
                                'transactions_installments_id' => $inst->id,
                                'value' => $subPayload['value'],
                            ]);
                            if (!empty($subPayload['category_id'])) {
                                TransactionCategory::create([
                                    'transactions_sub_id' => $sub->id,
                                    'category_id' => $subPayload['category_id'],
                                    'sub_category_id' => $subPayload['sub_category_id'] ?? null,
                                ]);
                            }
                        }
                    } else {
                        $sub = TransactionSub::create([
                            'transactions_installments_id' => $inst->id,
                            'value' => $inst->value,
                        ]);
                        if ($inst->transaction_type_id === $incomeId && $request->filled('category_id')) {
                            TransactionCategory::create([
                                'transactions_sub_id' => $sub->id,
                                'category_id' => $request->category_id,
                                'sub_category_id' => $request->sub_category_id,
                            ]);
                        }
                    }
                    if ($request->filled('tags')) {
                        foreach ($request->tags as $tagId) {
                            TransactionTag::firstOrCreate([
                                'transactions_installments_id' => $inst->id,
                                'tag_id' => $tagId,
                            ]);
                        }
                    }
                }
            } else {
                if ($installmentsCount <= 1) {
                    $installmentsCount = 1;
                }
                $total = (float) $request->value;
                $baseValue = round(floor(($total / $installmentsCount) * 100) / 100, 2);
                $accum = 0.0;
                for ($i = 0; $i < $installmentsCount; $i++) {
                    if ($i < $installmentsCount - 1) {
                        $val = $baseValue;
                        $accum += $val;
                    } else {
                        $val = round($total - $accum, 2);
                    }
                    $inst = TransactionInstallment::create([
                        'value' => $val,
                        'transaction_id' => $transaction->id,
                        'transaction_type_id' => $typeRow->id,
                        'account_id' => $request->account_id,
                        'user_id' => $userId,
                    ]);

                    if ($request->filled('subs') && is_array($request->subs)) {
                        $ratio = $val / $total;
                        foreach ($request->subs as $subPayload) {
                            $subVal = round($subPayload['value'] * $ratio, 2);
                            $sub = TransactionSub::create([
                                'transactions_installments_id' => $inst->id,
                                'value' => $subVal,
                            ]);
                            if (!empty($subPayload['category_id'])) {
                                TransactionCategory::create([
                                    'transactions_sub_id' => $sub->id,
                                    'category_id' => $subPayload['category_id'],
                                    'sub_category_id' => $subPayload['sub_category_id'] ?? null,
                                ]);
                            }
                        }
                    } else {
                        $sub = TransactionSub::create([
                            'transactions_installments_id' => $inst->id,
                            'value' => $inst->value,
                        ]);
                        if ($request->filled('category_id')) {
                            TransactionCategory::create([
                                'transactions_sub_id' => $sub->id,
                                'category_id' => $request->category_id,
                                'sub_category_id' => $request->sub_category_id,
                            ]);
                        }
                    }
                    if ($request->filled('tags')) {
                        foreach ($request->tags as $tagId) {
                            TransactionTag::firstOrCreate([
                                'transactions_installments_id' => $inst->id,
                                'tag_id' => $tagId,
                            ]);
                        }
                    }
                }
            }

            return response()->json(['updated' => true]);
        });
    }

    public function destroy($id, Request $request)
    {
        // Tentar como transação primeiro; se não existir, interpretar como installment id
        $transaction = Transaction::find($id);
        $installmentId = $request->query('installment_id');

        if (!$transaction) {
            $installment = TransactionInstallment::findOrFail($id); // então $id é parcela
            $transaction = Transaction::findOrFail($installment->transaction_id);
            $installmentId = $installment->id; // força deleção desta parcela
        }

        // Autorização simples
        if ($transaction->user_id !== auth('api')->id()) {
            abort(403, 'Forbidden');
        }

        if ($installmentId) {
            $installment = TransactionInstallment::where('transaction_id', $transaction->id)
                ->where('id', $installmentId)->firstOrFail();
            $count = TransactionInstallment::where('transaction_id', $transaction->id)->count();

            if ($count <= 1) {
                // Última parcela -> apagar transação completa
                DB::transaction(function () use ($transaction) {
                    $instIds = TransactionInstallment::where('transaction_id', $transaction->id)->pluck('id');
                    $subIds = TransactionSub::whereIn('transactions_installments_id', $instIds)->pluck('id');
                    TransactionTag::whereIn('transactions_installments_id', $instIds)->delete();
                    TransactionCategory::whereIn('transactions_sub_id', $subIds)->delete();
                    TransactionSub::whereIn('id', $subIds)->delete();
                    TransactionInstallment::whereIn('id', $instIds)->delete();
                    $transaction->delete();
                });
                return response()->json(['deleted' => true, 'transaction_deleted' => true]);
            }

            DB::transaction(function () use ($installment) {
                $subIds = TransactionSub::where('transactions_installments_id', $installment->id)->pluck('id');
                TransactionTag::where('transactions_installments_id', $installment->id)->delete();
                TransactionCategory::whereIn('transactions_sub_id', $subIds)->delete();
                TransactionSub::whereIn('id', $subIds)->delete();
                $installment->delete();
            });
            return response()->json(['deleted' => true, 'transaction_deleted' => false]);
        }

        // Sem installment_id: deleta tudo
        DB::transaction(function () use ($transaction) {
            $instIds = TransactionInstallment::where('transaction_id', $transaction->id)->pluck('id');
            $subIds = TransactionSub::whereIn('transactions_installments_id', $instIds)->pluck('id');
            TransactionTag::whereIn('transactions_installments_id', $instIds)->delete();
            TransactionCategory::whereIn('transactions_sub_id', $subIds)->delete();
            TransactionSub::whereIn('id', $subIds)->delete();
            TransactionInstallment::whereIn('id', $instIds)->delete();
            $transaction->delete();
        });
        return response()->json(['deleted' => true, 'transaction_deleted' => true]);
    }
}
