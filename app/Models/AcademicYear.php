<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_ar',
        'code',
        'level',
    ];

    /**
     * Get all students for this academic year.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get all groups for this academic year.
     */
    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    /**
     * Get all academic years grouped by level.
     */
    public static function getGroupedByLevel()
    {
        return self::orderBy('level')
            ->orderBy('name_ar')
            ->get()
            ->groupBy('level');
    }

    /**
     * Get academic years for a specific level.
     */
    public static function getByLevel($level)
    {
        return self::where('level', $level)
            ->orderBy('name_ar')
            ->get();
    }
}
