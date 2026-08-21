<?php

namespace App\Http\Controllers;

use App\Http\Requests\IncomeRequest;
use App\Http\Resources\IncomeResource;
use App\Models\Income;
use App\Services\IncomeService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class IncomeController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function __construct(
        private IncomeService $incomeService
    ) {}

    public function index()
    {
        $this->authorize(
            'viewAny',
            Income::class
        );

        return $this->success(
            IncomeResource::collection(
                $this->incomeService->index()
            )
        );
    }

    public function store(
        IncomeRequest $request
    ) {
        $this->authorize(
            'create',
            Income::class
        );

        $income = $this->incomeService->store(
            $request->validated()
        );

        return $this->success(
            new IncomeResource(
                $income->load([
                    'account',
                    'category',
                ])
            ),
            'Income created successfully.',
            201
        );
    }

    public function show(
        Income $income
    ) {
        $this->authorize(
            'view',
            $income
        );

        return $this->success(
            new IncomeResource(
                $income->load([
                    'account',
                    'category',
                ])
            ),
            'Income retrieved successfully.'
        );
    }

    public function update(
        IncomeRequest $request,
        Income $income
    ) {
        $this->authorize(
            'update',
            $income
        );

        $updatedIncome =
            $this->incomeService->update(
                $income,
                $request->validated()
            );

        return $this->success(
            new IncomeResource(
                $updatedIncome->load([
                    'account',
                    'category',
                ])
            ),
            'Income updated successfully.'
        );
    }

    public function destroy(
        Income $income
    ) {
        $this->authorize(
            'delete',
            $income
        );

        $this->incomeService->delete(
            $income
        );

        return $this->success(
            null,
            'Income deleted successfully.'
        );
    }
}