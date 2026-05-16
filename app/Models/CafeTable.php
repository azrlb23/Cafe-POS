<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CafeTable extends Model
{
    protected $fillable = [
        'number',
        'status',
    ];

    /**
     * Orders assigned to this table.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'cafe_table_id');
    }

    /**
     * Get the active order for this table.
     */
    public function activeOrder()
    {
        return $this->hasOne(Order::class, 'cafe_table_id')
            ->whereIn('status', ['pending', 'preparing', 'ready']);
    }

    /**
     * Check if the table is currently available.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
