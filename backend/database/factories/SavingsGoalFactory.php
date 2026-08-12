<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SavingsGoalFactory extends Factory
{
    protected $model = SavingsGoal::class;

    public function definition(): array
    {
        $user = User::factory();

        $target = fake()->randomFloat(2, 50000, 1000000);

        $current = fake()->randomFloat(2, 0, $target);

        return [

            'user_id' => $user,

            'account_id' => Account::factory()->for($user),

            'name' => fake()->randomElement([
                'Emergency Fund',
                'Vacation',
                'Car',
                'House',
                'Business',
            ]),

            'target_amount' => $target,

            'current_amount' => $current,

            'target_date' => now()->addMonths(fake()->numberBetween(3, 24)),

            'description' => fake()->sentence(),

            'is_completed' => false,

        ];
    }

    public function completed(): static
    {
        return $this->state(function () {

            $target = fake()->randomFloat(2, 50000, 1000000);

            return [

                'target_amount' => $target,

                'current_amount' => $target,

                'is_completed' => true,

            ];

        });
    }
}