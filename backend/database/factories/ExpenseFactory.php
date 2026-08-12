<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\Expense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseFactory extends Factory
{
    protected $model = Expense::class;

    public function definition(): array
    {
        $user = User::factory();

        return [

            'user_id' => $user,

            'account_id' => Account::factory()->for($user),

            'category_id' => Category::factory()
                ->for($user)
                ->expense(),

            'amount' => fake()->randomFloat(2, 100, 50000),

            'reference' => strtoupper(fake()->bothify('EXP-######')),

            'merchant' => fake()->company(),

            'description' => fake()->sentence(),

            'spent_at' => now(),

        ];
    }
}