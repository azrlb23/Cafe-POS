<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MenuOptionGroup extends Model
{
    protected $fillable = [
        'menu_id',
        'name',
        'min_select',
        'max_select',
    ];

    protected $casts = [
        'min_select' => 'integer',
        'max_select' => 'integer',
    ];

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    public function menuOptionItems(): HasMany
    {
        return $this->hasMany(MenuOptionItem::class);
    }
}
