<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringTransaction extends Model
{
    use HasFactory;

    protected $fillable = [

        'user_id',

        'account_id',

        'category_id',

        'type',

        'amount',

        'title',

        'description',

        'frequency',

        'start_date',

        'end_date',

        'next_run_date',

        'is_active',

    ];

    protected $casts = [

        'amount' => 'decimal:2',

        'start_date' => 'date',

        'end_date' => 'date',

        'next_run_date' => 'date',

        'is_active' => 'boolean',

    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}