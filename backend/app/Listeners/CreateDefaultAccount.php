<?php

namespace App\Listeners;

use App\Models\Account;
use Illuminate\Auth\Events\Registered;

class CreateDefaultAccount
{
    public function handle(Registered $event): void
    {
        Account::firstOrCreate(
            [
                'user_id' => $event->user->id,
                'is_default' => true,
            ],
            [
                'name' => 'Cash Wallet',
                'type' => 'cash',
                'balance' => 0,
                'currency' => 'NGN',
                'icon' => 'wallet',
                'color' => '#22C55E',
            ]
        );
    }
}