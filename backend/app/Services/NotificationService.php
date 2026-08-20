<?php

namespace App\Services;

use App\Mail\UserNotificationMail;
use App\Models\NotificationPreference;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public function create(
        User $user,
        array $notification
    ): UserNotification {
        $userNotification = UserNotification::create([
            'user_id' =>
                $user->id,

            'type' =>
                $notification['priority'] ??
                'info',

            'title' =>
                $notification['title'],

            'message' =>
                $notification['message'],

            'data' =>
                $notification,
        ]);

        $this->sendEmailIfAllowed(
            $user,
            $userNotification,
            $notification,
        );

        return $userNotification;
    }

    private function sendEmailIfAllowed(
        User $user,
        UserNotification $notification,
        array $payload,
    ): void {
        if (
            empty($user->email)
        ) {
            return;
        }

        $preferences =
            $user->notificationPreferences()
                ->firstOrCreate([
                    'user_id' => $user->id,
                ]);

        /*
        |--------------------------------------------------------------------------
        | Security notifications always get emailed.
        |--------------------------------------------------------------------------
        */

        $category =
            $payload['email_category']
            ?? 'financial';

        if (
            $category === 'security'
        ) {
            Mail::to($user)->queue(
                new UserNotificationMail(
                    $user,
                    $notification,
                )
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Master email switch.
        |--------------------------------------------------------------------------
        */

        if (
            ! $preferences
                ->email_notifications
        ) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Category preferences.
        |--------------------------------------------------------------------------
        */

        $allowed = match ($category) {
            'budget' =>
                $preferences
                    ->budget_alerts,

            'savings' =>
                $preferences
                    ->savings_alerts,

            'financial' =>
                $preferences
                    ->financial_activity,

            default =>
                true,
        };

        if (! $allowed) {
            return;
        }

        Mail::to($user)->queue(
            new UserNotificationMail(
                $user,
                $notification,
            )
        );
    }

    public function unread(
        User $user
    ) {
        return UserNotification::where(
            'user_id',
            $user->id
        )
            ->whereNull(
                'read_at'
            )
            ->latest()
            ->get();
    }

    public function all(
        User $user
    ) {
        return UserNotification::where(
            'user_id',
            $user->id
        )
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