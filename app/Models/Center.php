<?php

namespace App\Models;

use App\Enums\CenterType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Center extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'address',
        'phone',
        'email',
        'description',
        'owner_id',
        'governorate_id',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'type' => CenterType::class,
    ];

    /**
     * Get all users (teachers, assistants, admins) for this center.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the owner/admin of this center.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get all teachers for this center.
     */
    public function teachers(): HasMany
    {
        return $this->hasMany(User::class)->where('type', 'teacher');
    }

    /**
     * Get all assistants for this center.
     */
    public function assistants(): HasMany
    {
        return $this->hasMany(User::class)->where('type', 'assistant');
    }

    /**
     * Get all students for this center.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get all groups for this center.
     */
    public function groups(): HasMany
    {
        return $this->hasMany(Group::class);
    }

    /**
     * Get all group special sessions for this center.
     */
    public function groupSpecialSessions(): HasMany
    {
        return $this->hasMany(GroupSpecialSession::class);
    }

    /**
     * Check if this center is an individual teacher center.
     */
    public function isIndividual(): bool
    {
        return $this->type === CenterType::INDIVIDUAL;
    }

    /**
     * Check if this center is an organization/multi-teacher center.
     */
    public function isOrganization(): bool
    {
        return $this->type === CenterType::ORGANIZATION;
    }

    /**
     * Get the center type label in Arabic.
     */
    public function getTypeLabel(): string
    {
        return $this->type->label();
    }

    /**
     * Get the governorate for this center.
     */
    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class, 'governorate_id');
    }

    /**
     * Get the active subscription for this center.
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->where('is_active', true);
    }

    /**
     * Get all subscriptions for this center.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
