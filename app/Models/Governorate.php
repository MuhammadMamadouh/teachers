<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Governorate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar',
        'name_en',
        'code',
        'latitude',
        'longitude',
        'population',
        'area',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'population' => 'integer',
        'area' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get users from this governorate
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'governorate_id');
    }

    /**
     * Get teachers from this governorate
     */
    public function teachers(): HasMany
    {
        return $this->hasMany(User::class, 'governorate_id')
            ->where('type', 'teacher')
            ->where('is_admin', false);
    }

    /**
     * Get active teachers from this governorate
     */
    public function activeTeachers(): HasMany
    {
        return $this->teachers()->where('is_approved', true);
    }

    /**
     * Scope to get only active governorates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get governorate display name (Arabic by default)
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name_ar;
    }

    /**
     * Get teachers count for this governorate
     */
    public function getTeachersCountAttribute(): int
    {
        return $this->teachers()->count();
    }

    /**
     * Get active teachers count for this governorate
     */
    public function getActiveTeachersCountAttribute(): int
    {
        return $this->activeTeachers()->count();
    }
}
