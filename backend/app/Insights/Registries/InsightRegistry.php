<?php

namespace App\Insights\Registries;

use App\Insights\BudgetInsight;
use App\Insights\GoalInsight;
use App\Insights\SavingsInsight;
use App\Insights\SpendingInsight;

class InsightRegistry
{
    public function __construct(
        private SpendingInsight $spending,
        private SavingsInsight $savings,
        // private BudgetInsight $budget,
        private GoalInsight $goal,
    ) {}

    public function all(): array
    {
        return [

            $this->spending,

            $this->savings,

            // $this->budget,

            $this->goal,

        ];
    }
}