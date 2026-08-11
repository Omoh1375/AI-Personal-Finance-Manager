<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Traits\ApiResponse;
// use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    use AuthorizesRequests, ApiResponse;

    public function __construct(
        private AccountService $accountService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => AccountResource::collection(
                $this->accountService->index()
            ),
        ]);
    }

    public function store(AccountRequest $request): JsonResponse
    {
        $account = $this->accountService->store(
            $request->validated()
        );

         return $this->success(
                new AccountResource($account),
                'Account created successfully.',
                201
            );
    }

    public function show(Account $account): JsonResponse
{
    $this->authorize('view', $account);

    return $this->success(
        new AccountResource($account),
        'Account retrieved successfully.'
    );
}

public function update(
    AccountRequest $request,
    Account $account
): JsonResponse {

    $this->authorize('update', $account);

    $account = $this->accountService->update(
        $account,
        $request->validated()
    );

    return $this->success(
        new AccountResource($account),
        'Account updated successfully.'
    );
}

public function destroy(Account $account): JsonResponse
{
    $this->authorize('delete', $account);

    $this->accountService->delete($account);

    return $this->success(
        null,
        'Account deleted successfully.'
    );
}
}