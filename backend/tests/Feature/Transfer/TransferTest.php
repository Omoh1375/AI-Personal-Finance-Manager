<?php

namespace Tests\Feature\Transfer;

use App\Models\Transfer;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\FeatureTestCase;

class TransferTest extends FeatureTestCase
{
    public function test_authenticated_user_can_transfer_between_accounts(): void
    {
        $user = $this->login();

        $fromAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 5000,
                ]
            );

        $toAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 1000,
                ]
            );

        $response =
            $this->postJson(
                '/api/transfers',
                [
                    'from_account_id' =>
                        $fromAccount->id,

                    'to_account_id' =>
                        $toAccount->id,

                    'amount' =>
                        1500,

                    'reference' =>
                        'TRF-001',

                    'description' =>
                        'Wallet Transfer',

                    'transferred_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertCreated();

        $this->assertDatabaseHas(
            'transfers',
            [
                'user_id' =>
                    $user->id,

                'from_account_id' =>
                    $fromAccount->id,

                'to_account_id' =>
                    $toAccount->id,

                'amount' =>
                    1500,
            ]
        );

        $fromAccount->refresh();
        $toAccount->refresh();

        $this->assertEquals(
            3500,
            (float) $fromAccount->balance
        );

        $this->assertEquals(
            2500,
            (float) $toAccount->balance
        );
    }

    public function test_guest_cannot_create_transfer(): void
    {
        $response =
            $this->postJson(
                '/api/transfers',
                []
            );

        $response->assertUnauthorized();
    }

    public function test_user_cannot_transfer_to_same_account(): void
    {
        $user = $this->login();

        $account =
            $this->createAccount(
                $user,
                [
                    'balance' => 5000,
                ]
            );

        $response =
            $this->postJson(
                '/api/transfers',
                [
                    'from_account_id' =>
                        $account->id,

                    'to_account_id' =>
                        $account->id,

                    'amount' =>
                        1000,

                    'transferred_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertStatus(422);

        $this->assertDatabaseCount(
            'transfers',
            0
        );
    }

    public function test_user_cannot_transfer_with_insufficient_balance(): void
    {
        $user = $this->login();

        $fromAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 500,
                ]
            );

        $toAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 1000,
                ]
            );

        $response =
            $this->postJson(
                '/api/transfers',
                [
                    'from_account_id' =>
                        $fromAccount->id,

                    'to_account_id' =>
                        $toAccount->id,

                    'amount' =>
                        1000,

                    'transferred_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertStatus(422);

        $this->assertDatabaseCount(
            'transfers',
            0
        );

        $fromAccount->refresh();
        $toAccount->refresh();

        $this->assertEquals(
            500,
            (float) $fromAccount->balance
        );

        $this->assertEquals(
            1000,
            (float) $toAccount->balance
        );
    }

    public function test_user_cannot_use_another_users_account(): void
    {
        $owner =
            User::factory()->create();

        $fromAccount =
            $this->createAccount(
                $owner,
                [
                    'balance' => 5000,
                ]
            );

        $toAccount =
            $this->createAccount(
                $owner,
                [
                    'balance' => 1000,
                ]
            );

        $anotherUser =
            User::factory()->create();

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->postJson(
                '/api/transfers',
                [
                    'from_account_id' =>
                        $fromAccount->id,

                    'to_account_id' =>
                        $toAccount->id,

                    'amount' =>
                        1000,

                    'transferred_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertNotFound();

        $this->assertDatabaseCount(
            'transfers',
            0
        );
    }

    public function test_transfer_requires_valid_data(): void
    {
        $this->login();

        $response =
            $this->postJson(
                '/api/transfers',
                []
            );

        $response->assertStatus(422);

        $response->assertJsonValidationErrors([
            'from_account_id',
            'to_account_id',
            'amount',
            'transferred_at',
        ]);
    }

    public function test_user_can_update_own_transfer_and_balances_are_correct(): void
    {
        $user = $this->login();

        $fromAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 3500,
                ]
            );

        $toAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 2500,
                ]
            );

        $transfer =
            Transfer::create([
                'user_id' =>
                    $user->id,

                'from_account_id' =>
                    $fromAccount->id,

                'to_account_id' =>
                    $toAccount->id,

                'amount' =>
                    1500,

                'reference' =>
                    'TRF-001',

                'description' =>
                    'Original transfer',

                'transferred_at' =>
                    now(),
            ]);

        $response =
            $this->putJson(
                "/api/transfers/{$transfer->id}",
                [
                    'from_account_id' =>
                        $fromAccount->id,

                    'to_account_id' =>
                        $toAccount->id,

                    'amount' =>
                        2000,

                    'reference' =>
                        'TRF-002',

                    'description' =>
                        'Updated transfer',

                    'transferred_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertOk();

        $transfer->refresh();
        $fromAccount->refresh();
        $toAccount->refresh();

        $this->assertEquals(
            2000,
            (float) $transfer->amount
        );

        /*
         * Starting balances represent the old
         * ₦1,500 transfer:
         *
         * Source = 3500
         * Destination = 2500
         *
         * Reverse old transfer:
         * Source = 5000
         * Destination = 1000
         *
         * Apply new ₦2,000 transfer:
         * Source = 3000
         * Destination = 3000
         */

        $this->assertEquals(
            3000,
            (float) $fromAccount->balance
        );

        $this->assertEquals(
            3000,
            (float) $toAccount->balance
        );
    }

    public function test_user_can_move_transfer_to_other_owned_accounts(): void
    {
        $user = $this->login();

        $oldFrom =
            $this->createAccount(
                $user,
                [
                    'balance' => 3500,
                ]
            );

        $oldTo =
            $this->createAccount(
                $user,
                [
                    'balance' => 2500,
                ]
            );

        $newFrom =
            $this->createAccount(
                $user,
                [
                    'balance' => 4000,
                ]
            );

        $newTo =
            $this->createAccount(
                $user,
                [
                    'balance' => 1000,
                ]
            );

        $transfer =
            Transfer::create([
                'user_id' =>
                    $user->id,

                'from_account_id' =>
                    $oldFrom->id,

                'to_account_id' =>
                    $oldTo->id,

                'amount' =>
                    1500,

                'transferred_at' =>
                    now(),
            ]);

        $response =
            $this->putJson(
                "/api/transfers/{$transfer->id}",
                [
                    'from_account_id' =>
                        $newFrom->id,

                    'to_account_id' =>
                        $newTo->id,

                    'amount' =>
                        1200,

                    'reference' =>
                        'MOVED-001',

                    'description' =>
                        'Moved transfer',

                    'transferred_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertOk();

        $oldFrom->refresh();
        $oldTo->refresh();
        $newFrom->refresh();
        $newTo->refresh();

        $this->assertEquals(
            5000,
            (float) $oldFrom->balance
        );

        $this->assertEquals(
            1000,
            (float) $oldTo->balance
        );

        $this->assertEquals(
            2800,
            (float) $newFrom->balance
        );

        $this->assertEquals(
            2200,
            (float) $newTo->balance
        );
    }

    public function test_user_cannot_update_another_users_transfer(): void
    {
        $owner =
            User::factory()->create();

        $fromAccount =
            $this->createAccount(
                $owner
            );

        $toAccount =
            $this->createAccount(
                $owner
            );

        $transfer =
            Transfer::create([
                'user_id' =>
                    $owner->id,

                'from_account_id' =>
                    $fromAccount->id,

                'to_account_id' =>
                    $toAccount->id,

                'amount' =>
                    500,

                'transferred_at' =>
                    now(),
            ]);

        $anotherUser =
            User::factory()->create();

        $anotherFrom =
            $this->createAccount(
                $anotherUser,
                [
                    'balance' => 3000,
                ]
            );

        $anotherTo =
            $this->createAccount(
                $anotherUser,
                [
                    'balance' => 1000,
                ]
            );

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->putJson(
                "/api/transfers/{$transfer->id}",
                [
                    'from_account_id' =>
                        $anotherFrom->id,

                    'to_account_id' =>
                        $anotherTo->id,

                    'amount' =>
                        1500,

                    'transferred_at' =>
                        now()->toDateString(),
                ]
            );

        $response->assertForbidden();

        $transfer->refresh();

        $this->assertEquals(
            500,
            (float) $transfer->amount
        );
    }

    public function test_user_can_delete_transfer_and_restore_balances(): void
    {
        $user = $this->login();

        $fromAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 3500,
                ]
            );

        $toAccount =
            $this->createAccount(
                $user,
                [
                    'balance' => 2500,
                ]
            );

        $transfer =
            Transfer::factory()->create([
                'user_id' =>
                    $user->id,

                'from_account_id' =>
                    $fromAccount->id,

                'to_account_id' =>
                    $toAccount->id,

                'amount' =>
                    1500,
            ]);

        $response =
            $this->deleteJson(
                "/api/transfers/{$transfer->id}"
            );

        $response->assertOk();

        $this->assertDatabaseMissing(
            'transfers',
            [
                'id' =>
                    $transfer->id,
            ]
        );

        $fromAccount->refresh();
        $toAccount->refresh();

        $this->assertEquals(
            5000,
            (float) $fromAccount->balance
        );

        $this->assertEquals(
            1000,
            (float) $toAccount->balance
        );
    }

    public function test_user_cannot_delete_another_users_transfer(): void
    {
        $owner =
            User::factory()->create();

        $fromAccount =
            $this->createAccount(
                $owner
            );

        $toAccount =
            $this->createAccount(
                $owner
            );

        $transfer =
            Transfer::factory()->create([
                'user_id' =>
                    $owner->id,

                'from_account_id' =>
                    $fromAccount->id,

                'to_account_id' =>
                    $toAccount->id,
            ]);

        $anotherUser =
            User::factory()->create();

        Sanctum::actingAs(
            $anotherUser
        );

        $response =
            $this->deleteJson(
                "/api/transfers/{$transfer->id}"
            );

        $response->assertForbidden();

        $this->assertDatabaseHas(
            'transfers',
            [
                'id' =>
                    $transfer->id,
            ]
        );
    }
}