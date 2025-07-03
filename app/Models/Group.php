<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'max_students',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
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
     * This relationship is deprecated and will be removed in future versions.
     * Use assignedStudents() instead.
     * @deprecated
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(Student::class);
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
}
