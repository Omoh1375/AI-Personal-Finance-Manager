<?php

namespace App\Insights;

use App\Models\Expense;
use App\Models\Income;
use Illuminate\Support\Facades\Auth;
use App\Insights\Contracts\InsightInterface;

class SavingsInsight implements InsightInterface
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
                'title' => 'Savings Rate',
                'message' =>
                    'No income recorded for this period.',
                'rate' => 0,
            ];
        }

        $rate = round(
            (($income - $expenses) / $income) * 100,
            2
        );

        return [
            'type' => $rate >= 20
                ? 'success'
                : 'warning',

            'title' => 'Savings Rate',

            'message' =>
                "You saved {$rate}% of your income during this period.",

            'rate' => $rate,
        ];
    }
}