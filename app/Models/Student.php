<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    protected $fillable = [
        'user_id',
        'group_id',
        'name',
        'phone',
        'guardian_name',
        'guardian_phone',
    ];

    /**
     * Get the user that owns the student.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the group that the student belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }
}
