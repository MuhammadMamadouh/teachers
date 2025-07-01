<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'subject',
        'city',
        'notes',
        'is_approved',
        'is_admin',
        'approved_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_approved' => 'boolean',
            'is_admin' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get all subscriptions for the user.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the user's active subscription.
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->where('is_active', true);
    }

    /**
     * Get the user's current subscription limits.
     */
    public function getSubscriptionLimits(): array
    {
        $subscription = $this->activeSubscription()->first();
        
        if (!$subscription || !$subscription->isCurrentlyActive()) {
            return [
                'max_students' => 0,
                'has_active_subscription' => false,
            ];
        }

        return [
            'max_students' => $subscription->max_students,
            'has_active_subscription' => true,
            'subscription' => $subscription,
        ];
    }

    /**
     * Check if user can add more students.
     */
    public function canAddStudents(int $count = 1): bool
    {
        $limits = $this->getSubscriptionLimits();
        
        if (!$limits['has_active_subscription']) {
            return false;
        }

        // TODO: When students table is created, check current student count
        // For now, assume 0 students
        $currentStudentCount = 0;
        
        return ($currentStudentCount + $count) <= $limits['max_students'];
    }
}
