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
            ->where('user_id', Auth::id())
            ->latest('transferred_at')
            ->get();
    }

    public function store(array $data): Transfer
    {
        return DB::transaction(function () use ($data) {

            $fromAccount = Account::where('id', $data['from_account_id'])
                ->where('user_id', Auth::id())
                ->lockForUpdate()
                ->firstOrFail();

            $toAccount = Account::where('id', $data['to_account_id'])
                ->where('user_id', Auth::id())
                ->lockForUpdate()
                ->firstOrFail();

            if ($fromAccount->id === $toAccount->id) {
                abort(422, 'Source and destination accounts must be different.');
            }

            $this->financialTransactionService->ensureSufficientTransferBalance(
                $fromAccount,
                (float) $data['amount']
            );

            $transfer = Transfer::create([
                ...$data,
                'user_id' => Auth::id(),
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
        });
    }

    public function show(Transfer $transfer): Transfer
    {
        return $transfer->load([
            'fromAccount',
            'toAccount',
        ]);
    }

    public function delete(Transfer $transfer): void
    {
        DB::transaction(function () use ($transfer) {

            $fromAccount = Account::where('id', $transfer->from_account_id)
                ->where('user_id', $transfer->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $toAccount = Account::where('id', $transfer->to_account_id)
                ->where('user_id', $transfer->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $toAccount->decrement('balance', $transfer->amount);

            $fromAccount->increment('balance', $transfer->amount);

            $transfer->delete();
        });
    }
}