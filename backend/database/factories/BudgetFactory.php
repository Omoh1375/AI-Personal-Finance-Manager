<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    public function definition(): array
    {
        $user = User::factory();

        return [

            'user_id' => $user,

            'category_id' => Category::factory()
                ->for($user)
                ->expense(),

            'amount' => fake()->randomFloat(2, 5000, 500000),

            'start_date' => now()->startOfMonth(),

            'end_date' => now()->endOfMonth(),

            'is_active' => true,

        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => [

            'is_active' => false,

        ]);
    }
}