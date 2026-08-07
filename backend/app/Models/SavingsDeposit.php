<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class SavingsDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'savings_goal_id',
        'account_id',
        'amount',
        'reference',
        'description',
        'deposited_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'deposited_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function savingsGoal(): BelongsTo
    {
        return $this->belongsTo(SavingsGoal::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function ledgers(): MorphMany
    {
        return $this->morphMany(Ledger::class, 'ledgerable');
    }
}