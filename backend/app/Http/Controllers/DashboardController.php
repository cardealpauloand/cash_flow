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

        // Recent transactions (last 5 installments)
        $recent = TransactionInstallment::query()
            ->join('transactions', 'transactions.id', '=', 'transactions_installments.transaction_id')
            ->join('accounts as acc', 'acc.id', '=', 'transactions_installments.account_id')
            ->where('transactions_installments.user_id', $userId)
            ->orderBy('transactions.date', 'desc')
            ->limit(5)
            ->get([
                'transactions_installments.id',
                'transactions_installments.value',
                'transactions_installments.transaction_type_id',
                'transactions.transaction_type_id as root_type_id',
                'transactions.notes',
                'transactions.date',
                'acc.name as account_name',
            ])
            ->map(function ($row) use ($incomeId, $expenseId) {
                $type = $row->transaction_type_id == $incomeId ? 'income' : ($row->transaction_type_id == $expenseId ? 'expense' : 'transfer');
                $amount = $row->value;
                if ($type === 'expense') {
                    $amount = -$amount;
                }
                return [
                    'id' => $row->id,
                    'type' => $type,
                    'description' => $row->notes ?: 'Movimentação #' . $row->id,
                    'amount' => round($amount, 2),
                    'account' => $row->account_name,
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
