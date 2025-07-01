<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'max_students',
        'is_active',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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
}
