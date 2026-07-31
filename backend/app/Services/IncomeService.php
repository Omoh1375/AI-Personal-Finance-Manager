<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
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

            $account = Account::where('id', $data['account_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $category = Category::where('id', $data['category_id'])
                ->where(function ($query) {
                    $query->where('is_default', true)
                        ->orWhere('user_id', Auth::id());
                })
                ->firstOrFail();

            $data['user_id'] = Auth::id();

            $income = Income::create($data);

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