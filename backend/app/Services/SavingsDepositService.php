<?php

namespace App\Services;

use App\Models\Account;
use App\Models\SavingsDeposit;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\DB;
use App\Services\AccountBalanceService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class SavingsDepositService
{
    protected AccountBalanceService $accountBalanceService;

    public function __construct(AccountBalanceService $accountBalanceService)
    {
        $this->accountBalanceService = $accountBalanceService;
    }
    public function index()
    {
        Gate::authorize('view-any', SavingsDeposit::class); 
        return SavingsDeposit::with([
                'account',
                'savingsGoal'
            ])
            ->where('user_id', auth()->id())
            ->latest('deposited_at')
            ->get();
    }

    public function store(array $data): SavingsDeposit
    {
        Gate::authorize('create', SavingsDeposit::class);
        return DB::transaction(function () use ($data) {

            $goal = SavingsGoal::where('id', $data['savings_goal_id'])
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $account = Account::where('id', $data['account_id'])
                ->where('user_id', Auth::id())
                ->lockForUpdate()
                ->firstOrFail();

            if ($account->balance < $data['amount']) {
                abort(422, 'Insufficient balance.');
            }

           $this->accountBalanceService->withdraw(
                $account,
                $data['amount']
            );

            $deposit = SavingsDeposit::create([
                ...$data,
                'user_id' => Auth::id(),
            ]);

            return $deposit->load([
                'account',
                'savingsGoal',
            ]);
        });
    }

    public function show(SavingsDeposit $deposit)
    {
        Gate::authorize('view', $deposit);

        return $deposit->load([
            'account',
            'savingsGoal',
        ]);
    }

    public function destroy(SavingsDeposit $deposit): void
    {
        Gate::authorize('delete', $deposit);
        DB::transaction(function () use ($deposit) {

            // Gate::authorize('delete', $deposit);

            $deposit->account()
                ->lockForUpdate()
                ->first()
                ->increment('balance', $deposit->amount);

            $deposit->delete();
        });
    }
}