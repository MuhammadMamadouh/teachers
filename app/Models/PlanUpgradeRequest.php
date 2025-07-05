<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanUpgradeRequest extends Model
{

    // public $table = 'plan_upgrade_requests';
    protected $fillable = [
        'user_id',
        'current_plan_id',
        'requested_plan_id',
        'status',
        'notes',
        'admin_notes',
        'approved_at',
        'approved_by',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    /**
     * Get the user who requested the upgrade.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the current plan.
     */
    public function currentPlan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'current_plan_id');
    }

    /**
     * Get the requested plan.
     */
    public function requestedPlan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'requested_plan_id');
    }

    /**
     * Get the admin who approved the request.
     */
    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if the request is pending.
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the request is approved.
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if the request is rejected.
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Approve the upgrade request.
     */
    public function approve(User $admin, string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $admin->id,
            'admin_notes' => $notes,
        ]);
    }

    /**
     * Reject the upgrade request.
     */
    public function reject(User $admin, string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $admin->id,
            'admin_notes' => $notes,
        ]);
    }
}
