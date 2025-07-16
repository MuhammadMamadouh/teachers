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
        'max_teachers',
        'duration_days',
        'price',
        'is_trial',
        'is_default',
        'plan_type', // 'individual' or 'multi_teacher'
        'category',
        'target_audience',
        'is_featured',
        'sort_order',
        'features',
        'billing_cycle',
        'yearly_price',
        'yearly_discount_percentage',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_trial' => 'boolean',
        'is_featured' => 'boolean',
        'price' => 'decimal:2',
        'yearly_price' => 'decimal:2',
        'features' => 'array',
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

    /**
     * Get featured plans
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Get individual plans
     */
    public function scopeIndividual($query)
    {
        return $query->where('category', 'individual');
    }

    /**
     * Get multi-teacher plans
     */
    public function scopeMultiTeacher($query)
    {
        return $query->where('category', 'multi_teacher');
    }

    /**
     * Get plans ordered by sort_order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('price');
    }

    /**
     * Get yearly price with discount
     */
    public function getYearlyPriceWithDiscountAttribute()
    {
        if ($this->yearly_discount_percentage) {
            return $this->price * 12 * (1 - ($this->yearly_discount_percentage / 100));
        }
        return $this->yearly_price ?: $this->price * 12;
    }

    /**
     * Get monthly equivalent of yearly price
     */
    public function getMonthlyEquivalentAttribute()
    {
        return $this->yearly_price_with_discount / 12;
    }

    /**
     * Get savings amount with yearly billing
     */
    public function getYearlySavingsAttribute()
    {
        return ($this->price * 12) - $this->yearly_price_with_discount;
    }
}
