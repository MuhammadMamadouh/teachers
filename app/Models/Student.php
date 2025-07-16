<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\EducationLevel;

class Student extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'group_id',
        'center_id',
        'name',
        'phone',
        'guardian_phone',
        'level',
        'academic_year_id',
    ];

    protected $casts = [
        'level' => EducationLevel::class,
    ];

    /**
     * Get the user that owns the student.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the primary group that the student belongs to.
     * Each student should belong to only one primary group per tenant (user).
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Get the attendances for the student.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the academic year that the student belongs to.
     */
    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    /**
     * Get the payments for the student.
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the center that the student belongs to.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }
}
