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
        'type',
        'teacher_id',
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
     * Get all students for the user.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
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
        $subscription = $this->activeSubscription()->with('plan')->first();
        
        if (!$subscription || !$subscription->isCurrentlyActive()) {
            return [
                'max_students' => 0,
                'has_active_subscription' => false,
            ];
        }

        // Use plan's max_students if available, fallback to subscription's max_students
        $maxStudents = $subscription->plan ? $subscription->plan->max_students : $subscription->max_students;

        return [
            'max_students' => $maxStudents,
            'has_active_subscription' => true,
            'subscription' => $subscription,
            'plan' => $subscription->plan,
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

        // Get current student count
        $currentStudentCount = $this->students()->count();
        
        return ($currentStudentCount + $count) <= $limits['max_students'];
    }

    /**
     * Get current student count for the user.
     */
    public function getStudentCount(): int
    {
        return $this->students()->count();
    }

    /**
     * Get the teacher that this assistant belongs to.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get all assistants for this teacher.
     */
    public function assistants(): HasMany
    {
        return $this->hasMany(User::class, 'teacher_id');
    }

    /**
     * Check if user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->type === 'teacher';
    }

    /**
     * Check if user is an assistant.
     */
    public function isAssistant(): bool
    {
        return $this->type === 'assistant';
    }

    /**
     * Get the main teacher (if this user is an assistant, return the teacher; if teacher, return self).
     */
    public function getMainTeacher(): User
    {
        return $this->isAssistant() ? $this->teacher : $this;
    }

    /**
     * Check if user can add more assistants.
     */
    public function canAddAssistants(int $count = 1): bool
    {
        if (!$this->isTeacher()) {
            return false;
        }

        $limits = $this->getSubscriptionLimits();
        
        if (!$limits['has_active_subscription'] || !$limits['plan']) {
            return false;
        }

        // Get max assistants allowed by plan (assuming we'll add this to plans)
        $maxAssistants = $limits['plan']->max_assistants ?? 0;
        $currentAssistants = $this->assistants()->count();
        
        return ($currentAssistants + $count) <= $maxAssistants;
    }

    /**
     * Get current assistant count for the user.
     */
    public function getAssistantCount(): int
    {
        return $this->assistants()->count();
    }
}
