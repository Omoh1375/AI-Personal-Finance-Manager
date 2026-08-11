<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinancialInsightRequest;
use App\Http\Resources\FinancialInsightResource;
use App\Services\FinancialInsightService;
use App\Traits\ApiResponse;

class FinancialInsightController extends Controller
{
    use ApiResponse;

    public function __construct(
        private FinancialInsightService $financialInsightService
    ) {}

    public function index(
        FinancialInsightRequest $request
    )
    {
        $from = $request->input(
            'from',
            now()->startOfMonth()->toDateString()
        );

        $to = $request->input(
            'to',
            now()->endOfMonth()->toDateString()
        );

        return $this->success(

            new FinancialInsightResource(

                $this->financialInsightService->generate(
                    $from,
                    $to
                )

            )

        );
    }
}