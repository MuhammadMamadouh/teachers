<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;
    protected $fillable = [
        'student_id',
        'group_id',
        'payment_type',
        'related_date',
        'amount',
        'is_paid',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'amount' => 'decimal:2',
        'related_date' => 'date',
        'paid_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Get the attendance record for per-session payments
     */
    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class, 'related_date', 'date')
            ->where('student_id', $this->student_id)
            ->where('group_id', $this->group_id);
    }

    /**
     * Get formatted date based on payment type
     */
    public function getFormattedDateAttribute(): string
    {
        if ($this->payment_type === 'monthly') {
            return $this->related_date->format('F Y');
        } else {
            return $this->related_date->format('d/m/Y');
        }
    }

    /**
     * Get payment type label in Arabic
     */
    public function getPaymentTypeLabel(): string
    {
        return $this->payment_type === 'monthly' ? 'شهري' : 'بالجلسة';
    }

    /**
     * Check if payment is overdue
     */
    public function isOverdue(): bool
    {
        if ($this->is_paid) {
            return false;
        }

        if ($this->payment_type === 'monthly') {
            // Monthly payments are overdue if it's past the end of the month
            return $this->related_date->endOfMonth()->isPast();
        } else {
            // Per-session payments are overdue if it's been more than 7 days
            return $this->related_date->addDays(7)->isPast();
        }
    }
}
