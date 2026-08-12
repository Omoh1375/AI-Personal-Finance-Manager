<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransferFactory extends Factory
{
    protected $model = Transfer::class;

    public function definition(): array
    {
        $user = User::factory();

        return [

            'user_id' => $user,

            'from_account_id' => Account::factory()->for($user),

            'to_account_id' => Account::factory()->for($user),

            'amount' => fake()->randomFloat(2, 100, 50000),

            'reference' => strtoupper(fake()->bothify('TRF-######')),

            'description' => fake()->sentence(),

            'transferred_at' => now(),

        ];
    }

    /**
     * Ensures from and to accounts are different.
     */
    public function configure(): static
    {
        return $this->afterMaking(function (Transfer $transfer) {

            if ($transfer->from_account_id === $transfer->to_account_id) {

                $transfer->to_account_id = Account::factory()->create([
                    'user_id' => $transfer->user_id,
                ])->id;
            }

        });
    }
}