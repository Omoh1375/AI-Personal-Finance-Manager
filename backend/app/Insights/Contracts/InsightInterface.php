<?php

namespace App\Insights\Contracts;

interface InsightInterface
{
    public function generate(
        string $from,
        string $to
    ): array;
}