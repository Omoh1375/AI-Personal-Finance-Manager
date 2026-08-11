<?php

namespace App\Services;

use App\Insights\Registries\InsightRegistry;

class FinancialInsightService
{
    public function __construct(
        private InsightRegistry $registry
    ) {}

    public function generate(
        string $from,
        string $to
    ): array {

        return collect(

            $this->registry->all()

        )->map(

            fn ($insight) => $insight->generate(
                $from,
                $to
            )

        )->values()->all();
    }
}