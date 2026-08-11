<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use Illuminate\Support\Facades\Auth;

class RecurringTransactionService
{
    public function index()
    {
        return RecurringTransaction::with([
                'account',
                'category',
            ])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();
    }

    public function store(array $data): RecurringTransaction
    {
        $account = Account::where('id', $data['account_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        Category::where('id', $data['category_id'])
            ->where(function ($query) {
                $query->where('is_default', true)
                      ->orWhere('user_id', Auth::id());
            })
            ->firstOrFail();

        $data['user_id'] = Auth::id();

        return RecurringTransaction::create($data)
            ->load(['account', 'category']);
    }

    public function show(RecurringTransaction $transaction)
    {
        abort_if(
            $transaction->user_id !== Auth::id(),
            403
        );

        return $transaction->load([
            'account',
            'category',
        ]);
    }

    public function update(
        RecurringTransaction $transaction,
        array $data
    ): RecurringTransaction {

        abort_if(
            $transaction->user_id !== Auth::id(),
            403
        );

        $transaction->update($data);

        return $transaction->fresh()
            ->load(['account', 'category']);
    }

    public function destroy(
        RecurringTransaction $transaction
    ): void {

        abort_if(
            $transaction->user_id !== Auth::id(),
            403
        );

        $transaction->delete();
    }
}