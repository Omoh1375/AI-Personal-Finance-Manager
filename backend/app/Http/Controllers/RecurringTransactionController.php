<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecurringTransactionRequest;
use App\Http\Resources\RecurringTransactionResource;
use App\Models\RecurringTransaction;
use App\Services\RecurringTransactionService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class RecurringTransactionController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function __construct(
        private RecurringTransactionService $service
    ) {}

    public function index()
    {
        $this->authorize('viewAny', RecurringTransaction::class);

        return $this->success(
            RecurringTransactionResource::collection(
                $this->service->index()
            )
        );
    }

    public function store(
        RecurringTransactionRequest $request
    )
    {
        $this->authorize('create', RecurringTransaction::class);
        return $this->success(
            new RecurringTransactionResource(
                $this->service->store(
                    $request->validated()
                )
            ),
            'Recurring transaction created successfully.',
            201
        );
    }

    public function show(
        RecurringTransaction $recurringTransaction
    )
    {
        $this->authorize('view', $recurringTransaction);
        return $this->success(
            new RecurringTransactionResource(
                $this->service->show(
                    $recurringTransaction
                )
            )
        );
    }

    public function update(
        RecurringTransactionRequest $request,
        RecurringTransaction $recurringTransaction
    )
    {
        $this->authorize('update', $recurringTransaction);
        return $this->success(
            new RecurringTransactionResource(
                $this->service->update(
                    $recurringTransaction,
                    $request->validated()
                )
            ),
            'Recurring transaction updated successfully.'
        );
    }

    public function destroy(
        RecurringTransaction $recurringTransaction
    )
    {
        $this->authorize('delete', $recurringTransaction);
        $this->service->destroy(
            $recurringTransaction
        );

        return $this->success(
            null,
            'Recurring transaction deleted successfully.'
        );
    }
}