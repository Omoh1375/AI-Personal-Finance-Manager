<?php

namespace App\Mail;

use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public UserNotification $notification,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->notification->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown:
                'emails.notifications.user-notification',
        );
    }
}