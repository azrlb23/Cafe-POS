<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMutation extends Model
{
    protected $fillable = [
        'raw_material_id',
        'type', // 'in', 'out'
        'quantity',
        'reference', // e.g. Order #123
        'notes',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
    ];

    public function rawMaterial(): BelongsTo
    {
        return $this->belongsTo(RawMaterial::class);
    }
}
