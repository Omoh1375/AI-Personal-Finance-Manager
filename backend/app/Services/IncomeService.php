<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Income;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class IncomeService
{
    public function index()
    {
        return Income::with(['account', 'category'])
            ->where('user_id', Auth::id())
            ->latest('received_at')
            ->get();
    }

    public function store(array $data): Income
    {
        return DB::transaction(function () use ($data) {

            $data['user_id'] = Auth::id();

            $income = Income::create($data);

            $account = Account::findOrFail($data['account_id']);

            $account->increment('balance', $income->amount);

            return $income->load(['account', 'category']);
        });
    }

    public function delete(Income $income): void
    {
        DB::transaction(function () use ($income) {

            abort_if($income->user_id !== Auth::id(), 403);

            $income->account->decrement('balance', $income->amount);

            $income->delete();
        });
    }
}