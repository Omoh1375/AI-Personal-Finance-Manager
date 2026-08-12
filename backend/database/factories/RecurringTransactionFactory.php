<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class RecurringTransactionFactory extends Factory
{
    protected $model = RecurringTransaction::class;

    public function definition(): array
    {
        $user = User::factory();

        $type = fake()->randomElement([
            'income',
            'expense',
        ]);

        return [

            'user_id' => $user,

            'account_id' => Account::factory()->for($user),

            'category_id' => Category::factory()
                ->for($user)
                ->state([
                    'type' => $type,
                ]),

            'type' => $type,

            'amount' => fake()->randomFloat(2, 1000, 50000),

            'title' => fake()->words(3, true),

            'description' => fake()->sentence(),

            'frequency' => fake()->randomElement([
                'daily',
                'weekly',
                'monthly',
                'yearly',
            ]),

            'start_date' => today(),

            'end_date' => today()->addMonths(12),

            'next_run_date' => today()->addDay(),

            'is_active' => true,

        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [

            'is_active' => false,

        ]);
    }

    public function income(): static
    {
        return $this->state(fn () => [

            'type' => 'income',

        ]);
    }

    public function expense(): static
    {
        return $this->state(fn () => [

            'type' => 'expense',

        ]);
    }
}