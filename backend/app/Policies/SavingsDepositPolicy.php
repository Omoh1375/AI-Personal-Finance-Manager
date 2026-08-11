<?php

namespace App\Policies;

use App\Models\SavingsDeposit;
use App\Models\User;

class SavingsDepositPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SavingsDeposit $SavingsDeposit): bool
    {
        return $SavingsDeposit->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SavingsDeposit $SavingsDeposit): bool
    {
        return $SavingsDeposit->user_id === $user->id;
    }

    public function delete(User $user, SavingsDeposit $SavingsDeposit): bool
    {
        return $SavingsDeposit->user_id === $user->id;
    }
}