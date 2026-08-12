<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserNotificationFactory extends Factory
{
    protected $model = UserNotification::class;

    public function definition(): array
    {
        return [

            'user_id' => User::factory(),

            'type' => fake()->randomElement([
                'info',
                'success',
                'warning',
                'high',
                'medium',
                'low',
            ]),

            'title' => fake()->sentence(3),

            'message' => fake()->paragraph(),

            'data' => [

                'source' => 'factory',

                'generated_at' => now()->toDateTimeString(),

            ],

            'read_at' => null,

        ];
    }

    public function read(): static
    {
        return $this->state(fn () => [

            'read_at' => now(),

        ]);
    }

    public function unread(): static
    {
        return $this->state(fn () => [

            'read_at' => null,

        ]);
    }
}