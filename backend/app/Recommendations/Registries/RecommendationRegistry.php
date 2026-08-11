<?php

namespace App\Recommendations\Registries;

use App\Recommendations\BudgetRecommendation;
use App\Recommendations\GoalRecommendation;
use App\Recommendations\SavingsRecommendation;
use App\Recommendations\SpendingRecommendation;

class RecommendationRegistry
{
    public function __construct(
        private SpendingRecommendation $spending,
        private SavingsRecommendation $savings,
        private BudgetRecommendation $budget,
        private GoalRecommendation $goal,
    ) {}

    public function all(): array
    {
        return [

            $this->spending,

            $this->savings,

            $this->budget,

            $this->goal,

        ];
    }
}