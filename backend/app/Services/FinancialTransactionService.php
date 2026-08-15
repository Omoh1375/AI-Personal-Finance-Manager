<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Expense;
use App\Models\Income;
use App\Models\SavingsDeposit;
use App\Models\Transfer;
use Illuminate\Support\Str;

class FinancialTransactionService
{
    public function __construct(
        private AccountBalanceService $balances,
        private LedgerService $ledger
    ) {}

    public function ensureSufficientTransferBalance(
        Account $account,
        float $amount
    ): void {
        $this->balances->ensureSufficientBalance(
            $account,
            $amount
        );
    }

    public function income(
        Account $account,
        Income $income
    ): void {
        $amount = (float) $income->amount;

        $this->balances->deposit(
            $account,
            $amount
        );

        $this->ledger->income(
            account: $account,
            source: $income,
            amount: $amount,
            description: $income->description ?? 'Income',
            date: $income->received_at
        );
    }

    public function expense(
        Account $account,
        Expense $expense
    ): void {
        $amount = (float) $expense->amount;

        $this->balances->withdraw(
            $account,
            $amount
        );

        $this->ledger->expense(
            account: $account,
            source: $expense,
            amount: $amount,
            description: $expense->description ?? 'Expense',
            date: $expense->spent_at
        );
    }

    public function savingsDeposit(
        Account $account,
        SavingsDeposit $deposit
    ): void {
        $amount = (float) $deposit->amount;

        $this->balances->withdraw(
            $account,
            $amount
        );

        $this->ledger->saving(
            account: $account,
            source: $deposit,
            amount: $amount,
            description: $deposit->description ?? 'Savings Deposit',
            date: $deposit->deposited_at
        );
    }

    public function transfer(
        Account $from,
        Account $to,
        float $amount,
        Transfer $transfer
    ): void {
        if ($from->id === $to->id) {
            abort(
                422,
                'Source and destination accounts must be different.'
            );
        }

        $this->balances->ensureSufficientBalance(
            $from,
            $amount
        );

        $transactionUuid = Str::uuid()->toString();

        $this->balances->withdraw(
            $from,
            $amount
        );

        $this->ledger->transferOut(
            account: $from,
            source: $transfer,
            amount: $amount,
            description: 'Transfer to ' . $to->name,
            date: $transfer->transferred_at,
            transactionUuid: $transactionUuid
        );

        $this->balances->deposit(
            $to,
            $amount
        );

        $this->ledger->transferIn(
            account: $to,
            source: $transfer,
            amount: $amount,
            description: 'Transfer from ' . $from->name,
            date: $transfer->transferred_at,
            transactionUuid: $transactionUuid
        );
    }
}