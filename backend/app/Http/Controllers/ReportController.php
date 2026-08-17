<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Http\Resources\ReportResource;
use App\Services\ReportService;
use App\Traits\ApiResponse;

class ReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ReportService $reportService
    ) {}

    public function index(
        ReportRequest $request
    ) {
        $from = $request
            ->string('from')
            ->toString();

        $to = $request
            ->string('to')
            ->toString();

        return match (
            $request->get(
                'type',
                'summary'
            )
        ) {
            'category' => $this->success(
                new ReportResource(
                    $this->reportService
                        ->categorySpending(
                            $from,
                            $to
                        )
                )
            ),

            default => $this->success(
                new ReportResource(
                    $this->reportService
                        ->financialSummary(
                            $from,
                            $to
                        )
                )
            ),
        };
    }
}