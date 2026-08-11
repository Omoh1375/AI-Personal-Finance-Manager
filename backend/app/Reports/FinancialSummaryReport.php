<?php

namespace App\Reports;

use App\Models\Account;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FinancialSummaryReport
{
    public function generate(
        string $from,
        string $to
    ): array {

        $userId = Auth::id();

        $income = Income::where('user_id', $userId)
            ->whereBetween('received_at', [$from, $to])
            ->sum('amount');

        $expenses = Expense::where('user_id', $userId)
            ->whereBetween('spent_at', [$from, $to])
            ->sum('amount');

        $accounts = Account::where('user_id', $userId)
            ->get([
                'id',
                'name',
                'balance',
            ]);

        $topCategories = Expense::select(
                'category_id',
                DB::raw('SUM(amount) as total')
            )
            ->with('category:id,name')
            ->where('user_id', $userId)
            ->whereBetween('spent_at', [$from, $to])
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return [

            'period' => [
                'from' => $from,
                'to' => $to,
            ],

            'summary' => [

                'income' => (float) $income,

                'expenses' => (float) $expenses,

                'net_savings' => (float) ($income - $expenses),

            ],

            'accounts' => $accounts,

            'top_categories' => $topCategories,

        ];
    }
}