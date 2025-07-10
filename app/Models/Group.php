<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'max_students',
        'is_active',
        'payment_type',
        'student_price',
        'academic_year_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'student_price' => 'decimal:2',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(GroupSchedule::class);
    }

    /**
     * Get the students that are directly assigned to this group (primary group).
     */
    public function assignedStudents(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Alias for assignedStudents relationship for consistency with tests.
     */
    public function students(): HasMany
    {
        return $this->assignedStudents();
    }



    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function specialSessions(): HasMany
    {
        return $this->hasMany(GroupSpecialSession::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the academic year that the group belongs to.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Calculate expected monthly income for this group
     */
    public function getExpectedMonthlyIncome(): float
    {
        if ($this->payment_type === 'monthly') {
            $studentCount = $this->assignedStudents()->count();

            return $studentCount * $this->student_price;
        }

        return 0;
    }

    /**
     * Calculate expected income per session for this group
     */
    public function getExpectedIncomePerSession(): float
    {
        if ($this->payment_type === 'per_session') {
            $studentCount = $this->assignedStudents()->count();

            return $studentCount * $this->student_price;
        }

        return 0;
    }

    /**
     * Calculate actual income for a specific attendance session
     */
    public function getActualIncomeForAttendance($attendanceId): float
    {
        if ($this->payment_type === 'per_session') {
            $presentStudents = $this->attendances()
                ->where('id', $attendanceId)
                ->where('is_present', true)
                ->count();

            return $presentStudents * $this->student_price;
        }

        return 0;
    }

    /**
     * Get payment type label in Arabic
     */
    public function getPaymentTypeLabel(): string
    {
        return $this->payment_type === 'monthly' ? 'شهري' : 'بالجلسة';
    }

    /**
     * Scope a query to only include active groups.
     */
    public function scopeIsActive($query)
    {
        return $query->where('is_active', true);
    }
}
