<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transfer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TransferService
{
    public function index()
    {
        $userId = Auth::id();

        abort_if(! $userId, 403);

        return Transfer::with(['fromAccount', 'toAccount'])
            ->where('user_id', $userId)
            ->latest('transferred_at')
            ->get();
    }

    public function store(array $data): Transfer
    {
        $userId = Auth::id();

        abort_if(! $userId, 403);

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

            $fromAccount->decrement('balance', $data['amount']);

            $toAccount->increment('balance', $data['amount']);

            return $transfer->load([
                'fromAccount',
                'toAccount',
            ]);
        });
    }

    public function delete(Transfer $transfer): void
    {
        DB::transaction(function () use ($transfer) {

            abort_if(
                $transfer->user_id !== Auth::id(),
                403
            );

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