<?php

namespace App\Services;

use App\Recommendations\Registries\RecommendationRegistry;

class RecommendationService
{
    public function __construct(
        private RecommendationRegistry $registry
    ) {}

    public function generate(
        string $from,
        string $to
    ): array {

        return collect(
            $this->registry->all()
        )
        ->map(fn ($recommendation) => $recommendation->generate($from, $to))
        ->filter()
        ->values()
        ->all();
    }
}