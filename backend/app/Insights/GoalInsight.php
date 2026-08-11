<?php

namespace App\Insights;

use App\Models\SavingsGoal;
use App\Models\Income;
use App\Models\Expense;
use Illuminate\Support\Facades\Auth;
use App\Insights\Contracts\InsightInterface;

class SpendingInsight implements InsightInterface
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

        if ($income <= 0) {

            return [
                'type' => 'info',
                'title' => 'No Income',
                'message' => 'No income has been recorded for the selected period.',
            ];
        }

        $percentage = round(
            ($expenses / $income) * 100,
            2
        );

        if ($percentage >= 100) {

            return [
                'type' => 'danger',
                'title' => 'Overspending',
                'message' => "You spent {$percentage}% of your income during this period.",
            ];
        }

        if ($percentage >= 80) {

            return [
                'type' => 'warning',
                'title' => 'High Spending',
                'message' => "You spent {$percentage}% of your income during this period.",
            ];
        }

        return [
            'type' => 'success',
            'title' => 'Healthy Spending',
            'message' => "You spent {$percentage}% of your income during this period.",
        ];
    }
}

class GoalInsight implements InsightInterface
{
    public function generate(
        string $from,
        string $to
    ): array
    {
        $goal = SavingsGoal::where('user_id', Auth::id())
            ->latest()
            ->first();

        if (! $goal) {

            return [

                'type' => 'info',

                'title' => 'Savings Goal',

                'message' => 'No savings goal found.',

            ];
        }

        $percentage = $goal->target_amount > 0
            ? round(
                ($goal->current_amount / $goal->target_amount) * 100,
                2
            )
            : 0;

        return [

            'type' => match (true) {

                $percentage >= 100 => 'success',

                $percentage >= 75 => 'info',

                default => 'warning',

            },

            'title' => 'Savings Goal',

            'message' => "{$goal->name} is {$percentage}% completed.",

            'target_amount' => (float) $goal->target_amount,

            'current_amount' => (float) $goal->current_amount,

            'remaining' => (float) max(
                0,
                $goal->target_amount - $goal->current_amount
            ),

            'percentage' => $percentage,

        ];
    }
}