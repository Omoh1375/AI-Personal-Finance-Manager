<?php

namespace App\Http\Controllers;

use App\Http\Requests\SavingsGoalRequest;
use App\Http\Resources\SavingsGoalResource;
use App\Models\SavingsGoal;
use App\Services\SavingsGoalService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SavingsGoalController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function __construct(
        private SavingsGoalService $savingsGoalService
    ) {}

    public function index()
    {
        $this->authorize(
            'viewAny',
            SavingsGoal::class
        );

        return $this->success(
            SavingsGoalResource::collection(
                $this->savingsGoalService->index()
            )
        );
    }

    public function store(
        SavingsGoalRequest $request
    ) {
        $this->authorize(
            'create',
            SavingsGoal::class
        );

        $goal = $this->savingsGoalService->store(
            $request->validated()
        );

        return $this->success(
            new SavingsGoalResource($goal),
            'Savings goal created successfully.',
            201
        );
    }

    public function show(
        SavingsGoal $savingsGoal
    ) {
        $this->authorize(
            'view',
            $savingsGoal
        );

        return $this->success(
            new SavingsGoalResource(
                $this->savingsGoalService->show(
                    $savingsGoal
                )
            )
        );
    }

    public function destroy(
        SavingsGoal $savingsGoal
    ) {
        $this->authorize(
            'delete',
            $savingsGoal
        );

        $this->savingsGoalService->delete(
            $savingsGoal
        );

        return $this->success(
            null,
            'Savings goal deleted successfully.'
        );
    }
}