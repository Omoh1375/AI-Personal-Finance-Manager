<?php

namespace App\Services;

use App\Models\Account;

class FinancialTransactionService
{
    public function __construct(
        private AccountBalanceService $balances
    ) {}

    public function transfer(
        Account $from,
        Account $to,
        float $amount
    ): void {

        if ($from->id === $to->id) {
            abort(422, 'Source and destination accounts must be different.');
        }

        $this->balances->withdraw(
            $from,
            $amount
        );

        $this->balances->deposit(
            $to,
            $amount
        );
    }

    public function income(
        Account $account,
        float $amount
    ): void {

        $this->balances->deposit(
            $account,
            $amount
        );
    }

    public function expense(
        Account $account,
        float $amount
    ): void {

        $this->balances->withdraw(
            $account,
            $amount
        );
    }

    public function savingsDeposit(
        Account $account,
        float $amount
    ): void {

        $this->balances->withdraw(
            $account,
            $amount
        );
    }
}