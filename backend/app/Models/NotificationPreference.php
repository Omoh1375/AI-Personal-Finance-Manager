<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'email_notifications',
        'financial_activity',
        'budget_alerts',
        'savings_alerts',
        'security_alerts',
    ];

    protected function casts(): array
    {
        return [
            'email_notifications' => 'boolean',
            'financial_activity' => 'boolean',
            'budget_alerts' => 'boolean',
            'savings_alerts' => 'boolean',
            'security_alerts' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}