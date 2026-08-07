<?php

namespace App\Services;

use App\Models\Account;
use App\Models\SavingsDeposit;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\DB;
use App\Services\AccountBalanceService;

class SavingsDepositService
{
    protected AccountBalanceService $accountBalanceService;

    public function __construct(AccountBalanceService $accountBalanceService)
    {
        $this->accountBalanceService = $accountBalanceService;
    }
    public function index()
    {
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
        return DB::transaction(function () use ($data) {

            $goal = SavingsGoal::where('id', $data['savings_goal_id'])
                ->where('user_id', auth()->id())
                ->firstOrFail();

            $account = Account::where('id', $data['account_id'])
                ->where('user_id', auth()->id())
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
                'user_id' => auth()->id(),
            ]);

            return $deposit->load([
                'account',
                'savingsGoal',
            ]);
        });
    }

    public function show(SavingsDeposit $deposit)
    {
        abort_if(
                $deposit->user_id !== auth()->id(),
            403
        );

        return $deposit->load([
            'account',
            'savingsGoal',
        ]);
    }

    public function destroy(SavingsDeposit $deposit): void
    {
        DB::transaction(function () use ($deposit) {

            abort_if(
                $deposit->user_id !== auth()->id(),
                403
            );

            $deposit->account()
                ->lockForUpdate()
                ->first()
                ->increment('balance', $deposit->amount);

            $deposit->delete();
        });
    }
}