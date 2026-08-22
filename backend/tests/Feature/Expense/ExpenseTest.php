<?php

namespace Tests\Feature\Expense;

use App\Models\Account;
use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\FeatureTestCase;

class ExpenseTest extends FeatureTestCase
{
    public function test_authenticated_user_can_create_expense(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user,
                [
                    'balance' => 5000,
                ]
            );

        $category =
            $this->createExpenseCategory(
                $user
            );

        $response =
            $this->postJson(
                '/api/expenses',
                [
                    'account_id' =>
                        $account->id,

                    'category_id' =>
                        $category->id,

                    'amount' =>
                        1000,

                    'reference' =>
                        'EXP-001',

                    'merchant' =>
                        'Shoprite',

                    'description' =>
                        'Groceries',

                    'spent_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertCreated();

        $this->assertDatabaseHas(
            'expenses',
            [
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    1000,
            ]
        );

        $account->refresh();

        $this->assertEquals(
            4000,
            (float) $account->balance
        );
    }

    public function test_guest_cannot_create_expense(): void
    {
        $response =
            $this->postJson(
                '/api/expenses',
                []
            );

        $response->assertUnauthorized();
    }

    public function test_user_cannot_use_another_users_account(): void
    {
        $owner =
            User::factory()->create();

        $account =
            $this->createAccount(
                $owner,
                [
                    'balance' => 5000,
                ]
            );

        $category =
            $this->createExpenseCategory(
                $owner
            );

        $anotherUser =
            User::factory()->create();

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->postJson(
                '/api/expenses',
                [
                    'account_id' =>
                        $account->id,

                    'category_id' =>
                        $category->id,

                    'amount' =>
                        500,

                    'spent_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertNotFound();

        $this->assertDatabaseCount(
            'expenses',
            0
        );
    }

    public function test_user_cannot_create_expense_with_insufficient_balance(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user,
                [
                    'balance' => 500,
                ]
            );

        $category =
            $this->createExpenseCategory(
                $user
            );

        $response =
            $this->postJson(
                '/api/expenses',
                [
                    'account_id' =>
                        $account->id,

                    'category_id' =>
                        $category->id,

                    'amount' =>
                        1000,

                    'spent_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertStatus(422);

        $this->assertDatabaseCount(
            'expenses',
            0
        );

        $account->refresh();

        $this->assertEquals(
            500,
            (float) $account->balance
        );
    }

    public function test_expense_requires_valid_data(): void
    {
        $this->login();

        $response =
            $this->postJson(
                '/api/expenses',
                []
            );

        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'account_id',
            'category_id',
            'amount',
            'spent_at',
        ]);
    }

    public function test_user_can_view_own_expense(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user
            );

        $category =
            $this->createExpenseCategory(
                $user
            );

        $expense =
            Expense::factory()->create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,
            ]);

        $response =
            $this->getJson(
                "/api/expenses/{$expense->id}"
            );

        $response->assertOk();
    }

    public function test_user_can_update_own_expense_and_balance_is_correct(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user,
                [
                    'balance' => 4000,
                ]
            );

        $category =
            $this->createExpenseCategory(
                $user
            );

        $expense =
            Expense::create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    1000,

                'reference' =>
                    'EXP-001',

                'merchant' =>
                    'Shoprite',

                'description' =>
                    'Original expense',

                'spent_at' =>
                    now(),
            ]);

        $response =
            $this->putJson(
                "/api/expenses/{$expense->id}",
                [
                    'account_id' =>
                        $account->id,

                    'category_id' =>
                        $category->id,

                    'amount' =>
                        1500,

                    'reference' =>
                        'EXP-002',

                    'merchant' =>
                        'Updated Merchant',

                    'description' =>
                        'Updated expense',

                    'spent_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertOk();

        $expense->refresh();
        $account->refresh();

        $this->assertEquals(
            1500,
            (float) $expense->amount
        );

        $this->assertEquals(
            'EXP-002',
            $expense->reference
        );

        /*
         * Initial account balance:
         * 4000
         *
         * Reverse old expense:
         * 4000 + 1000 = 5000
         *
         * Apply new expense:
         * 5000 - 1500 = 3500
         */
        $this->assertEquals(
            3500,
            (float) $account->balance
        );
    }

    public function test_user_can_move_expense_to_another_owned_account(): void
    {
        $user = $this->login();

        $oldAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 4000,
                ]
            );

        $newAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 3000,
                ]
            );

        $category =
            $this->createExpenseCategory(
                $user
            );

        $expense =
            Expense::create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $oldAccount->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    1000,

                'spent_at' =>
                    now(),
            ]);

        $response =
            $this->putJson(
                "/api/expenses/{$expense->id}",
                [
                    'account_id' =>
                        $newAccount->id,

                    'category_id' =>
                        $category->id,

                    'amount' =>
                        1200,

                    'reference' =>
                        'MOVED-001',

                    'merchant' =>
                        'Moved merchant',

                    'description' =>
                        'Moved expense',

                    'spent_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertOk();

        $oldAccount->refresh();
        $newAccount->refresh();

        $this->assertEquals(
            5000,
            (float) $oldAccount->balance
        );

        $this->assertEquals(
            1800,
            (float) $newAccount->balance
        );
    }

    public function test_user_cannot_update_another_users_expense(): void
    {
        $owner =
            User::factory()->create();

        $ownerAccount =
            $this->createAccount(
                $owner,
                [
                    'balance' => 4000,
                ]
            );

        $ownerCategory =
            $this->createExpenseCategory(
                $owner
            );

        $expense =
            Expense::create([
                'user_id' =>
                    $owner->id,

                'account_id' =>
                    $ownerAccount->id,

                'category_id' =>
                    $ownerCategory->id,

                'amount' =>
                    1000,

                'spent_at' =>
                    now(),
            ]);

        $anotherUser =
            User::factory()->create();

        $anotherAccount =
            $this->createAccount(
                $anotherUser,
                [
                    'balance' => 5000,
                ]
            );

        $anotherCategory =
            $this->createExpenseCategory(
                $anotherUser
            );

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->putJson(
                "/api/expenses/{$expense->id}",
                [
                    'account_id' =>
                        $anotherAccount->id,

                    'category_id' =>
                        $anotherCategory->id,

                    'amount' =>
                        3000,

                    'spent_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertForbidden();

        $expense->refresh();

        $this->assertEquals(
            1000,
            (float) $expense->amount
        );
    }

    public function test_user_can_delete_expense_and_balance_is_restored(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user,
                [
                    'balance' => 4000,
                ]
            );

        $category =
            $this->createExpenseCategory(
                $user
            );

        $expense =
            Expense::create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    1000,

                'reference' =>
                    'EXP-001',

                'merchant' =>
                    'Shoprite',

                'description' =>
                    'Groceries',

                'spent_at' =>
                    now(),
            ]);

        $response =
            $this->deleteJson(
                "/api/expenses/{$expense->id}"
            );

        $response->assertOk();

        $this->assertDatabaseMissing(
            'expenses',
            [
                'id' =>
                    $expense->id,
            ]
        );

        $account->refresh();

        $this->assertEquals(
            5000,
            (float) $account->balance
        );
    }

    public function test_user_cannot_delete_another_users_expense(): void
    {
        $owner =
            User::factory()->create();

        $account =
            $this->createAccount(
                $owner
            );

        $category =
            $this->createExpenseCategory(
                $owner
            );

        $expense =
            Expense::factory()->create([
                'user_id' =>
                    $owner->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,
            ]);

        $anotherUser =
            User::factory()->create();

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->deleteJson(
                "/api/expenses/{$expense->id}"
            );

        $response->assertForbidden();

        $this->assertDatabaseHas(
            'expenses',
            [
                'id' =>
                    $expense->id,
            ]
        );
    }
}