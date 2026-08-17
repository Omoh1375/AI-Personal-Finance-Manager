<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Ledger;
use Carbon\Carbon;

class StatementService
{
    public function generate(
        int $accountId,
        string $from,
        string $to
    ): array {
        $account = $this->findAccount($accountId);

        $fromDate = Carbon::parse($from)->startOfDay();
        $toDate = Carbon::parse($to)->endOfDay();

        $transactions = $this->getTransactions(
            $account,
            $fromDate,
            $toDate
        );

        $openingBalance = $this->getOpeningBalance(
            $account,
            $fromDate
        );

        /*
        |--------------------------------------------------------------------------
        | Ledger types
        |--------------------------------------------------------------------------
        |
        | income       = money entering the account
        | transfer_in  = money entering the account
        | refund       = money entering the account
        |
        | expense      = money leaving the account
        | transfer_out = money leaving the account
        | saving       = money leaving the account
        | adjustment   = handled according to its balance_after
        |
        */

        $credits = $transactions
            ->whereIn('type', [
                'income',
                'transfer_in',
                'refund',
            ])
            ->sum('amount');

        $debits = $transactions
            ->whereIn('type', [
                'expense',
                'transfer_out',
                'saving',
            ])
            ->sum('amount');

        return [
            'account' => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'currency' => $account->currency,
            ],

            'period' => [
                'from' => $fromDate->toDateString(),
                'to' => $toDate->toDateString(),
            ],

            'opening_balance' => (float) $openingBalance,

            'total_credits' => (float) $credits,

            'total_debits' => (float) $debits,

            'closing_balance' => (float) (
                $openingBalance
                + $credits
                - $debits
            ),

            'transactions' => $transactions->values(),
        ];
    }

    private function findAccount(
        int $accountId
    ): Account {
        return Account::where('id', $accountId)
            ->where(
                'user_id',
                auth()->user()->id
            )
            ->firstOrFail();
    }

    private function getTransactions(
        Account $account,
        Carbon $from,
        Carbon $to
    ) {
        return Ledger::where(
                'account_id',
                $account->id
            )
            ->whereBetween(
                'transaction_date',
                [
                    $from,
                    $to,
                ]
            )
            ->orderBy('transaction_date')
            ->get();
    }

    private function getOpeningBalance(
        Account $account,
        Carbon $from
    ): float {
        $previous = Ledger::where(
                'account_id',
                $account->id
            )
            ->where(
                'transaction_date',
                '<',
                $from
            )
            ->latest('transaction_date')
            ->first();

        /*
        |--------------------------------------------------------------------------
        | If there is no previous ledger entry, use
        | the account's balance as the fallback.
        |--------------------------------------------------------------------------
        */

        return $previous
            ? (float) $previous->balance_after
            : 0.0;
    }
}