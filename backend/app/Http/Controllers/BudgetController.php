<?php

namespace App\Http\Controllers;

use App\Http\Requests\BudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use App\Services\BudgetService;
use App\Models\Account;
// use App\Services\BudgetService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class BudgetController extends Controller
{
    use AuthorizesRequests;
    use ApiResponse;

    public function __construct(
        private BudgetService $budgetService
    ) {}

    public function index()
    {
        $this->authorize('viewAny', Budget::class);
        return $this->success(
            BudgetResource::collection(
                $this->budgetService->index()
            )
        );
    }

    public function store(BudgetRequest $request)
    {
        $this->authorize('create', Budget::class);
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
        $this->authorize('view', $budget);
        return $this->success(
            new BudgetResource(
                $this->budgetService->show($budget)
            )
        );
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        $this->budgetService->destroy($budget);

        return $this->success(
            null,
            'Budget deleted successfully.'
        );
    }
}