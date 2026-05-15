<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItemOption extends Model
{
    protected $fillable = [
        'order_item_id',
        'menu_option_item_id',
        'option_group_name',
        'option_name',
        'price_modifier',
    ];

    protected $casts = [
        'price_modifier' => 'decimal:2',
    ];

    /**
     * The order item this option belongs to.
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * The original menu option item reference.
     */
    public function menuOptionItem(): BelongsTo
    {
        return $this->belongsTo(MenuOptionItem::class);
    }
}
