<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transfer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransferService
{
    public function __construct(
        private FinancialTransactionService $financialTransactionService
    ) {}

    public function index()
    {
        return Transfer::with([
            'fromAccount',
            'toAccount',
        ])
            ->where(
                'user_id',
                Auth::id()
            )
            ->latest('transferred_at')
            ->get();
    }

    public function store(
        array $data
    ): Transfer {
        return DB::transaction(
            function () use ($data) {

                $fromAccount =
                    $this->getOwnedAccount(
                        $data['from_account_id'],
                        true
                    );

                $toAccount =
                    $this->getOwnedAccount(
                        $data['to_account_id'],
                        true
                    );

                $this->validateAccounts(
                    $fromAccount,
                    $toAccount
                );

                $this->financialTransactionService
                    ->ensureSufficientTransferBalance(
                        $fromAccount,
                        (float) $data['amount']
                    );

                $transfer =
                    Transfer::create([
                        ...$data,
                        'user_id' =>
                            Auth::id(),
                    ]);

                $this->financialTransactionService->transfer(
                    $fromAccount,
                    $toAccount,
                    (float) $transfer->amount,
                    $transfer
                );

                return $transfer->load([
                    'fromAccount',
                    'toAccount',
                ]);
            }
        );
    }

    public function show(
        Transfer $transfer
    ): Transfer {
        return $transfer->load([
            'fromAccount',
            'toAccount',
        ]);
    }

    public function update(
        Transfer $transfer,
        array $data
    ): Transfer {
        return DB::transaction(
            function () use (
                $transfer,
                $data
            ) {
                /*
                |--------------------------------------------------------------------------
                | Lock old accounts.
                |--------------------------------------------------------------------------
                */

                $oldFrom =
                    $this->getOwnedAccount(
                        $transfer->from_account_id,
                        true
                    );

                $oldTo =
                    $this->getOwnedAccount(
                        $transfer->to_account_id,
                        true
                    );

                /*
                |--------------------------------------------------------------------------
                | Lock new accounts.
                |--------------------------------------------------------------------------
                */

                $newFrom =
                    $this->getOwnedAccount(
                        $data['from_account_id'],
                        true
                    );

                $newTo =
                    $this->getOwnedAccount(
                        $data['to_account_id'],
                        true
                    );

                $this->validateAccounts(
                    $newFrom,
                    $newTo
                );

                /*
                |--------------------------------------------------------------------------
                | Reverse the old transfer.
                |--------------------------------------------------------------------------
                */

                $oldFrom->increment(
                    'balance',
                    $transfer->amount
                );

                $oldTo->decrement(
                    'balance',
                    $transfer->amount
                );

                /*
                |--------------------------------------------------------------------------
                | Validate the new transfer.
                |--------------------------------------------------------------------------
                */

                $newAmount =
                    (float) $data['amount'];

                $this->financialTransactionService
                    ->ensureSufficientTransferBalance(
                        $newFrom,
                        $newAmount
                    );

                /*
                |--------------------------------------------------------------------------
                | Update transfer record.
                |--------------------------------------------------------------------------
                */

                $transfer->update([
                    'from_account_id' =>
                        $data['from_account_id'],

                    'to_account_id' =>
                        $data['to_account_id'],

                    'amount' =>
                        $newAmount,

                    'reference' =>
                        $data['reference']
                        ?? null,

                    'description' =>
                        $data['description']
                        ?? null,

                    'transferred_at' =>
                        $data['transferred_at'],
                ]);

                /*
                |--------------------------------------------------------------------------
                | Apply new transfer.
                |--------------------------------------------------------------------------
                */

                $newFrom->decrement(
                    'balance',
                    $newAmount
                );

                $newTo->increment(
                    'balance',
                    $newAmount
                );

                return $transfer->fresh();
            }
        );
    }

    public function delete(
        Transfer $transfer
    ): void {
        DB::transaction(
            function () use ($transfer) {

                $fromAccount =
                    $this->getOwnedAccount(
                        $transfer->from_account_id,
                        true
                    );

                $toAccount =
                    $this->getOwnedAccount(
                        $transfer->to_account_id,
                        true
                    );

                $toAccount->decrement(
                    'balance',
                    $transfer->amount
                );

                $fromAccount->increment(
                    'balance',
                    $transfer->amount
                );

                $transfer->delete();
            }
        );
    }

    private function getOwnedAccount(
        int $accountId,
        bool $lock = false
    ): Account {
        $query =
            Account::where(
                'id',
                $accountId
            )
                ->where(
                    'user_id',
                    Auth::id()
                );

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->firstOrFail();
    }

    private function validateAccounts(
        Account $fromAccount,
        Account $toAccount
    ): void {
        if (
            $fromAccount->id ===
            $toAccount->id
        ) {
            abort(
                422,
                'Source and destination accounts must be different.'
            );
        }

        if (
            $fromAccount->currency !==
            $toAccount->currency
        ) {
            abort(
                422,
                'Source and destination accounts must use the same currency.'
            );
        }
    }
}