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

        $this->assertEquals(1500, (float) $account->balance);
    }

    public function test_guest_cannot_create_income(): void
    {
        $response = $this->postJson('/api/incomes', []);

        $response->assertUnauthorized();
    }

    public function test_user_cannot_use_another_users_account(): void
    {
        $owner = User::factory()->create();

        $account = $this->createAccount($owner);

        $category = $this->createIncomeCategory($owner);

        $anotherUser = User::factory()->create();

        Sanctum::actingAs($anotherUser);

        $response = $this->postJson('/api/incomes', [
            'account_id'  => $account->id,
            'category_id' => $category->id,
            'amount'      => 500,
            'received_at' => now()->toDateString(),
        ]);

        $response->assertNotFound();

        $this->assertDatabaseCount('incomes', 0);
    }

    public function test_income_requires_valid_data(): void
    {
        $this->login();

        $response = $this->postJson('/api/incomes', []);

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

        $account = $this->createAccount($user);

        $category = $this->createIncomeCategory($user);

        $income = Income::factory()->create([
            'user_id'     => $user->id,
            'account_id'  => $account->id,
            'category_id' => $category->id,
        ]);

        $response = $this->getJson("/api/incomes/{$income->id}");

        $response->assertOk();
    }

    public function test_user_can_delete_income_and_balance_is_restored(): void
    {
        $user = $this->login();

        $account = $this->createAccount($user, [
            'balance' => 1000,
        ]);

        $category = $this->createIncomeCategory($user);

        $income = Income::create([
            'user_id'     => $user->id,
            'account_id'  => $account->id,
            'category_id' => $category->id,
            'amount'      => 500,
            'reference'   => 'INC-001',
            'description' => 'Salary',
            'received_at' => now(),
        ]);

        $account->increment('balance', 500);

        $response = $this->deleteJson("/api/incomes/{$income->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('incomes', [
            'id' => $income->id,
        ]);

        $account->refresh();

        $this->assertEquals(1000, (float) $account->balance);
    }

    public function test_user_cannot_delete_another_users_income(): void
    {
        $owner = User::factory()->create();

        $account = $this->createAccount($owner);

        $category = $this->createIncomeCategory($owner);

        $income = Income::factory()->create([
            'user_id'     => $owner->id,
            'account_id'  => $account->id,
            'category_id' => $category->id,
        ]);

        $anotherUser = User::factory()->create();

        Sanctum::actingAs($anotherUser);

        $response = $this->deleteJson("/api/incomes/{$income->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('incomes', [
            'id' => $income->id,
        ]);
    }
}