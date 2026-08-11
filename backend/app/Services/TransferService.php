<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transfer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class TransferService
{
    public function index()
    {
        Gate::authorize('view-any', Transfer::class);
        $userId = Auth::id();

        // abort_if(! $userId, 403);

        return Transfer::with(['fromAccount', 'toAccount'])
            ->where('user_id', $userId)
            ->latest('transferred_at')
            ->get();
    }

   public function __construct(
        private FinancialTransactionService $financialTransactionService
    ) {}

    public function store(array $data): Transfer
    {
        Gate::authorize('create', Transfer::class);
        $userId = Auth::id();

        // abort_if(! $userId, 403);

        return DB::transaction(function () use ($data, $userId) {

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

            if ($fromAccount->balance < $data['amount']) {
                abort(422, 'Insufficient balance.');
            }

            $transfer = Transfer::create([
                ...$data,
                'user_id' => $userId,
            ]);

           $this->financialTransactionService->transfer(
                $fromAccount,
                $toAccount,
                $transfer
            );

            return $transfer->load([
                'fromAccount',
                'toAccount',
            ]);
        });
    }

    public function delete(Transfer $transfer): void
    {
        DB::transaction(function () use ($transfer) {

            Gate::authorize('delete', $transfer);

            $transfer->toAccount->decrement(
                'balance',
                $transfer->amount
            );

            $transfer->fromAccount->increment(
                'balance',
                $transfer->amount
            );

            $transfer->delete();
        });
    }
}