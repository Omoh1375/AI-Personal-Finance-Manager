<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Category;
use App\Models\Income;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use App\Services\AccountBalanceService;

class IncomeService
{
    private ?AccountBalanceService $accountBalanceService = null;

    public function __construct(?AccountBalanceService $accountBalanceService = null)
    {
        $this->accountBalanceService = $accountBalanceService;
    }

    public function index()
    {
        Gate::authorize('view-any', Income::class);
        return Income::with(['account', 'category'])
            ->where('user_id', Auth::id())
            ->latest('received_at')
            ->get();
    }

    public function create(array $data): Income
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

            $this->accountBalanceService ??= app(AccountBalanceService::class);

            $this->accountBalanceService->deposit(
                $account,
                $income->amount
            );

            return $income->load(['account', 'category']);
        });
    }

    public function delete(Income $income): void
    {
        Gate::authorize('delete', $income);
        DB::transaction(function () use ($income) {

            $this->accountBalanceService ??= app(AccountBalanceService::class);
            Gate::authorize('delete', $income);

            $income->account->decrement('balance', $income->amount);

            $income->delete();
        });
    }

   
}