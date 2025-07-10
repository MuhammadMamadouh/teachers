<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'plan_id',
        'max_students',
        'is_active',
        'is_trial',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_trial' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the user that owns the subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan for this subscription.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    /**
     * Check if the subscription is currently active.
     */
    public function isCurrentlyActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        // If no start date, assume it's active
        if (!$this->start_date) {
            return $this->end_date ? $now->lessThanOrEqualTo($this->end_date) : true;
        }

        // If no end date, check if start date has passed
        if (!$this->end_date) {
            return $now->greaterThanOrEqualTo($this->start_date);
        }

        // Check if current date is within the subscription period
        return $now->between($this->start_date, $this->end_date);
    }

    /**
     * Get days remaining in subscription.
     */
    public function getDaysRemainingAttribute(): int
    {
        if (!$this->end_date || !$this->isCurrentlyActive()) {
            return 0;
        }

        return now()->diffInDays($this->end_date, false);
    }

    /**
     * Check if subscription is expired.
     */
    public function isExpired(): bool
    {
        return $this->end_date && now()->isAfter($this->end_date);
    }

    /**
     * Mark subscription as expired.
     */
    public function markAsExpired(): void
    {
        $this->update(['is_active' => false]);
    }
}
