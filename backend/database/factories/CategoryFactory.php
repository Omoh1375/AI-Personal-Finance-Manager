<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [

            'user_id' => User::factory(),

            'name' => fake()->randomElement([
                'Salary',
                'Food',
                'Transport',
                'Shopping',
                'Entertainment',
                'Bills',
                'Investment',
            ]),

            'type' => fake()->randomElement([
                'income',
                'expense',
            ]),

            'icon' => 'wallet',

            'color' => fake()->hexColor(),

            'description' => fake()->sentence(),

            'is_default' => false,

        ];
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

    public function default(): static
    {
        return $this->state(fn () => [
            'is_default' => true,
        ]);
    }
}