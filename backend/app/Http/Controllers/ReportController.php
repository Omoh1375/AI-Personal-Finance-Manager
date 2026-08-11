<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReportRequest;
use App\Http\Resources\ReportResource;
use App\Services\ReportService;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    protected function success($data, int $status = 200)
    {
        return response()->json(['data' => $data], $status);
    }

    public function index(ReportRequest $request)
    {
        $from = $request->string('from')->toString();
        $to = $request->string('to')->toString();

        return match ($request->get('type', 'summary')) {

            'category' => $this->success(
                new ReportResource(
                    $this->reportService->categorySpending(
                        $from,
                        $to
                    )
                )
            ),

            default => $this->success(
                new ReportResource(
                    $this->reportService->financialSummary(
                        $from,
                        $to
                    )
                )
            ),

        };
    }
}

namespace App\Services;

if (!class_exists(ReportService::class)) {
    class ReportService
    {
        public function generate($from, $to)
        {
            return [];
        }
    }
}


