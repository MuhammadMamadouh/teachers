<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'max_students',
        'max_assistants',
        'price_per_month',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'price_per_month' => 'decimal:2',
    ];

    /**
     * Get all subscriptions for this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the default plan.
     */
    public static function getDefault(): ?Plan
    {
        return static::where('is_default', true)->first();
    }

    /**
     * Format the price for display.
     */
    public function getFormattedPriceAttribute(): string
    {
        return '$' . number_format($this->price_per_month, 2);
    }
}
