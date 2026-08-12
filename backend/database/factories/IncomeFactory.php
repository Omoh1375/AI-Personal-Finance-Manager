<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\Income;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class IncomeFactory extends Factory
{
    protected $model = Income::class;

    public function definition(): array
    {
        $user = User::factory();

        return [

            'user_id' => $user,

            'account_id' => Account::factory()->for($user),

            'category_id' => Category::factory()
                ->for($user)
                ->income(),

            'amount' => fake()->randomFloat(2, 1000, 500000),

            'reference' => strtoupper(fake()->bothify('INC-######')),

            'description' => fake()->sentence(),

            'received_at' => now(),

        ];
    }
}