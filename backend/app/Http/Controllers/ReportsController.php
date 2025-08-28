<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\{TransactionInstallment, TransactionType, TransactionCategory, TransactionSub, Category, SubCategory};

class ReportsController extends Controller
{
    /**
     * Summary report with aggregated data by month and category.
     * Query params:
     *  - date_from (Y-m-d)
     *  - date_to (Y-m-d)
     */
    public function summary(Request $request)
    {
        $userId = auth('api')->id();
        $incomeId = TransactionType::where('name', 'income')->value('id');
        $expenseId = TransactionType::where('name', 'expense')->value('id');
    $transferId = TransactionType::where('name', 'transfer')->value('id');

        $start = $request->query('date_from', now()->subMonths(5)->startOfMonth()->toDateString());
        $end = $request->query('date_to', now()->endOfMonth()->toDateString());

        // Monthly aggregation (sum of installments) within range
        $monthly = TransactionInstallment::query()
            ->join('transactions', 'transactions.id', '=', 'transactions_installments.transaction_id')
            ->where('transactions_installments.user_id', $userId)
            ->whereBetween('transactions.date', [$start, $end])
            // Exclude transfers at the root level to avoid counting internal moves as income/expense
            ->where('transactions.transaction_type_id', '!=', $transferId)
            ->selectRaw("strftime('%Y-%m', transactions.date) as ym,
                SUM(CASE WHEN transactions_installments.transaction_type_id = ? THEN transactions_installments.value ELSE 0 END) as income,
                SUM(CASE WHEN transactions_installments.transaction_type_id = ? THEN transactions_installments.value ELSE 0 END) as expenses",
                [$incomeId, $expenseId]
            )
            ->groupBy('ym')
            ->orderBy('ym')
            ->get();

        // Fill missing months in range
        $period = [];
        $cursor = \Carbon\Carbon::createFromFormat('Y-m-d', $start)->startOfMonth();
        $endC = \Carbon\Carbon::createFromFormat('Y-m-d', $end)->startOfMonth();
        while ($cursor <= $endC) {
            $period[] = $cursor->format('Y-m');
            $cursor->addMonth();
        }
        $monthlyMap = $monthly->keyBy('ym');
        $monthlyOut = [];
        foreach ($period as $ym) {
            $inc = (float) ($monthlyMap[$ym]->income ?? 0);
            $exp = (float) ($monthlyMap[$ym]->expenses ?? 0);
            $monthlyOut[] = [
                'month' => $ym,
                'income' => round($inc, 2),
                'expenses' => round($exp, 2),
                'net' => round($inc - $exp, 2),
            ];
        }

        // Category aggregation (using subs + direct category links)
        $categoryRows = TransactionInstallment::query()
            ->join('transactions', 'transactions.id', '=', 'transactions_installments.transaction_id')
            ->leftJoin('transactions_sub', 'transactions_sub.transactions_installments_id', '=', 'transactions_installments.id')
            ->leftJoin('transactions_category', 'transactions_category.transactions_sub_id', '=', 'transactions_sub.id')
            ->leftJoin('category', 'category.id', '=', 'transactions_category.category_id')
            ->where('transactions_installments.user_id', $userId)
            ->whereBetween('transactions.date', [$start, $end])
            // Exclude transfers at the root level for category spending
            ->where('transactions.transaction_type_id', '!=', $transferId)
            ->where('transactions_installments.transaction_type_id', $expenseId)
            ->selectRaw('category.name as category_name, COALESCE(category.name, "Outros") as final_name, SUM(transactions_sub.value) as total')
            ->groupBy('final_name')
            ->get();

        $categoryTotal = $categoryRows->sum('total');
        $categoriesOut = $categoryRows->map(function ($r) use ($categoryTotal) {
            $val = (float) $r->total;
            return [
                'name' => $r->final_name,
                'value' => round($val, 2),
                'percentage' => $categoryTotal > 0 ? round(($val / $categoryTotal) * 100, 2) : 0,
            ];
        })->values();

        return response()->json([
            'date_from' => $start,
            'date_to' => $end,
            'monthly' => $monthlyOut,
            'categories' => $categoriesOut,
            'totals' => [
                'income' => array_sum(array_column($monthlyOut, 'income')),
                'expenses' => array_sum(array_column($monthlyOut, 'expenses')),
                'net' => array_sum(array_column($monthlyOut, 'net')),
            ],
        ]);
    }
}
