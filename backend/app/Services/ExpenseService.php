<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    public function __construct(
        private AccountBalanceService $accountBalanceService
    ) {}

    public function index()
    {
        return Expense::with([
                'account',
                'category',
            ])
            ->where('user_id', Auth::id())
            ->latest('spent_at')
            ->get();
    }

    public function store(array $data): Expense
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

            $this->accountBalanceService->ensureSufficientBalance(
                $account,
                (float) $data['amount']
            );

            $data['user_id'] = Auth::id();

            $expense = Expense::create($data);

            $this->accountBalanceService->withdraw(
                $account,
                (float) $expense->amount
            );

            return $expense->load([
                'account',
                'category',
            ]);
        });
    }

    public function show(Expense $expense): Expense
    {
        return $expense->load([
            'account',
            'category',
        ]);
    }

    public function delete(Expense $expense): void
    {
        DB::transaction(function () use ($expense) {

            $account = Account::where('id', $expense->account_id)
                ->where('user_id', $expense->user_id)
                ->lockForUpdate()
                ->firstOrFail();

            $account->increment(
                'balance',
                $expense->amount
            );

            $expense->delete();
        });
    }
}