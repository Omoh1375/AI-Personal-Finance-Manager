<?php

namespace App\Recommendations;

use App\Models\SavingsGoal;
use App\Recommendations\Contracts\RecommendationInterface;
use Illuminate\Support\Facades\Auth;

class GoalRecommendation implements RecommendationInterface
{
    public function generate(
        string $from,
        string $to
    ): ?array {

        $goal = SavingsGoal::where('user_id', Auth::id())
            ->where('is_completed', false)
            ->latest()
            ->first();

        if (! $goal) {
            return null;
        }

        if ($goal->target_amount <= 0) {
            return null;
        }

        $percentage = ($goal->current_amount / $goal->target_amount) * 100;

        if ($percentage < 75) {
            return null;
        }

        return [

            'priority' => 'low',

            'title' => 'Finish Your Savings Goal',

            'message' =>
                "You're " .
                round($percentage, 2) .
                "% towards '{$goal->name}'. Keep the momentum going!",

        ];
    }
}