<?php

namespace App\Http\Controllers;

use App\Http\Requests\AccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\AccountService;
use Illuminate\Http\JsonResponse;

class AccountController extends Controller
{
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

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully.',
            'data' => new AccountResource($account),
        ], 201);
    }

    public function show(Account $account): JsonResponse
    {
        abort_if($account->user_id !== auth()->id(), 403);

        return response()->json([
            'success' => true,
            'data' => new AccountResource($account),
        ]);
    }

    public function update(AccountRequest $request, Account $account): JsonResponse
    {
        $account = $this->accountService->update(
            $account,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Account updated successfully.',
            'data' => new AccountResource($account),
        ]);
    }

    public function destroy(Account $account): JsonResponse
    {
        $this->accountService->delete($account);

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully.',
        ]);
    }
}