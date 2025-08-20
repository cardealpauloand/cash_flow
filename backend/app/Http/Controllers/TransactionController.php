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
            ->with(['subs','tags','transaction'])
            ->where('transactions_installments.user_id', auth('api')->id())
            ->join('transactions','transactions.id','=','transactions_installments.transaction_id')
            ->select([
                'transactions_installments.*',
                'transactions.date as transaction_date',
                'transactions.transaction_type_id as root_transaction_type_id',
                'transactions.account_out_id as root_account_out_id',
                'transactions.account_id as root_account_id',
            ]);

        if ($request->filled('type')) {
            $typeName = $request->type; // income|expense|transfer
            $typeId = TransactionType::where('name',$typeName)->value('id');
            if ($typeId) {
                // Filtra pelo tipo da parcela OU, se transfer, pelo tipo raiz transfer
                if ($typeName === 'transfer') {
                    $rootTransferId = $typeId; // id do tipo transfer
                    $q->where('transactions.transaction_type_id',$rootTransferId);
                } else {
                    $q->where('transactions_installments.transaction_type_id',$typeId);
                }
            }
        }
        if ($request->filled('date_from')) $q->whereDate('transactions.date','>=',$request->date_from);
        if ($request->filled('date_to')) $q->whereDate('transactions.date','<=',$request->date_to);
        if ($request->filled('account_id')) $q->where('transactions_installments.account_id',$request->account_id);

        $paginated = $q->orderBy('transactions.date','desc')->paginate(20);

        $paginated->getCollection()->transform(function($inst){
            return [
                'id' => $inst->id,
                'value' => $inst->value,
                'transaction_type_id' => $inst->transaction_type_id,
                'account_id' => $inst->account_id,
                'transaction_id' => $inst->transaction_id,
                'date' => (string) $inst->transaction_date,
                'root_transaction_type_id' => $inst->root_transaction_type_id,
                'account_out_id' => $inst->root_account_out_id,
                'root_account_id' => $inst->root_account_id,
                'subs' => $inst->subs->map(fn($s)=>['id'=>$s->id,'value'=>$s->value]),
                'tags' => $inst->tags->map(fn($t)=>['id'=>$t->tag_id ?? $t->id]),
            ];
        });
        return response()->json($paginated);
    }

    public function store(TransactionRequest $request)
    {
        $userId = auth('api')->id();
        $typeRow = TransactionType::where('name', $request->transaction_type)->firstOrFail();

        return DB::transaction(function() use ($request, $userId, $typeRow) {
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

            if ($request->transaction_type === 'transfer') {
                $incomeId = TransactionType::where('name','income')->value('id');
                $expenseId = TransactionType::where('name','expense')->value('id');

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

                foreach ([$inInst,$outInst] as $inst) {
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
                $inst = TransactionInstallment::create([
                    'value' => $request->value,
                    'transaction_id' => $tx->id,
                    'transaction_type_id' => $typeRow->id,
                    'account_id' => $request->account_id,
                    'user_id' => $userId,
                ]);
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
                if ($request->filled('tags')) {
                    foreach ($request->tags as $tagId) {
                        TransactionTag::firstOrCreate([
                            'transactions_installments_id' => $inst->id,
                            'tag_id' => $tagId,
                        ]);
                    }
                }
            }

            // Retorna as parcelas criadas (uma ou duas) para o frontend já usar na listagem
            $installments = TransactionInstallment::where('transaction_id',$tx->id)->with(['subs','tags'])->get();
            return response()->json([
                'transaction_id' => $tx->id,
                'date' => $tx->date->toDateString(),
                'installments' => $installments->map(fn($inst)=>[
                    'id' => $inst->id,
                    'value' => $inst->value,
                    'transaction_type_id' => $inst->transaction_type_id,
                    'account_id' => $inst->account_id,
                    'transaction_id' => $inst->transaction_id,
                    'date' => $tx->date->toDateString(),
                    'subs' => $inst->subs->map(fn($s)=>['id'=>$s->id,'value'=>$s->value]),
                    'tags' => $inst->tags->map(fn($t)=>['id'=>$t->tag_id ?? $t->id]),
                ]),
            ], 201);
        });
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return response()->json($transaction->load(['type','account','accountOut','installments.subs','installments.tags']));
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
            $installment = TransactionInstallment::where('transaction_id',$transaction->id)
                ->where('id',$installmentId)->firstOrFail();
            $count = TransactionInstallment::where('transaction_id',$transaction->id)->count();

            if ($count <= 1) {
                // Última parcela -> apagar transação completa
                DB::transaction(function() use ($transaction) {
                    $instIds = TransactionInstallment::where('transaction_id',$transaction->id)->pluck('id');
                    $subIds = TransactionSub::whereIn('transactions_installments_id',$instIds)->pluck('id');
                    TransactionTag::whereIn('transactions_installments_id',$instIds)->delete();
                    TransactionCategory::whereIn('transactions_sub_id',$subIds)->delete();
                    TransactionSub::whereIn('id',$subIds)->delete();
                    TransactionInstallment::whereIn('id',$instIds)->delete();
                    $transaction->delete();
                });
                return response()->json(['deleted' => true, 'transaction_deleted' => true]);
            }

            DB::transaction(function() use ($installment) {
                $subIds = TransactionSub::where('transactions_installments_id',$installment->id)->pluck('id');
                TransactionTag::where('transactions_installments_id',$installment->id)->delete();
                TransactionCategory::whereIn('transactions_sub_id',$subIds)->delete();
                TransactionSub::whereIn('id',$subIds)->delete();
                $installment->delete();
            });
            return response()->json(['deleted' => true, 'transaction_deleted' => false]);
        }

        // Sem installment_id: deleta tudo
        DB::transaction(function() use ($transaction) {
            $instIds = TransactionInstallment::where('transaction_id',$transaction->id)->pluck('id');
            $subIds = TransactionSub::whereIn('transactions_installments_id',$instIds)->pluck('id');
            TransactionTag::whereIn('transactions_installments_id',$instIds)->delete();
            TransactionCategory::whereIn('transactions_sub_id',$subIds)->delete();
            TransactionSub::whereIn('id',$subIds)->delete();
            TransactionInstallment::whereIn('id',$instIds)->delete();
            $transaction->delete();
        });
        return response()->json(['deleted' => true, 'transaction_deleted' => true]);
    }
}
