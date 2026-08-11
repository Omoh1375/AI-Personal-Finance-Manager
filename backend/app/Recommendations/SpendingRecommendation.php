<?php

namespace App\Recommendations;

use App\Recommendations\Contracts\RecommendationInterface;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Support\Facades\Auth;

class SpendingRecommendation implements RecommendationInterface
{
    public function generate(
        string $from,
        string $to
    ): ?array {

        $userId = Auth::id();

        $income = Income::where('user_id', $userId)
            ->whereBetween('received_at', [$from, $to])
            ->sum('amount');

        if ($income <= 0) {
            return null;
        }

        $expenses = Expense::where('user_id', $userId)
            ->whereBetween('spent_at', [$from, $to])
            ->sum('amount');

        $ratio = ($expenses / $income) * 100;

        if ($ratio < 80) {
            return null;
        }

        return [

            'priority' => 'high',

            'title' => 'Reduce Spending',

            'message' =>
                'Your expenses are consuming more than 80% of your income. Review your discretionary spending.',

        ];
    }
}