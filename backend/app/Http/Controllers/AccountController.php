<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    use ApiResponse;

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
        abort_if($account->user_id !== Auth::id(), 403);

        return $this->success(
            new AccountResource($account),
            'Account retrieved successfully.',
            200
        );
    }

    public function update(AccountRequest $request, Account $account): JsonResponse
    {
        $account = $this->accountService->update(
            $account,
            $request->validated()
        );

        return $this->success(
            new AccountResource($account),
            'Account updated successfully.',
            200
        );
    }

    public function destroy(Account $account): JsonResponse
    {
        $this->accountService->delete($account);

        return $this->success(
            null,
            'Account deleted successfully.',
            200
        );
    }
}