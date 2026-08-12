<?php

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\FeatureTestCase;

class AccountTest extends FeatureTestCase
{
    public function test_authenticated_user_can_create_account(): void
    {
        $this->login();

        $response = $this->postJson('/api/accounts', [
            'name' => 'GTBank',
            'type' => 'bank',
            'balance' => 50000,
            'currency' => 'NGN',
            'icon' => 'bank',
            'color' => '#3B82F6',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('accounts', [
            'name' => 'GTBank',
            'currency' => 'NGN',
        ]);
    }

    public function test_user_can_view_own_account(): void
    {
        $user = $this->login();

        $account = $this->createAccount($user);

        $response = $this->getJson("/api/accounts/{$account->id}");

        $response->assertOk();
    }

    public function test_user_cannot_view_another_users_account(): void
    {
        // Create the account owner
        $owner = User::factory()->create();

        $account = $this->createAccount($owner);

        // Authenticate as a different user
        $anotherUser = User::factory()->create();

        Sanctum::actingAs($anotherUser);

        $response = $this->getJson("/api/accounts/{$account->id}");

        $response->assertForbidden();
    }

    public function test_user_can_update_own_account(): void
    {
        $user = $this->login();

        $account = $this->createAccount($user);

        $response = $this->putJson("/api/accounts/{$account->id}", [
            'name' => 'Updated Wallet',
            'type' => 'cash',
            'balance' => 10000,
            'currency' => 'NGN',
            'icon' => 'wallet',
            'color' => '#000000',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
            'name' => 'Updated Wallet',
        ]);
    }

    public function test_user_cannot_update_another_users_account(): void
    {
        $owner = User::factory()->create();

        $account = $this->createAccount($owner);

        $anotherUser = User::factory()->create();

        Sanctum::actingAs($anotherUser);

        $response = $this->putJson("/api/accounts/{$account->id}", [
            'name' => 'Hacked Account',
            'type' => 'cash',
            'balance' => 1000,
            'currency' => 'NGN',
            'icon' => 'wallet',
            'color' => '#000000',
        ]);

        $response->assertForbidden();

        $this->assertDatabaseMissing('accounts', [
            'id' => $account->id,
            'name' => 'Hacked Account',
        ]);
    }

    public function test_user_can_delete_account(): void
    {
        $user = $this->login();

        $account = Account::factory()->create([
            'user_id' => $user->id,
            'is_default' => false,
        ]);

        $response = $this->deleteJson("/api/accounts/{$account->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('accounts', [
            'id' => $account->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_account(): void
    {
        $owner = User::factory()->create();

        $account = Account::factory()->create([
            'user_id' => $owner->id,
            'is_default' => false,
        ]);

        $anotherUser = User::factory()->create();

        Sanctum::actingAs($anotherUser);

        $response = $this->deleteJson("/api/accounts/{$account->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
        ]);
    }

    public function test_default_account_cannot_be_deleted(): void
    {
        $user = $this->login();

        $account = Account::factory()->default()->create([
            'user_id' => $user->id,
        ]);

        $response = $this->deleteJson("/api/accounts/{$account->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
        ]);
    }
}