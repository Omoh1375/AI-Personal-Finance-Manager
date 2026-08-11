<?php

namespace App\Services;

use App\Reports\CategorySpendingReport;
use App\Reports\FinancialSummaryReport;

class ReportService
{
    public function __construct(
        private FinancialSummaryReport $summaryReport,
        private CategorySpendingReport $categoryReport
    ) {}

    public function financialSummary(
        string $from,
        string $to
    ): array {

        return $this->summaryReport->generate(
            $from,
            $to
        );
    }

    public function categorySpending(
        string $from,
        string $to
    ): array {

        return $this->categoryReport->generate(
            $from,
            $to
        );
    }
}