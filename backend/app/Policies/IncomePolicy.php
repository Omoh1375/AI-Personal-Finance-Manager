<?php

namespace App\Policies;

use App\Models\Income;
use App\Models\User;

class IncomePolicy
{
    /**
     * Any authenticated user can view their income list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Any authenticated user can create income.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * User can only view their own income.
     */
    public function view(User $user, Income $income): bool
    {
        return $user->id === $income->user_id;
    }

    /**
     * User can only update their own income.
     */
    public function update(User $user, Income $income): bool
    {
        return $user->id === $income->user_id;
    }

    /**
     * User can only delete their own income.
     */
    public function delete(User $user, Income $income): bool
    {
        return $user->id === $income->user_id;
    }

    public function restore(User $user, Income $income): bool
    {
        return false;
    }

    public function forceDelete(User $user, Income $income): bool
    {
        return false;
    }
}