<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Expense;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ExpenseService
{
    protected AccountBalanceService $accountBalanceService;

    public function __construct(AccountBalanceService $accountBalanceService)
    {
        $this->accountBalanceService = $accountBalanceService;
    }

    public function index()
    {
        return Expense::with(['account', 'category'])
            ->where('user_id', Auth::id())
            ->latest('spent_at')
            ->get();
    }

    public function store(array $data): Expense
    {
        return DB::transaction(function () use ($data) {

            $account = Account::where('id', $data['account_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();

            Category::where('id', $data['category_id'])
                ->where(function ($query) {
                    $query->where('is_default', true)
                          ->orWhere('user_id', Auth::id());
                })
                ->firstOrFail();

            if ($account->balance < $data['amount']) {
                abort(422, 'Insufficient account balance.');
            }

            $data['user_id'] = Auth::id();

            $expense = Expense::create($data);

            $this->accountBalanceService->withdraw(
                $account,
                $expense->amount
            );

            return $expense->load(['account', 'category']);
        });
    }

    public function delete(Expense $expense): void
    {
        DB::transaction(function () use ($expense) {

            abort_if($expense->user_id !== Auth::id(), 403);

            $expense->account->increment('balance', $expense->amount);

            $expense->delete();
        });
    }
}