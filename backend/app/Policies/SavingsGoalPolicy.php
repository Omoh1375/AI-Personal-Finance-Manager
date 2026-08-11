<?php

namespace App\Policies;

use App\Models\SavingsGoal;
use App\Models\User;

class SavingsGoalPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, SavingsGoal $SavingsGoal): bool
    {
        return $SavingsGoal->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, SavingsGoal $SavingsGoal): bool
    {
        return $SavingsGoal->user_id === $user->id;
    }

    public function delete(User $user, SavingsGoal $SavingsGoal): bool
    {
        return $SavingsGoal->user_id === $user->id;
    }
}