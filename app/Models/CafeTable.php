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
     * Check if the table is currently available.
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
