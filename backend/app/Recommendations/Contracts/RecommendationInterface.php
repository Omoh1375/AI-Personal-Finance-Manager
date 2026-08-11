<?php

namespace App\Recommendations\Contracts;

interface RecommendationInterface
{
    public function generate(
        string $from,
        string $to
    ): ?array;
}