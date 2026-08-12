<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\SavingsDeposit;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SavingsDepositFactory extends Factory
{
    protected $model = SavingsDeposit::class;

    public function definition(): array
    {
        $user = User::factory();

        return [

            'user_id' => $user,

            'account_id' => Account::factory()->for($user),

            'savings_goal_id' => SavingsGoal::factory()->for($user),

            'amount' => fake()->randomFloat(2, 1000, 100000),

            'reference' => strtoupper(fake()->bothify('SAV-######')),

            'description' => fake()->sentence(),

            'deposited_at' => now(),

        ];
    }
}