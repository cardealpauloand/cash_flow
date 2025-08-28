<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Account, TransactionInstallment, TransactionType};
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $userId = auth('api')->id();
        $incomeId = TransactionType::where('name', 'income')->value('id');
        $expenseId = TransactionType::where('name', 'expense')->value('id');
        $transferId = TransactionType::where('name', 'transfer')->value('id');

        $start = $request->query('date_from', now()->startOfMonth()->toDateString());
        $end = $request->query('date_to', now()->endOfMonth()->toDateString());

        // Base query for month (exclude transfers at root level for income/expense aggregates)
        $baseMonth = TransactionInstallment::query()
            ->join('transactions', 'transactions.id', '=', 'transactions_installments.transaction_id')
            ->where('transactions_installments.user_id', $userId)
            ->whereBetween('transactions.date', [$start, $end]);

        $monthlyIncome = (clone $baseMonth)
            ->where('transactions_installments.transaction_type_id', $incomeId)
            ->where('transactions.transaction_type_id', '!=', $transferId)
            ->sum('transactions_installments.value');
        $monthlyExpenses = (clone $baseMonth)
            ->where('transactions_installments.transaction_type_id', $expenseId)
            ->where('transactions.transaction_type_id', '!=', $transferId)
            ->sum('transactions_installments.value');

        // Account balances (all time until today)
        $byAccount = TransactionInstallment::query()
            ->join('transactions', 'transactions.id', '=', 'transactions_installments.transaction_id')
            ->where('transactions_installments.user_id', $userId)
            ->whereDate('transactions.date', '<=', now()->toDateString())
            ->select([
                'transactions_installments.account_id',
                DB::raw("SUM(CASE WHEN transactions_installments.transaction_type_id = $incomeId THEN transactions_installments.value ELSE 0 END) as income_sum"),
                DB::raw("SUM(CASE WHEN transactions_installments.transaction_type_id = $expenseId THEN transactions_installments.value ELSE 0 END) as expense_sum"),
            ])
            ->groupBy('transactions_installments.account_id')
            ->get()
            ->keyBy('account_id');

        $accounts = Account::where('user_id', $userId)->get();
        $accountsOut = [];
        $positiveTotal = 0;
        foreach ($accounts as $acc) {
            $row = $byAccount->get($acc->id);
            $incomeSum = $row->income_sum ?? 0;
            $expenseSum = $row->expense_sum ?? 0;
            $balance = ($acc->opening_balance ?? 0) + $incomeSum - $expenseSum;
            if ($balance > 0) {
                $positiveTotal += $balance;
            }
            $accountsOut[] = [
                'id' => $acc->id,
                'name' => $acc->name,
                'type' => $acc->type,
                'balance' => round($balance, 2),
                'percentage' => 0, // placeholder, fill after loop
            ];
        }
        // Fill percentages
        foreach ($accountsOut as &$a) {
            if ($positiveTotal > 0 && $a['balance'] > 0) {
                $a['percentage'] = round(($a['balance'] / $positiveTotal) * 100, 2);
            }
        }
        unset($a);

        $totalBalance = array_reduce($accountsOut, fn($c, $a) => $c + $a['balance'], 0);
        $netFlow = $monthlyIncome - $monthlyExpenses;

        // Recent transactions based on root transactions (ensures transfer appears once)
        $recentTx = \App\Models\Transaction::query()
            ->leftJoin('accounts as dest', 'dest.id', '=', 'transactions.account_id')
            ->leftJoin('accounts as orig', 'orig.id', '=', 'transactions.account_out_id')
            ->where('transactions.user_id', $userId)
            ->orderBy('transactions.date', 'desc')
            ->limit(5)
            ->get([
                'transactions.id as id',
                'transactions.value',
                'transactions.transaction_type_id as type_id',
                'transactions.notes',
                'transactions.date',
                'dest.name as dest_name',
                'orig.name as origin_name',
            ]);

        $recent = $recentTx->map(function ($row) use ($incomeId, $expenseId, $transferId) {
            if ($row->type_id == $transferId) {
                return [
                    'id' => $row->id,
                    'type' => 'transfer',
                    'description' => $row->notes ?: 'Transferência',
                    'amount' => round((float) $row->value, 2),
                    'account' => trim(($row->origin_name ?? 'Origem') . ' -> ' . ($row->dest_name ?? 'Destino')),
                    'date' => (string) $row->date,
                ];
            }
            $type = $row->type_id == $incomeId ? 'income' : 'expense';
            $amount = $type === 'expense' ? -(float) $row->value : (float) $row->value;
            return [
                'id' => $row->id,
                'type' => $type,
                'description' => $row->notes ?: 'Movimentação #' . $row->id,
                'amount' => round($amount, 2),
                'account' => $row->type_id == $incomeId ? ($row->dest_name ?? 'Conta') : ($row->dest_name ?? 'Conta'),
                'date' => (string) $row->date,
            ];
        });

        return response()->json([
            'total_balance' => round($totalBalance, 2),
            'monthly_income' => round($monthlyIncome, 2),
            'monthly_expenses' => round($monthlyExpenses, 2),
            'net_flow' => round($netFlow, 2),
            'accounts' => $accountsOut,
            'recent_transactions' => $recent,
            'date_from' => $start,
            'date_to' => $end,
        ]);
    }
}
