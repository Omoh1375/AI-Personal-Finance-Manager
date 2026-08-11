<?php

namespace App\Http\Controllers;

use App\Http\Requests\ExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Services\ExpenseService;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ExpenseService $expenseService
    ) {}

    public function index()
    {
        return $this->success(
            ExpenseResource::collection(
                $this->expenseService->index()
            )
        );
    }

    public function store(ExpenseRequest $request)
    {
        $expense = $this->expenseService->create(
                $request->validated()
        );

        return $this->success(
            new ExpenseResource($expense),
            'Expense created successfully.',
            201
        );
    }

    public function show(Expense $expense)
    {
        abort_if(
            $expense->user_id !== Auth::id(),
            403
        );

        return $this->success(
            new ExpenseResource(
                $expense->load(['account', 'category'])
            )
        );
    }

    public function destroy(Expense $expense)
    {
        $this->expenseService->delete($expense);

        return $this->success(
            null,
            'Expense deleted successfully.'
        );
    }
}