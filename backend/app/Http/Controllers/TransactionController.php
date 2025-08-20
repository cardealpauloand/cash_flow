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
        $q = Transaction::with(['type','account','accountOut'])
            ->where('user_id', auth('api')->id());

        if ($request->filled('type')) {
            $type = TransactionType::where('name', $request->type)->value('id');
            if ($type) $q->where('transaction_type_id', $type);
        }
        if ($request->filled('date_from')) $q->whereDate('date','>=',$request->date_from);
        if ($request->filled('date_to')) $q->whereDate('date','<=',$request->date_to);
        if ($request->filled('account_id')) $q->where('account_id',$request->account_id);

        return response()->json($q->orderBy('date','desc')->paginate(20));
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

            return response()->json($tx, 201);
        });
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        return response()->json($transaction->load(['type','account','accountOut','installments.subs','installments.tags']));
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();
        return response()->json(['deleted' => true]);
    }
}
