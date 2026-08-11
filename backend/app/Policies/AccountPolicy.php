<?php

namespace App\Policies;

use App\Models\Account;
use App\Models\User;

class AccountPolicy
{
    /**
     * Any authenticated user can view their accounts list.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Any authenticated user can create an account.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * A user may only view their own account.
     */
    public function view(User $user, Account $account): bool
    {
        return $user->id === $account->user_id;
    }

    /**
     * A user may only update their own account.
     */
    public function update(User $user, Account $account): bool
    {
        return $user->id === $account->user_id;
    }

    /**
     * A user may only delete their own account,
     * and default accounts cannot be deleted.
     */
    public function delete(User $user, Account $account): bool
    {
        return $user->id === $account->user_id
            && ! $account->is_default;
    }

    /**
     * Restore is not supported.
     */
    public function restore(User $user, Account $account): bool
    {
        return false;
    }

    /**
     * Force delete is not supported.
     */
    public function forceDelete(User $user, Account $account): bool
    {
        return false;
    }
}