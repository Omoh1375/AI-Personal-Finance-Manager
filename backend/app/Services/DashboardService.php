<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Expense;
use App\Models\Income;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DashboardService
{
    public function getDashboardData(): array
    {
        $userId = Auth::id();

        $currentMonth = Carbon::now();

        return [

            'total_balance' => Account::where('user_id', $userId)
                ->sum('balance'),

            'total_income' => Income::where('user_id', $userId)
                ->sum('amount'),

            'total_expenses' => Expense::where('user_id', $userId)
                ->sum('amount'),

            'monthly_income' => Income::where('user_id', $userId)
                ->whereMonth('received_at', $currentMonth->month)
                ->whereYear('received_at', $currentMonth->year)
                ->sum('amount'),

            'monthly_expenses' => Expense::where('user_id', $userId)
                ->whereMonth('spent_at', $currentMonth->month)
                ->whereYear('spent_at', $currentMonth->year)
                ->sum('amount'),

            'accounts' => Account::where('user_id', $userId)
                ->get(),
               
             'recent_transactions' => $this->recentTransactions($userId),

             'expense_breakdown' => $this->expenseBreakdown($userId),

             'monthly_cash_flow' => $this->monthlyCashFlow($userId),
        ];
    }

    private function recentTransactions(int $userId)
    {
        $incomes = Income::with(['account', 'category'])
            ->where('user_id', $userId)
            ->get()
            ->map(function ($income) {
                return [
                    'id' => $income->id,
                    'type' => 'income',
                    'title' => $income->category?->name,
                    'account' => $income->account?->name,
                    'amount' => (float) $income->amount,
                    'date' => $income->received_at,
                ];
            });

        $expenses = Expense::with(['account', 'category'])
            ->where('user_id', $userId)
            ->get()
            ->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'type' => 'expense',
                    'title' => $expense->category?->name,
                    'account' => $expense->account?->name,
                    'amount' => (float) $expense->amount,
                    'date' => $expense->spent_at,
                ];
            });

        return $incomes
            ->merge($expenses)
            ->sortByDesc('date')
            ->take(10)
            ->values();
    }
    private function expenseBreakdown(int $userId)
    {
        return Expense::selectRaw('
                categories.name as category,
                SUM(expenses.amount) as amount
            ')
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->where('expenses.user_id', $userId)
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('amount')
            ->get();
    }

    private function monthlyCashFlow(int $userId)
    {
        $months = collect();

        for ($i = 11; $i >= 0; $i--) {

            $date = now()->subMonths($i);

            $income = Income::where('user_id', $userId)
                ->whereYear('received_at', $date->year)
                ->whereMonth('received_at', $date->month)
                ->sum('amount');

            $expense = Expense::where('user_id', $userId)
                ->whereYear('spent_at', $date->year)
                ->whereMonth('spent_at', $date->month)
                ->sum('amount');

            $months->push([
                'month' => $date->format('M'),
                'year' => $date->year,
                'income' => (float) $income,
                'expense' => (float) $expense,
                'net_cash_flow' => (float) ($income - $expense),
            ]);
        }

        return $months;
    }
}


