<?php

namespace App\Policies;

use App\Models\UserNotification;
use App\Models\User;

class UserNotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, UserNotification $UserNotification): bool
    {
        return $UserNotification->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, UserNotification $UserNotification): bool
    {
        return $UserNotification->user_id === $user->id;
    }

    public function delete(User $user, UserNotification $UserNotification): bool
    {
        return $UserNotification->user_id === $user->id;
    }
}