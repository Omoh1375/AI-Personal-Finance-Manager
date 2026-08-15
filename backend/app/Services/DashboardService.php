<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Expense;
use App\Models\Income;
use App\Models\Transfer;
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
                ->whereMonth(
                    'received_at',
                    $currentMonth->month
                )
                ->whereYear(
                    'received_at',
                    $currentMonth->year
                )
                ->sum('amount'),

            'monthly_expenses' => Expense::where('user_id', $userId)
                ->whereMonth(
                    'spent_at',
                    $currentMonth->month
                )
                ->whereYear(
                    'spent_at',
                    $currentMonth->year
                )
                ->sum('amount'),

            'accounts' => $this->accountAnalytics($userId),

            'recent_transactions' => $this->recentTransactions($userId),

            'expense_breakdown' => $this->expenseBreakdown($userId),

            'monthly_cash_flow' => $this->monthlyCashFlow($userId),

            'savings_rate' => $this->savingsRate($userId),

            'top_spending_categories' => $this->topSpendingCategories($userId),

            'account_analytics' => $this->accountAnalytics($userId),
        ];
    }

    private function recentTransactions(int $userId)
    {
        $incomes = Income::with([
                'account',
                'category',
            ])
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
            })
            ->all();

        $expenses = Expense::with([
                'account',
                'category',
            ])
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
            })
            ->all();

        $transfers = Transfer::with([
                'fromAccount',
                'toAccount',
            ])
            ->where('user_id', $userId)
            ->get()
            ->map(function ($transfer) {
                return [
                    'id' => $transfer->id,
                    'type' => 'transfer',
                    'title' => 'Transfer',
                    'account' =>
                        ($transfer->fromAccount?->name ?? 'Account') .
                        ' → ' .
                        ($transfer->toAccount?->name ?? 'Account'),
                    'amount' => (float) $transfer->amount,
                    'date' => $transfer->transferred_at,
                ];
            })
            ->all();

        return collect()
            ->merge($incomes)
            ->merge($expenses)
            ->merge($transfers)
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
            ->join(
                'categories',
                'expenses.category_id',
                '=',
                'categories.id'
            )
            ->where('expenses.user_id', $userId)
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->orderByDesc('amount')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'amount' => (float) $item->amount,
                ];
            });
    }

    private function monthlyCashFlow(int $userId)
    {
        $months = collect();

        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);

            $income = Income::where('user_id', $userId)
                ->whereYear(
                    'received_at',
                    $date->year
                )
                ->whereMonth(
                    'received_at',
                    $date->month
                )
                ->sum('amount');

            $expense = Expense::where('user_id', $userId)
                ->whereYear(
                    'spent_at',
                    $date->year
                )
                ->whereMonth(
                    'spent_at',
                    $date->month
                )
                ->sum('amount');

            $months->push([
                'month' => $date->format('M'),
                'year' => $date->year,
                'income' => (float) $income,
                'expense' => (float) $expense,
                'net_cash_flow' =>
                    (float) ($income - $expense),
            ]);
        }

        return $months;
    }

    private function savingsRate(int $userId): float
    {
        $totalIncome = Income::where('user_id', $userId)
            ->sum('amount');

        $totalExpenses = Expense::where('user_id', $userId)
            ->sum('amount');

        if ($totalIncome <= 0) {
            return 0.0;
        }

        return round(
            (
                ($totalIncome - $totalExpenses)
                / $totalIncome
            ) * 100,
            2
        );
    }

    private function topSpendingCategories(int $userId)
    {
        $totalExpenses = Expense::where('user_id', $userId)
            ->sum('amount');

        if ($totalExpenses <= 0) {
            return collect();
        }

        return Expense::selectRaw('
                categories.name as category,
                SUM(expenses.amount) as amount
            ')
            ->join(
                'categories',
                'expenses.category_id',
                '=',
                'categories.id'
            )
            ->where('expenses.user_id', $userId)
            ->groupBy(
                'categories.id',
                'categories.name'
            )
            ->orderByDesc('amount')
            ->get()
            ->map(function ($item) use ($totalExpenses) {
                $amount = (float) $item->amount;

                return [
                    'category' => $item->category,
                    'amount' => $amount,
                    'percentage' => round(
                        ($amount / $totalExpenses) * 100,
                        2
                    ),
                ];
            })
            ->values();
    }

    private function accountAnalytics(int $userId)
    {
        return Account::where('user_id', $userId)
            ->get()
            ->map(function ($account) {
                $income = Income::where(
                    'account_id',
                    $account->id
                )->sum('amount');

                $expenses = Expense::where(
                    'account_id',
                    $account->id
                )->sum('amount');

                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'type' => $account->type,
                    'balance' => (float) $account->balance,
                    'income' => (float) $income,
                    'expenses' => (float) $expenses,
                    'transactions' =>
                        $account->incomes()->count()
                        + $account->expenses()->count(),
                ];
            })
            ->values();
    }
}