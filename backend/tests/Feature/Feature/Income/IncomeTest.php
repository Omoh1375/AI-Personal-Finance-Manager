<?php

namespace Tests\Feature\Income;

use App\Models\Account;
use App\Models\Category;
use App\Models\Income;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\FeatureTestCase;

class IncomeTest extends FeatureTestCase
{
    public function test_authenticated_user_can_create_income(): void
    {
        $user = $this->login();

        $account = $this->createAccount($user, [
            'balance' => 1000,
        ]);

        $category = $this->createIncomeCategory($user);

        $response = $this->postJson('/api/incomes', [
            'account_id'   => $account->id,
            'category_id'  => $category->id,
            'amount'       => 500,
            'reference'    => 'SAL-001',
            'description'  => 'Monthly Salary',
            'received_at'  => now()->toDateString(),
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('incomes', [
            'user_id'     => $user->id,
            'account_id'  => $account->id,
            'category_id' => $category->id,
            'amount'      => 500,
        ]);

        $account->refresh();

        $this->assertEquals(
            1500,
            (float) $account->balance
        );
    }

    public function test_guest_cannot_create_income(): void
    {
        $response = $this->postJson(
            '/api/incomes',
            []
        );

        $response->assertUnauthorized();
    }

    public function test_user_cannot_use_another_users_account(): void
    {
        $owner = User::factory()->create();

        $account = $this->createAccount(
            $owner
        );

        $category =
            $this->createIncomeCategory(
                $owner
            );

        $anotherUser =
            User::factory()->create();

        Sanctum::actingAs(
            $anotherUser
        );

        $response = $this->postJson(
            '/api/incomes',
            [
                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,

                'amount' => 500,

                'received_at' =>
                    now()->toDateString(),
            ]
        );

        $response->assertNotFound();

        $this->assertDatabaseCount(
            'incomes',
            0
        );
    }

    public function test_income_requires_valid_data(): void
    {
        $this->login();

        $response = $this->postJson(
            '/api/incomes',
            []
        );

        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'account_id',
            'category_id',
            'amount',
            'received_at',
        ]);
    }

    public function test_user_can_view_own_income(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user
            );

        $category =
            $this->createIncomeCategory(
                $user
            );

        $income =
            Income::factory()->create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,
            ]);

        $response =
            $this->getJson(
                "/api/incomes/{$income->id}"
            );

        $response->assertOk();
    }

    public function test_user_can_update_own_income_and_balance_is_correct(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user,
                [
                    'balance' => 1500,
                ]
            );

        $category =
            $this->createIncomeCategory(
                $user
            );

        $income =
            Income::create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    500,

                'reference' =>
                    'INC-001',

                'description' =>
                    'Original income',

                'received_at' =>
                    now(),
            ]);

        $response =
            $this->putJson(
                "/api/incomes/{$income->id}",
                [
                    'account_id' =>
                        $account->id,

                    'category_id' =>
                        $category->id,

                    'amount' =>
                        800,

                    'reference' =>
                        'INC-002',

                    'description' =>
                        'Updated income',

                    'received_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertOk();

        $income->refresh();
        $account->refresh();

        $this->assertEquals(
            800,
            (float) $income->amount
        );

        $this->assertEquals(
            'INC-002',
            $income->reference
        );

        /*
         * Original account balance:
         * 1500
         *
         * Reverse old income:
         * 1500 - 500 = 1000
         *
         * Apply updated income:
         * 1000 + 800 = 1800
         */
        $this->assertEquals(
            1800,
            (float) $account->balance
        );
    }

    public function test_user_can_move_income_to_another_owned_account(): void
    {
        $user = $this->login();

        $oldAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 1500,
                ]
            );

        $newAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 500,
                ]
            );

        $category =
            $this->createIncomeCategory(
                $user
            );

        $income =
            Income::create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $oldAccount->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    500,

                'received_at' =>
                    now(),
            ]);

        $response =
            $this->putJson(
                "/api/incomes/{$income->id}",
                [
                    'account_id' =>
                        $newAccount->id,

                    'category_id' =>
                        $category->id,

                    'amount' =>
                        700,

                    'reference' =>
                        'MOVED-001',

                    'description' =>
                        'Moved income',

                    'received_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertOk();

        $oldAccount->refresh();
        $newAccount->refresh();

        $this->assertEquals(
            1000,
            (float) $oldAccount->balance
        );

        $this->assertEquals(
            1200,
            (float) $newAccount->balance
        );
    }

    public function test_user_cannot_update_another_users_income(): void
    {
        $owner =
            User::factory()->create();

        $ownerAccount =
            $this->createAccount(
                $owner,
                [
                    'balance' => 1500,
                ]
            );

        $ownerCategory =
            $this->createIncomeCategory(
                $owner
            );

        $income =
            Income::create([
                'user_id' =>
                    $owner->id,

                'account_id' =>
                    $ownerAccount->id,

                'category_id' =>
                    $ownerCategory->id,

                'amount' =>
                    500,

                'received_at' =>
                    now(),
            ]);

        $anotherUser =
            User::factory()->create();

        $anotherAccount =
            $this->createAccount(
                $anotherUser
            );

        $anotherCategory =
            $this->createIncomeCategory(
                $anotherUser
            );

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->putJson(
                "/api/incomes/{$income->id}",
                [
                    'account_id' =>
                        $anotherAccount->id,

                    'category_id' =>
                        $anotherCategory->id,

                    'amount' =>
                        900,

                    'received_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertForbidden();

        $income->refresh();

        $this->assertEquals(
            500,
            (float) $income->amount
        );
    }

    public function test_user_can_delete_income_and_balance_is_restored(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user,
                [
                    'balance' => 1000,
                ]
            );

        $category =
            $this->createIncomeCategory(
                $user
            );

        $income =
            Income::create([
                'user_id' =>
                    $user->id,

                'account_id' =>
                    $account->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    500,

                'reference' =>
                    'INC-001',

                'description' =>
                    'Salary',

                'received_at' =>
                    now(),
            ]);

        $account->increment(
            'balance',
            500
        );

        $response =
            $this->deleteJson(
                "/api/incomes/{$income->id}"
            );

        $response->assertOk();

        $this->assertDatabaseMissing(
            'incomes',
            [
                'id' => $income->id,
            ]
        );

        $account->refresh();

        $this->assertEquals(
            1000,
            (float) $account->balance
        );
    }

    public function test_user_cannot_delete_another_users_income(): void
    {
        $owner =
            User::factory()->create();

        $account =
            $this->createAccount(
                $owner
            );

        $category =
            $this->createIncomeCategory(
                $owner
            );

        $income =
            Income::factory()->create([
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
                "/api/incomes/{$income->id}"
            );

        $response->assertForbidden();

        $this->assertDatabaseHas(
            'incomes',
            [
                'id' =>
                    $income->id,
            ]
        );
    }
}