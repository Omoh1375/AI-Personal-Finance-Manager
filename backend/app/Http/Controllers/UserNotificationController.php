<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserNotificationResource;
use App\Models\UserNotification;
use App\Services\NotificationService;
use App\Traits\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;

class UserNotificationController extends Controller
{
    use ApiResponse, AuthorizesRequests;

    public function __construct(
        private NotificationService $service
    ) {}

    public function index()
    {
        $this->authorize('viewAny', UserNotification::class);
        $this->authorize('view', UserNotification::class);
        $user = Auth::user();

        abort_if(!$user, 401);

        return $this->success(
            UserNotificationResource::collection(
                $this->service->all($user)
            )
        );
    }

    public function unread()
    {
        $this->authorize('viewAny', UserNotification::class);
        $this->authorize('view', UserNotification::class);
        $user = Auth::user();

        abort_if(!$user, 401);

        return $this->success(
            UserNotificationResource::collection(
                $this->service->unread($user)
            )
        );
    }

    public function markAsRead(
        UserNotification $notification
    )
    {
        $this->authorize('viewAny', UserNotification::class);
        $this->authorize('view', $notification);
        abort_if(
            Auth::guest() || $notification->user_id !== Auth::id(),
            403
        );

        $this->service->markAsRead(
            $notification
        );

        return $this->success(
            null,
            'Notification marked as read.'
        );
    }
}