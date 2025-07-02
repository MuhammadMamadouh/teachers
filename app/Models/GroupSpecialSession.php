<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GroupSpecialSession extends Model
{
    protected $fillable = [
        'group_id',
        'date',
        'start_time',
        'end_time',
        'description',
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'string',
        'end_time' => 'string',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    public function getFormattedDateAttribute(): string
    {
        return $this->date->format('Y-m-d');
    }

    public function getFormattedStartTimeAttribute(): string
    {
        return $this->start_time;
    }

    public function getFormattedEndTimeAttribute(): string
    {
        return $this->end_time;
    }
}
