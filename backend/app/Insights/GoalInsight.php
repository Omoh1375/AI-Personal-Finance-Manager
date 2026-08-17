<?php

namespace App\Insights;

use App\Models\SavingsGoal;
use Illuminate\Support\Facades\Auth;
use App\Insights\Contracts\InsightInterface;

class GoalInsight implements InsightInterface
{
    public function generate(
        string $from,
        string $to
    ): array {
        $goal = SavingsGoal::with('deposits')
            ->where('user_id', Auth::id())
            ->latest()
            ->first();

        if (! $goal) {
            return [
                'type' => 'info',
                'title' => 'Savings Goal',
                'message' => 'No savings goal found.',
            ];
        }

        $saved = (float) $goal->deposits->sum('amount');

        $target = (float) $goal->target_amount;

        $remaining = max(
            0,
            $target - $saved
        );

        $percentage = $target > 0
            ? round(
                ($saved / $target) * 100,
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

            'message' =>
                "{$goal->name} is {$percentage}% completed.",

            'target_amount' => $target,

            'current_amount' => $saved,

            'remaining' => (float) $remaining,

            'percentage' => $percentage,
        ];
    }
}