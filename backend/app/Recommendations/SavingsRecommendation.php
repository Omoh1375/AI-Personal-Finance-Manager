<?php

namespace App\Recommendations;

use App\Recommendations\Contracts\RecommendationInterface;
use App\Models\Expense;
use App\Models\Income;
use Illuminate\Support\Facades\Auth;

class SavingsRecommendation implements RecommendationInterface
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

        $rate = (($income - $expenses) / $income) * 100;

        if ($rate >= 20) {
            return null;
        }

        return [

            'priority' => 'medium',

            'title' => 'Increase Savings',

            'message' =>
                'Try to save at least 20% of your income to improve long-term financial stability.',

        ];
    }
}