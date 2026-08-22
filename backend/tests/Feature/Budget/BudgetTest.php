<?php

namespace Tests\Feature\Budget;

use App\Models\Budget;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\FeatureTestCase;

class BudgetTest extends FeatureTestCase
{
    public function test_authenticated_user_can_create_budget(): void
    {
        $user = $this->login();

        $category =
            $this->createExpenseCategory(
                $user
            );

        $response =
            $this->postJson(
                '/api/budgets',
                [
                    'category_id' =>
                        $category->id,

                    'amount' =>
                        50000,

                    'start_date' =>
                        now()->startOfMonth()
                            ->toDateString(),

                    'end_date' =>
                        now()->endOfMonth()
                            ->toDateString(),

                    'is_active' =>
                        true,
                ]
            );

        $response->assertCreated();

        $this->assertDatabaseHas(
            'budgets',
            [
                'user_id' =>
                    $user->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    50000,
            ]
        );
    }

    public function test_guest_cannot_create_budget(): void
    {
        $response =
            $this->postJson(
                '/api/budgets',
                []
            );

        $response->assertUnauthorized();
    }

    public function test_budget_requires_valid_data(): void
    {
        $this->login();

        $response =
            $this->postJson(
                '/api/budgets',
                []
            );

        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'category_id',
            'amount',
            'start_date',
            'end_date',
        ]);
    }

    public function test_user_can_view_own_budget(): void
    {
        $user = $this->login();

        $category =
            $this->createExpenseCategory(
                $user
            );

        $budget =
            Budget::create([
                'user_id' =>
                    $user->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    50000,

                'start_date' =>
                    now()->startOfMonth()
                        ->toDateString(),

                'end_date' =>
                    now()->endOfMonth()
                        ->toDateString(),

                'is_active' =>
                    true,
            ]);

        $response =
            $this->getJson(
                "/api/budgets/{$budget->id}"
            );

        $response->assertOk();
    }

    public function test_user_can_update_own_budget(): void
    {
        $user = $this->login();

        $category =
            $this->createExpenseCategory(
                $user
            );

        $budget =
            Budget::create([
                'user_id' =>
                    $user->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    50000,

                'start_date' =>
                    now()->startOfMonth()
                        ->toDateString(),

                'end_date' =>
                    now()->endOfMonth()
                        ->toDateString(),

                'is_active' =>
                    true,
            ]);

        $response =
            $this->putJson(
                "/api/budgets/{$budget->id}",
                [
                    'category_id' =>
                        $category->id,

                    'amount' =>
                        75000,

                    'start_date' =>
                        now()->startOfMonth()
                            ->toDateString(),

                    'end_date' =>
                        now()->endOfMonth()
                            ->toDateString(),

                    'is_active' =>
                        false,
                ]
            );

        $response->assertOk();

        $budget->refresh();

        $this->assertEquals(
            75000,
            (float) $budget->amount
        );

        $this->assertFalse(
            (bool) $budget->is_active
        );
    }

    public function test_user_cannot_update_another_users_budget(): void
    {
        $owner =
            User::factory()->create();

        $category =
            $this->createExpenseCategory(
                $owner
            );

        $budget =
            Budget::create([
                'user_id' =>
                    $owner->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    50000,

                'start_date' =>
                    now()->startOfMonth()
                        ->toDateString(),

                'end_date' =>
                    now()->endOfMonth()
                        ->toDateString(),

                'is_active' =>
                    true,
            ]);

        $anotherUser =
            User::factory()->create();

        $anotherCategory =
            $this->createExpenseCategory(
                $anotherUser
            );

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->putJson(
                "/api/budgets/{$budget->id}",
                [
                    'category_id' =>
                        $anotherCategory->id,

                    'amount' =>
                        100000,

                    'start_date' =>
                        now()->startOfMonth()
                            ->toDateString(),

                    'end_date' =>
                        now()->endOfMonth()
                            ->toDateString(),

                    'is_active' =>
                        false,
                ]
            );

        $response->assertForbidden();

        $budget->refresh();

        $this->assertEquals(
            50000,
            (float) $budget->amount
        );
    }

    public function test_user_cannot_use_another_users_category_for_budget(): void
    {
        $owner =
            User::factory()->create();

        $ownerCategory =
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
                '/api/budgets',
                [
                    'category_id' =>
                        $ownerCategory->id,

                    'amount' =>
                        50000,

                    'start_date' =>
                        now()->startOfMonth()
                            ->toDateString(),

                    'end_date' =>
                        now()->endOfMonth()
                            ->toDateString(),

                    'is_active' =>
                        true,
                ]
            );

        $response->assertNotFound();

        $this->assertDatabaseCount(
            'budgets',
            0
        );
    }

    public function test_user_can_delete_own_budget(): void
    {
        $user = $this->login();

        $category =
            $this->createExpenseCategory(
                $user
            );

        $budget =
            Budget::create([
                'user_id' =>
                    $user->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    50000,

                'start_date' =>
                    now()->startOfMonth()
                        ->toDateString(),

                'end_date' =>
                    now()->endOfMonth()
                        ->toDateString(),

                'is_active' =>
                    true,
            ]);

        $response =
            $this->deleteJson(
                "/api/budgets/{$budget->id}"
            );

        $response->assertOk();

        $this->assertDatabaseMissing(
            'budgets',
            [
                'id' =>
                    $budget->id,
            ]
        );
    }

    public function test_user_cannot_delete_another_users_budget(): void
    {
        $owner =
            User::factory()->create();

        $category =
            $this->createExpenseCategory(
                $owner
            );

        $budget =
            Budget::create([
                'user_id' =>
                    $owner->id,

                'category_id' =>
                    $category->id,

                'amount' =>
                    50000,

                'start_date' =>
                    now()->startOfMonth()
                        ->toDateString(),

                'end_date' =>
                    now()->endOfMonth()
                        ->toDateString(),

                'is_active' =>
                    true,
            ]);

        $anotherUser =
            User::factory()->create();

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->deleteJson(
                "/api/budgets/{$budget->id}"
            );

        $response->assertForbidden();

        $this->assertDatabaseHas(
            'budgets',
            [
                'id' =>
                    $budget->id,
            ]
        );
    }
}