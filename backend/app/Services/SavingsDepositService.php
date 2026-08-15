<?php

namespace App\Services;

use App\Models\Account;
use App\Models\SavingsDeposit;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class SavingsDepositService
{
    public function __construct(
        private FinancialTransactionService $financialTransactionService
    ) {}

    public function index()
    {
        Gate::authorize(
            'view-any',
            SavingsDeposit::class
        );

        return SavingsDeposit::with([
                'account',
                'savingsGoal',
            ])
            ->where('user_id', Auth::id())
            ->latest('deposited_at')
            ->get();
    }

    public function store(array $data): SavingsDeposit
    {
        Gate::authorize(
            'create',
            SavingsDeposit::class
        );

        return DB::transaction(
            function () use ($data) {

                $userId = Auth::id();

                $goal = SavingsGoal::where(
                        'id',
                        $data['savings_goal_id']
                    )
                    ->where(
                        'user_id',
                        $userId
                    )
                    ->firstOrFail();

                if ($goal->is_completed) {
                    abort(
                        422,
                        'This savings goal has already been completed.'
                    );
                }

                $account = Account::where(
                        'id',
                        $data['account_id']
                    )
                    ->where(
                        'user_id',
                        $userId
                    )
                    ->lockForUpdate()
                    ->firstOrFail();

                $amount = (float) $data['amount'];

                if ($amount <= 0) {
                    abort(
                        422,
                        'Deposit amount must be greater than zero.'
                    );
                }

                $this->financialTransactionService
                    ->ensureSufficientTransferBalance(
                        $account,
                        $amount
                    );

                $deposit = SavingsDeposit::create([
                    ...$data,
                    'user_id' => $userId,
                ]);

                $this->financialTransactionService
                    ->savingsDeposit(
                        $account,
                        $deposit
                    );

                return $deposit->load([
                    'account',
                    'savingsGoal',
                ]);
            }
        );
    }

    public function show(
        SavingsDeposit $deposit
    ) {
        Gate::authorize(
            'view',
            $deposit
        );

        return $deposit->load([
            'account',
            'savingsGoal',
        ]);
    }

    public function destroy(
        SavingsDeposit $deposit
    ): void {
        Gate::authorize(
            'delete',
            $deposit
        );

        DB::transaction(function () use ($deposit) {
            $account = $deposit->account()
                ->lockForUpdate()
                ->firstOrFail();

            $account->increment(
                'balance',
                $deposit->amount
            );

            $deposit->delete();
        });
    }
}