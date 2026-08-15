<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Ledger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LedgerService
{
    public function income(
        Account $account,
        Model $source,
        float $amount,
        string $description,
        ?string $date = null,
        ?string $transactionUuid = null
    ): Ledger {
        return $this->createEntry(
            account: $account,
            source: $source,
            type: 'income',
            amount: $amount,
            description: $description,
            date: $date,
            transactionUuid: $transactionUuid
        );
    }

    public function expense(
        Account $account,
        Model $source,
        float $amount,
        string $description,
        ?string $date = null,
        ?string $transactionUuid = null
    ): Ledger {
        return $this->createEntry(
            account: $account,
            source: $source,
            type: 'expense',
            amount: $amount,
            description: $description,
            date: $date,
            transactionUuid: $transactionUuid
        );
    }

    public function saving(
        Account $account,
        Model $source,
        float $amount,
        string $description,
        ?string $date = null,
        ?string $transactionUuid = null
    ): Ledger {
        return $this->createEntry(
            account: $account,
            source: $source,
            type: 'saving',
            amount: $amount,
            description: $description,
            date: $date,
            transactionUuid: $transactionUuid
        );
    }

    public function transferOut(
        Account $account,
        Model $source,
        float $amount,
        string $description,
        ?string $date = null,
        ?string $transactionUuid = null
    ): Ledger {
        return $this->createEntry(
            account: $account,
            source: $source,
            type: 'transfer_out',
            amount: $amount,
            description: $description,
            date: $date,
            transactionUuid: $transactionUuid
        );
    }

    public function transferIn(
        Account $account,
        Model $source,
        float $amount,
        string $description,
        ?string $date = null,
        ?string $transactionUuid = null
    ): Ledger {
        return $this->createEntry(
            account: $account,
            source: $source,
            type: 'transfer_in',
            amount: $amount,
            description: $description,
            date: $date,
            transactionUuid: $transactionUuid
        );
    }

    private function createEntry(
        Account $account,
        Model $source,
        string $type,
        float $amount,
        string $description,
        ?string $date = null,
        ?string $transactionUuid = null
    ): Ledger {
        return Ledger::create([
            'user_id' => $account->user_id,
            'account_id' => $account->id,

            'ledgerable_type' => $source::class,
            'ledgerable_id' => $source->id,

            'type' => $type,

            'amount' => $amount,

            'balance_after' => $account->fresh()->balance,

            'description' => $description,

            'transaction_date' => $date ?? now(),

            'transaction_uuid' =>
                $transactionUuid ?? Str::uuid()->toString(),
        ]);
    }
}