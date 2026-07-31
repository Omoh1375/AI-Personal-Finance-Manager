<?php

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Models\Account;

class CreateDefaultAccount
{
    public function handle(UserRegistered $event): void
    {
        Account::create([
            'user_id' => $event->user->id,
            'name' => 'Cash Wallet',
            'type' => 'cash',
            'balance' => 0,
            'currency' => 'NGN',
            'icon' => 'wallet',
            'color' => '#22C55E',
            'is_default' => true,
        ]);
    }
}