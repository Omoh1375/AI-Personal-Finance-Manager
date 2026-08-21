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
            ->where(
                'user_id',
                Auth::id()
            )
            ->latest('received_at')
            ->get();
    }

    public function store(
        array $data
    ): Income {
        return DB::transaction(
            function () use ($data) {

                $account =
                    $this->getOwnedAccount(
                        $data['account_id'],
                        true
                    );

                $this->validateCategory(
                    $data['category_id']
                );

                $data['user_id'] =
                    Auth::id();

                $income =
                    Income::create(
                        $data
                    );

                $this->accountBalanceService->deposit(
                    $account,
                    (float) $income->amount
                );

                return $income->load([
                    'account',
                    'category',
                ]);
            }
        );
    }

    public function show(
        Income $income
    ): Income {
        return $income->load([
            'account',
            'category',
        ]);
    }

    public function update(
        Income $income,
        array $data
    ): Income {
        return DB::transaction(
            function () use (
                $income,
                $data
            ) {
                /*
                |--------------------------------------------------------------------------
                | Lock the existing account.
                |--------------------------------------------------------------------------
                */

                $oldAccount =
                    Account::where(
                        'id',
                        $income->account_id
                    )
                        ->where(
                            'user_id',
                            Auth::id()
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                /*
                |--------------------------------------------------------------------------
                | Validate destination account.
                |--------------------------------------------------------------------------
                */

                $newAccount =
                    $this->getOwnedAccount(
                        $data['account_id'],
                        true
                    );

                /*
                |--------------------------------------------------------------------------
                | Validate category ownership.
                |--------------------------------------------------------------------------
                */

                $this->validateCategory(
                    $data['category_id']
                );

                $oldAmount =
                    (float) $income->amount;

                $newAmount =
                    (float) $data['amount'];

                /*
                |--------------------------------------------------------------------------
                | Reverse the old income.
                |--------------------------------------------------------------------------
                */

                $oldAccount->decrement(
                    'balance',
                    $oldAmount
                );

                /*
                |--------------------------------------------------------------------------
                | Apply the updated income.
                |--------------------------------------------------------------------------
                */

                $income->update([
                    'account_id' =>
                        $data['account_id'],

                    'category_id' =>
                        $data['category_id'],

                    'amount' =>
                        $newAmount,

                    'reference' =>
                        $data['reference']
                        ?? null,

                    'description' =>
                        $data['description']
                        ?? null,

                    'received_at' =>
                        $data['received_at'],
                ]);

                /*
                |--------------------------------------------------------------------------
                | If account changes, deposit into the new account.
                | Otherwise deposit the new amount into the old account.
                |--------------------------------------------------------------------------
                */

                if (
                    $oldAccount->id ===
                    $newAccount->id
                ) {
                    $newAccount->increment(
                        'balance',
                        $newAmount
                    );
                } else {
                    $newAccount->increment(
                        'balance',
                        $newAmount
                    );
                }

                return $income->fresh();
            }
        );
    }

    public function delete(
        Income $income
    ): void {
        DB::transaction(
            function () use ($income) {

                $account =
                    Account::where(
                        'id',
                        $income->account_id
                    )
                        ->where(
                            'user_id',
                            $income->user_id
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                $account->decrement(
                    'balance',
                    $income->amount
                );

                $income->delete();
            }
        );
    }

    private function getOwnedAccount(
        int $accountId,
        bool $lock = false
    ): Account {
        $query =
            Account::where(
                'id',
                $accountId
            )
                ->where(
                    'user_id',
                    Auth::id()
                );

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->firstOrFail();
    }

    private function validateCategory(
        int $categoryId
    ): void {
        Category::where(
            'id',
            $categoryId
        )
            ->where(
                function ($query) {
                    $query->where(
                        'is_default',
                        true
                    )
                        ->orWhere(
                            'user_id',
                            Auth::id()
                        );
                }
            )
            ->firstOrFail();
    }
}