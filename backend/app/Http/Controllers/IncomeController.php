<?php

namespace App\Http\Controllers;

use App\Http\Requests\IncomeRequest;
use App\Http\Resources\IncomeResource;
use App\Models\Income;
use App\Services\IncomeService;
use App\Traits\ApiResponse;

class IncomeController extends Controller
{
    use ApiResponse;

    public function __construct(
        private IncomeService $incomeService
    ) {}

    public function index()
    {
        return $this->success(
            IncomeResource::collection(
                $this->incomeService->index()
            )
        );
    }

    public function store(IncomeRequest $request)
    {
        $income = $this->incomeService->store(
            $request->validated()
        );

        return $this->success(
            new IncomeResource($income),
            'Income created successfully.',
            201
        );
    }

    public function show(Income $income)
    {
        abort_if($income->user_id !== auth()->id(), 403);

        return $this->success(
            new IncomeResource(
                $income->load(['account', 'category'])
            )
        );
    }

    public function destroy(Income $income)
    {
        $this->incomeService->delete($income);

        return $this->success(
            null,
            'Income deleted successfully.'
        );
    }
}