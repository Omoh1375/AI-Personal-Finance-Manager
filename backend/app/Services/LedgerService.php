<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Ledger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LedgerService
{
    public function credit(
    Account $account,
    Model $source,
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

            'entry_type' => 'credit',

            'amount' => $amount,

            'balance_after' => $account->fresh()->balance,

            'description' => $description,

            'transaction_date' => $date ?? now(),
            'transaction_uuid' => $transactionUuid ?? Str::uuid()->toString(),

        ]);
    }

    public function debit(
        Account $account,
        Model $source,
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

            'entry_type' => 'debit',

            'amount' => $amount,

            'balance_after' => $account->fresh()->balance,

            'description' => $description,

            'transaction_date' => $date ?? now(),
            'transaction_uuid' => $transactionUuid ?? Str::uuid()->toString(),

        ]);
    }
}