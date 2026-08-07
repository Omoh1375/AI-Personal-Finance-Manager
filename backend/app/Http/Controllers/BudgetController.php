<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Services\BudgetService;
use App\Traits\ApiResponse;

class BudgetController extends Controller
{
    use ApiResponse;

    public function __construct(
        private BudgetService $budgetService
    ) {}

    public function index()
    {
        return $this->success(
            BudgetResource::collection(
                $this->budgetService->index()
            )
        );
    }

    public function store(BudgetRequest $request)
    {
        return $this->success(
            new BudgetResource(
                $this->budgetService->store(
                    $request->validated()
                )
            ),
            'Budget created successfully.',
            201
        );
    }

    public function show(Budget $budget)
    {
        return $this->success(
            new BudgetResource(
                $this->budgetService->show($budget)
            )
        );
    }

    public function destroy(Budget $budget)
    {
        $this->budgetService->destroy($budget);

        return $this->success(
            null,
            'Budget deleted successfully.'
        );
    }
}