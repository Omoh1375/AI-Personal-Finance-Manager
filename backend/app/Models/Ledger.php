<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Ledger extends Model
{
    use HasFactory;

   protected $fillable = [
        'user_id',

        'account_id',

        'transaction_uuid',

        'ledgerable_type',

        'ledgerable_id',

        'entry_type',

        'amount',

        'balance_after',

        'description',

        'transaction_date',

    ];

    protected $casts = [

        'amount' => 'decimal:2',

        'balance_after' => 'decimal:2',

        'transaction_date' => 'datetime',

    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function ledgerable(): MorphTo
    {
        return $this->morphTo();
    }
}