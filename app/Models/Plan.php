<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'name',
        'max_students',
        'max_assistants',
        'duration_days',
        'price',
        'is_trial',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_trial' => 'boolean',
        'price' => 'decimal:2',
    ];

    /**
     * Get all subscriptions for this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the default trial plan.
     */
    public static function getDefaultTrial(): ?Plan
    {
        return static::where('is_trial', true)
                    ->where('is_default', true)
                    ->first();
    }

    /**
     * Format the price for display.
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2) . ' ج.م';
    }

    /**
     * Get duration in a human-readable format.
     */
    public function getFormattedDurationAttribute(): string
    {
        $days = $this->duration_days;
        
        if ($days == 30) {
            return 'شهر واحد';
        } elseif ($days == 90) {
            return '3 أشهر';
        } elseif ($days == 365) {
            return 'سنة واحدة';
        } else {
            return $days . ' يوم';
        }
    }
}
