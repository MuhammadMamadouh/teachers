<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attendance extends Model
{
    use HasFactory;
    protected $fillable = [
        'student_id',
        'group_id',
        'date',
        'is_present',
        'notes',
        'center_id',
    ];

    protected $casts = [
        'date' => 'date',
        'is_present' => 'boolean',
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
     * Get the payments related to this attendance (for per-session groups)
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'related_date', 'date')
            ->where('student_id', $this->student_id)
            ->where('group_id', $this->group_id)
            ->where('payment_type', 'per_session');
    }
}
