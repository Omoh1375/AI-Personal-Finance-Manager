<?php

namespace App\Insights;

use App\Models\Expense;
use App\Models\Income;
use Illuminate\Support\Facades\Auth;

class SpendingInsight
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