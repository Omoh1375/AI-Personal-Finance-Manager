<?php

namespace App\Http\Controllers;

use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class NotificationPreferenceController extends Controller
{
    use ApiResponse;

    public function show(
        Request $request
    ) {
        $user = $request->user();

        $preferences =
            $user->notificationPreferences()
                ->firstOrCreate([
                    'user_id' => $user->id,
                ]);

        return $this->success(
            $preferences,
            'Notification preferences retrieved successfully.'
        );
    }

    public function update(
        Request $request
    ) {
        $validated =
            $request->validate([
                'email_notifications' =>
                    ['required', 'boolean'],

                'financial_activity' =>
                    ['required', 'boolean'],

                'budget_alerts' =>
                    ['required', 'boolean'],

                'savings_alerts' =>
                    ['required', 'boolean'],
            ]);

        $user = $request->user();

        $preferences =
            $user->notificationPreferences()
                ->firstOrCreate([
                    'user_id' => $user->id,
                ]);

        $preferences->update([
            ...$validated,

            /*
             * Security alerts cannot be disabled.
             */
            'security_alerts' => true,
        ]);

        return $this->success(
            $preferences->fresh(),
            'Notification preferences updated successfully.'
        );
    }
}