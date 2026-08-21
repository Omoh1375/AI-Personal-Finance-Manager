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
            ->where(
                'user_id',
                Auth::id()
            )
            ->latest('spent_at')
            ->get();
    }

    public function store(
        array $data
    ): Expense {
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

                $this->accountBalanceService
                    ->ensureSufficientBalance(
                        $account,
                        (float) $data['amount']
                    );

                $data['user_id'] =
                    Auth::id();

                $expense =
                    Expense::create(
                        $data
                    );

                $this->accountBalanceService->withdraw(
                    $account,
                    (float) $expense->amount
                );

                return $expense->load([
                    'account',
                    'category',
                ]);
            }
        );
    }

    public function show(
        Expense $expense
    ): Expense {
        return $expense->load([
            'account',
            'category',
        ]);
    }

    public function update(
        Expense $expense,
        array $data
    ): Expense {
        return DB::transaction(
            function () use (
                $expense,
                $data
            ) {
                $oldAccount =
                    Account::where(
                        'id',
                        $expense->account_id
                    )
                        ->where(
                            'user_id',
                            Auth::id()
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                $newAccount =
                    $this->getOwnedAccount(
                        $data['account_id'],
                        true
                    );

                $this->validateCategory(
                    $data['category_id']
                );

                $oldAmount =
                    (float) $expense->amount;

                $newAmount =
                    (float) $data['amount'];

                /*
                |--------------------------------------------------------------------------
                | Restore the amount previously deducted.
                |--------------------------------------------------------------------------
                */

                $oldAccount->increment(
                    'balance',
                    $oldAmount
                );

                /*
                |--------------------------------------------------------------------------
                | Make sure the new account can fund the
                | updated expense.
                |--------------------------------------------------------------------------
                */

                if (
                    $oldAccount->id ===
                    $newAccount->id
                ) {
                    $available =
                        (float) $oldAccount->balance;

                    if (
                        $available <
                        $newAmount
                    ) {
                        abort(
                            422,
                            'Insufficient balance for the updated expense.'
                        );
                    }
                } else {
                    $this->accountBalanceService
                        ->ensureSufficientBalance(
                            $newAccount,
                            $newAmount
                        );
                }

                /*
                |--------------------------------------------------------------------------
                | Update record.
                |--------------------------------------------------------------------------
                */

                $expense->update([
                    'account_id' =>
                        $data['account_id'],

                    'category_id' =>
                        $data['category_id'],

                    'amount' =>
                        $newAmount,

                    'reference' =>
                        $data['reference']
                        ?? null,

                    'merchant' =>
                        $data['merchant']
                        ?? null,

                    'description' =>
                        $data['description']
                        ?? null,

                    'spent_at' =>
                        $data['spent_at'],
                ]);

                /*
                |--------------------------------------------------------------------------
                | Apply the updated deduction.
                |--------------------------------------------------------------------------
                */

                $newAccount->decrement(
                    'balance',
                    $newAmount
                );

                return $expense->fresh();
            }
        );
    }

    public function delete(
        Expense $expense
    ): void {
        DB::transaction(
            function () use ($expense) {

                $account =
                    Account::where(
                        'id',
                        $expense->account_id
                    )
                        ->where(
                            'user_id',
                            $expense->user_id
                        )
                        ->lockForUpdate()
                        ->firstOrFail();

                $account->increment(
                    'balance',
                    $expense->amount
                );

                $expense->delete();
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