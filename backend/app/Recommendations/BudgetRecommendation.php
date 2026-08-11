<?php

namespace App\Recommendations;

use App\Models\Budget;
use App\Models\Expense;
use App\Recommendations\Contracts\RecommendationInterface;
use Illuminate\Support\Facades\Auth;

class BudgetRecommendation implements RecommendationInterface
{
    public function generate(
        string $from,
        string $to
    ): ?array {

        $budget = Budget::with('category')
            ->where('user_id', Auth::id())
            ->where('is_active', true)
            ->latest()
            ->first();

        if (! $budget) {
            return null;
        }

        $spent = Expense::where('user_id', Auth::id())
            ->where('category_id', $budget->category_id)
            ->whereBetween('spent_at', [
                $budget->start_date,
                $budget->end_date,
            ])
            ->sum('amount');

        if ($budget->amount <= 0) {
            return null;
        }

        $percentage = ($spent / $budget->amount) * 100;

        if ($percentage < 80) {
            return null;
        }

        return [

            'priority' => $percentage >= 100
                ? 'high'
                : 'medium',

            'title' => 'Budget Alert',

            'message' =>
                "{$budget->category->name} budget has reached " .
                round($percentage, 2) .
                "% utilization.",

        ];
    }
}