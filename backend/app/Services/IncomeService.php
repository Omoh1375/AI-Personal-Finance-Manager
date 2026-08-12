<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Income;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class IncomeService
{
    public function __construct(
        private AccountBalanceService $accountBalanceService
    ) {}

    public function index()
    {
        return Income::with([
                'account',
                'category',
            ])
            ->where('user_id', Auth::id())
            ->latest('received_at')
            ->get();
    }

    public function store(array $data): Income
    {
        return DB::transaction(function () use ($data) {

            $account = Account::where('id', $data['account_id'])
                ->where('user_id', Auth::id())
                ->lockForUpdate()
                ->firstOrFail();

            Category::where('id', $data['category_id'])
                ->where(function ($query) {
                    $query->where('is_default', true)
                        ->orWhere('user_id', Auth::id());
                })
                ->firstOrFail();

            $data['user_id'] = Auth::id();

            $income = Income::create($data);

            $this->accountBalanceService->deposit(
                $account,
                (float) $income->amount
            );

            return $income->load([
                'account',
                'category',
            ]);
        });
    }

    public function show(Income $income): Income
    {
        return $income->load([
            'account',
            'category',
        ]);
    }

    public function delete(Income $income): void
    {
        DB::transaction(function () use ($income) {

            $account = Account::where('id', $income->account_id)
                ->where('user_id', $income->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $account->decrement(
                'balance',
                $income->amount
            );

            $income->delete();
        });
    }
}