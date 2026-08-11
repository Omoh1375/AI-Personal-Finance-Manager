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

        $credits = $transactions
            ->where('entry_type', 'credit')
            ->sum('amount');

        $debits = $transactions
            ->where('entry_type', 'debit')
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
                $openingBalance +
                $credits -
                $debits
            ),

            'transactions' => $transactions->values(),

        ];
    }

    private function findAccount(
        int $accountId
    ): Account {

        return Account::where('id', $accountId)
            ->where('user_id', auth()->user()->id)
            ->firstOrFail();
    }

    private function getTransactions(
        Account $account,
        Carbon $from,
        Carbon $to
    ) {
        return Ledger::where('account_id', $account->id)
            ->whereBetween(
                'transaction_date',
                [$from, $to]
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

        return $previous
            ? (float) $previous->balance_after
            : 0;
    }
}