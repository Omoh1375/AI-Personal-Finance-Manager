<?php

namespace App\Services;

use App\Models\Account;

class AccountBalanceService
{
    public function lock(int $accountId, int $userId): Account
    {
        return Account::where('id', $accountId)
            ->where('user_id', $userId)
            ->lockForUpdate()
            ->firstOrFail();
    }

    public function ensureSufficientBalance(
        Account $account,
        float $amount
    ): void {
        if ($account->balance < $amount) {
            abort(422, 'Insufficient balance.');
        }
    }

    public function deposit(
        Account $account,
        float $amount
    ): void {
        $account->increment('balance', $amount);
    }

    public function withdraw(
        Account $account,
        float $amount
    ): void {
        $this->ensureSufficientBalance(
            $account,
            $amount
        );

        $account->decrement('balance', $amount);
    }
}