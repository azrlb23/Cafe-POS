<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PettyCash extends Model
{
    protected $fillable = [
        'shift_id',
        'user_id',
        'amount',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    /**
     * The shift this petty cash belongs to.
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    /**
     * The user (cashier) who logged this petty cash.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
