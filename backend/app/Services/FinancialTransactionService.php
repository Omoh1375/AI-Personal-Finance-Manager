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

    /**
     * Ensure an account has enough balance for a transfer.
     */
    public function ensureSufficientTransferBalance(
        Account $account,
        float $amount
    ): void {
        $this->balances->ensureSufficientBalance(
            $account,
            $amount
        );
    }

    /**
     * Process an income transaction.
     */
    public function income(
        Account $account,
        Income $income
    ): void {

        $this->balances->deposit(
            $account,
            (float) $income->amount
        );

        $this->ledger->credit(
            account: $account,
            source: $income,
            amount: (float) $income->amount,
            description: $income->description ?? 'Income',
            date: $income->received_at
        );
    }

    /**
     * Process an expense transaction.
     */
    public function expense(
        Account $account,
        Expense $expense
    ): void {

        $this->balances->withdraw(
            $account,
            (float) $expense->amount
        );

        $this->ledger->debit(
            account: $account,
            source: $expense,
            amount: (float) $expense->amount,
            description: $expense->description ?? 'Expense',
            date: $expense->spent_at
        );
    }

    /**
     * Process a savings deposit.
     */
    public function savingsDeposit(
        Account $account,
        SavingsDeposit $deposit
    ): void {

        $this->balances->withdraw(
            $account,
            (float) $deposit->amount
        );

        $this->ledger->debit(
            account: $account,
            source: $deposit,
            amount: (float) $deposit->amount,
            description: $deposit->description ?? 'Savings Deposit',
            date: $deposit->deposited_at
        );
    }

    /**
     * Process an account-to-account transfer.
     */
    public function transfer(
        Account $from,
        Account $to,
        float $amount,
        Transfer $transfer
    ): void {

        if ($from->id === $to->id) {
            abort(422, 'Source and destination accounts must be different.');
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

        $this->ledger->debit(
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

        $this->ledger->credit(
            account: $to,
            source: $transfer,
            amount: $amount,
            description: 'Transfer from ' . $from->name,
            date: $transfer->transferred_at,
            transactionUuid: $transactionUuid
        );
    }
}