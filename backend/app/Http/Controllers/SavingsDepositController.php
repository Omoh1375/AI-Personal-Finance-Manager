<?php

namespace App\Http\Controllers;

use App\Http\Requests\SavingsDepositRequest;
use App\Http\Resources\SavingsDepositResource;
use App\Models\SavingsDeposit;
use App\Services\SavingsDepositService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SavingsDepositController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function __construct(
        private SavingsDepositService $savingsDepositService
    ) {}

    public function index()
    {
        $this->authorize(
            'viewAny',
            SavingsDeposit::class
        );

        return $this->success(
            SavingsDepositResource::collection(
                $this->savingsDepositService->index()
            )
        );
    }

    public function store(
        SavingsDepositRequest $request
    ) {
        $this->authorize(
            'create',
            SavingsDeposit::class
        );

        $deposit = $this->savingsDepositService->store(
            $request->validated()
        );

        return $this->success(
            new SavingsDepositResource($deposit),
            'Savings deposit created successfully.',
            201
        );
    }

    public function show(
        SavingsDeposit $savingsDeposit
    ) {
        $this->authorize(
            'view',
            $savingsDeposit
        );

        return $this->success(
            new SavingsDepositResource(
                $this->savingsDepositService->show(
                    $savingsDeposit
                )
            )
        );
    }

    public function destroy(
        SavingsDeposit $savingsDeposit
    ) {
        $this->authorize(
            'delete',
            $savingsDeposit
        );

        $this->savingsDepositService->destroy(
            $savingsDeposit
        );

        return $this->success(
            null,
            'Savings deposit deleted successfully.'
        );
    }
}