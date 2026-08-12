<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [

            'user_id' => User::factory(),

            'name' => fake()->randomElement([
                'Cash Wallet',
                'GTBank',
                'Opay',
                'Kuda',
                'Savings Account',
            ]),

            'type' => fake()->randomElement([
                'cash',
                'bank',
                'credit_card',
                'mobile_wallet',
                'crypto',
            ]),

            'balance' => fake()->randomFloat(2, 0, 500000),

            'currency' => 'NGN',

            'icon' => 'wallet',

            'color' => '#3B82F6',

            'is_default' => false,

        ];
    }

    public function default(): static
    {
        return $this->state(fn () => [

            'name' => 'Cash Wallet',

            'type' => 'cash',

            'balance' => 0,

            'is_default' => true,

        ]);
    }
}