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

    public function income(
        Account $account,
        Income $income
    ): void {

        $this->balances->deposit(
            $account,
            $income->amount
        );

        $this->ledger->credit(
            account: $account,
            source: $income,
            amount: $income->amount,
            description: $income->description ?? 'Income',
            date: $income->received_at
        );
    }

    public function expense(
        Account $account,
        Expense $expense
    ): void {

        $this->balances->withdraw(
            $account,
            $expense->amount
        );

        $this->ledger->debit(
            account: $account,
            source: $expense,
            amount: $expense->amount,
            description: $expense->description ?? 'Expense',
            date: $expense->spent_at
        );
    }

    public function savingsDeposit(
        Account $account,
        SavingsDeposit $deposit
    ): void {

        $this->balances->withdraw(
            $account,
            $deposit->amount
        );

        $this->ledger->debit(
            account: $account,
            source: $deposit,
            amount: $deposit->amount,
            description: $deposit->description ?? 'Savings Deposit',
            date: $deposit->deposited_at
        );
    }

    public function transfer(
        Account $from,
        Account $to,
        Transfer $transfer
    ): void {

        if ($from->id === $to->id) {
            abort(422, 'Source and destination accounts must be different.');
        }

        $transactionUuid = Str::uuid()->toString();

        $this->balances->withdraw(
            $from,
            $transfer->amount
        );

        $this->ledger->debit(
            account: $from,
            source: $transfer,
            amount: $transfer->amount,
            description: 'Transfer to ' . $to->name,
            date: $transfer->transferred_at,
            transactionUuid: $transactionUuid
        );

        $this->balances->deposit(
            $to,
            $transfer->amount
        );

        $this->ledger->credit(
            account: $to,
            source: $transfer,
            amount: $transfer->amount,
            description: 'Transfer from ' . $from->name,
            date: $transfer->transferred_at,
            transactionUuid: $transactionUuid
        );
    }
}