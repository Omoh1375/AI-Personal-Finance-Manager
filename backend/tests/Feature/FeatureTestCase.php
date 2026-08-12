<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

abstract class FeatureTestCase extends TestCase
{
    use RefreshDatabase;

    protected function login(): User
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        return $user;
    }

    protected function createAccount(
        User $user,
        array $attributes = []
    ): Account {

        return Account::factory()->create(array_merge([

            'user_id' => $user->id,

        ], $attributes));
    }

    protected function createIncomeCategory(
        User $user,
        array $attributes = []
    ): Category {

        return Category::factory()
            ->income()
            ->create(array_merge([

                'user_id' => $user->id,

            ], $attributes));
    }

    protected function createExpenseCategory(
        User $user,
        array $attributes = []
    ): Category {

        return Category::factory()
            ->expense()
            ->create(array_merge([

                'user_id' => $user->id,

            ], $attributes));
    }
}