<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Traits\ApiResponse;
use App\Http\Resources\DashboardResource;
class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private DashboardService $dashboardService
    ) {}

    public function index()
    {
        return $this->success(
            new DashboardResource(
                $this->dashboardService->getDashboardData()
            )
        );
    }
}