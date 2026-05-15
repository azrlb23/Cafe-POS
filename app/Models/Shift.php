<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shift extends Model
{
    protected $fillable = [
        'user_id',
        'opened_at',
        'closed_at',
        'opening_cash',
        'closing_cash',
        'total_sales',
        'total_cash_sales',
        'total_petty_cash',
        'expected_closing_cash',
        'notes',
    ];

    protected $appends = ['running_balance'];

    protected $casts = [
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
        'opening_cash' => 'decimal:2',
        'closing_cash' => 'decimal:2',
        'total_sales' => 'decimal:2',
        'total_cash_sales' => 'decimal:2',
        'total_petty_cash' => 'decimal:2',
        'expected_closing_cash' => 'decimal:2',
    ];

    /**
     * Get the current running cash balance in the drawer.
     */
    public function getRunningBalanceAttribute()
    {
        return $this->opening_cash + $this->total_cash_sales - $this->total_petty_cash;
    }

    /**
     * The cashier who owns this shift.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Orders made during this shift.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Petty cash logged during this shift.
     */
    public function pettyCashes(): HasMany
    {
        return $this->hasMany(PettyCash::class);
    }

    /**
     * Check if the shift is still active (not yet closed).
     */
    public function isActive(): bool
    {
        return is_null($this->closed_at);
    }
}
