<?php

namespace App\Services;

use App\Models\UserNotification;
use App\Models\User;

class NotificationService
{
    public function create(
        User $user,
        array $notification
    ): UserNotification {

        return UserNotification::create([

            'user_id' => $user->id,

            'type' => $notification['priority'] ?? 'info',

            'title' => $notification['title'],

            'message' => $notification['message'],

            'data' => $notification,

        ]);
    }

    public function unread(User $user)
    {
        return UserNotification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->latest()
            ->get();
    }

    public function all(User $user)
    {
        return UserNotification::where('user_id', $user->id)
            ->latest()
            ->paginate(20);
    }

    public function markAsRead(
        UserNotification $notification
    ): void {

        $notification->update([
            'read_at' => now(),
        ]);
    }
}