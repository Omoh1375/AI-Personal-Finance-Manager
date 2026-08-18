<?php

namespace App\Services;

use App\Models\SavingsGoal;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class SavingsGoalService
{
    public function index()
    {
        Gate::authorize(
            'view-any',
            SavingsGoal::class
        );

        return SavingsGoal::with([
                'account',
                'deposits.account',
            ])
            ->where('user_id', Auth::id())
            ->latest()
            ->get()
            ->map(
                fn ($goal) =>
                    $this->format($goal)
            );
    }

    public function show(
        SavingsGoal $goal
    ) {
        Gate::authorize(
            'view',
            $goal
        );

        return $this->format(
            $goal->load([
                'account',
                'deposits.account',
            ])
        );
    }

    public function store(
        array $data
    ) {
        Gate::authorize(
            'create',
            SavingsGoal::class
        );

        $data['user_id'] =
            Auth::id();

        $goal =
            SavingsGoal::create(
                $data
            );

        return $this->format(
            $goal->load([
                'account',
                'deposits.account',
            ])
        );
    }

    public function delete(
        SavingsGoal $goal
    ): void {
        Gate::authorize(
            'delete',
            $goal
        );

        DB::transaction(
            function () use ($goal) {

                $goal->load(
                    'deposits'
                );

                foreach (
                    $goal->deposits as $deposit
                ) {
                    $account =
                        $deposit
                            ->account()
                            ->lockForUpdate()
                            ->first();

                    if ($account) {
                        $account->increment(
                            'balance',
                            $deposit->amount
                        );
                    }

                    $deposit->delete();
                }

                $goal->delete();
            }
        );
    }

    private function format(
        SavingsGoal $goal
    ): array {
        $saved =
            (float) $goal
                ->deposits
                ->sum('amount');

        $target =
            (float) $goal->target_amount;

        $remaining =
            max(
                0,
                $target - $saved
            );

        $progress =
            $target > 0
                ? round(
                    ($saved / $target) *
                        100,
                    2
                )
                : 0;

        return [

            'id' => $goal->id,

            'account_id' =>
                $goal->account_id,

            'account' =>
                $goal->account?->name,

            'account_currency' =>
                $goal->account?->currency,

            'name' =>
                $goal->name,

            'target_amount' =>
                $target,

            'saved' =>
                $saved,

            'remaining' =>
                (float) $remaining,

            'progress' =>
                $progress,

            'status' =>
                $this->status(
                    $progress
                ),

            'target_date' =>
                $goal->target_date,

            'description' =>
                $goal->description,
        ];
    }

    private function status(
        float $progress
    ): string {
        return match (true) {

            $progress >= 100 =>
                'Completed',

            $progress >= 80 =>
                'Almost There',

            default =>
                'In Progress',
        };
    }
}