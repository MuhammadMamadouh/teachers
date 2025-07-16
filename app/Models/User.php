<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use Notifiable;
    use HasRoles;

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
        'governorate_id',
        'center_id',
        'notes',
        'is_approved',
        'is_admin',
        'approved_at',
        'type',
        'teacher_id',
        'onboarding_completed',
        'onboarding_completed_at',
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
            'onboarding_completed' => 'boolean',
            'onboarding_completed_at' => 'datetime',
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
     * Get active subscriptions for the user.
     */
    public function activeSubscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class)->where('is_active', true);
    }

    /**
     * Get all students for the user.
     */
    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    /**
     * Get the center this user belongs to.
     */
    public function center(): BelongsTo
    {
        return $this->belongsTo(Center::class);
    }

    /**
     * Get all centers owned by this user (admin/owner).
     */
    public function ownedCenters(): HasMany
    {
        return $this->hasMany(Center::class, 'owner_id');
    }

    /**
     * Check if user is the owner of their center.
     */
    public function isCenterOwner(): bool
    {
        return $this->center && $this->center->owner_id === $this->id;
    }

    /**
     * Check if user has admin role in their center.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin') || $this->is_admin;
    }

    /**
     * Get all plan upgrade requests for the user.
     */
    public function planUpgradeRequests(): HasMany
    {
        return $this->hasMany(PlanUpgradeRequest::class);
    }

    /**
     * Get pending plan upgrade requests for the user.
     */
    public function pendingPlanUpgradeRequests(): HasMany
    {
        return $this->hasMany(PlanUpgradeRequest::class)->where('status', 'pending');
    }

    /**
     * Check if user has a pending plan upgrade request.
     */
    public function hasPendingPlanUpgrade(): bool
    {
        return $this->pendingPlanUpgradeRequests()->exists();
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
        // For assistants, use the teacher's subscription
        $userToCheck = $this->isAssistant() ? $this->teacher : $this;

        if (!$userToCheck) {
            return [
                'max_students' => 0,
                'has_active_subscription' => false,
            ];
        }

        $subscription = $userToCheck->activeSubscription()->with('plan')->first();

        if (!$subscription || !$subscription->isCurrentlyActive()) {
            return [
                'max_students' => 0,
                'has_active_subscription' => false,
            ];
        }

        // Use plan's max_students if available, fallback to subscription's max_students
        $maxStudents = $subscription->plan ? $subscription->plan->max_students : $subscription->max_students;
        $currentStudentCount = $this->students()->count();

        return [
            'max_students' => $maxStudents,
            'has_active_subscription' => true,
            'subscription' => $subscription,
            'plan' => $subscription->plan,
            'current_students' => $currentStudentCount,
            'current_assistants' => $this->assistants()->count(),
            'max_assistants' => $subscription->plan ? $subscription->plan->max_assistants : 0,
        ];
    }

    /**
     * Check if user can add more students.
     */
    public function canAddStudents(int $count = 1): bool
    {
        // For assistants, use the teacher's limits
        $userToCheck = $this->isAssistant() ? $this->teacher : $this;

        if (!$userToCheck) {
            return false;
        }

        $limits = $userToCheck->getSubscriptionLimits();

        if (!$limits['has_active_subscription']) {
            return false;
        }

        // Get current student count from the teacher (not the assistant)
        $currentStudentCount = $userToCheck->students()->count();

        return ($currentStudentCount + $count) <= $limits['max_students'];
    }

    /**
     * Get current student count for the user.
     */
    public function getStudentCount(): int
    {
        // For assistants, get the teacher's student count
        $userToCheck = $this->isAssistant() ? $this->teacher : $this;

        if (!$userToCheck) {
            return 0;
        }

        return $userToCheck->students()->count();
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
     * Get all groups for the user.
     */
    public function groups(): HasMany
    {
        return $this->hasMany(Group::class, 'user_id');
    }

    /**
     * Get the governorate for this user.
     */
    public function governorate(): BelongsTo
    {
        return $this->belongsTo(Governorate::class, 'governorate_id');
    }

    /**
     * Get all feedbacks submitted by this user.
     */
    public function feedbacks(): HasMany
    {
        return $this->hasMany(Feedback::class, 'user_id');
    }

    /**
     * Check if user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('teacher') || $this->type === 'teacher';
    }

    /**
     * Check if user is an assistant.
     */
    public function isAssistant(): bool
    {
        return $this->hasRole('assistant') || $this->type === 'assistant';
    }

    /**
     * Accessor for is_assistant attribute for backward compatibility.
     */
    public function getIsAssistantAttribute(): bool
    {
        return $this->isAssistant();
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

    /**
     * Check if user has had a trial subscription before.
     */
    public function hasHadTrial(): bool
    {
        return $this->subscriptions()->where('is_trial', true)->exists();
    }

    /**
     * Create a trial subscription for the user.
     */
    public function createTrialSubscription(): ?Subscription
    {
        // Don't create trial if user already had one
        if ($this->hasHadTrial()) {
            return null;
        }

        $trialPlan = Plan::getDefaultTrial();
        if (!$trialPlan) {
            return null;
        }

        return $this->subscriptions()->create([
            'plan_id' => $trialPlan->id,
            'max_students' => $trialPlan->max_students,
            'is_active' => true,
            'is_trial' => true,
            'start_date' => now(),
            'end_date' => now()->addDays($trialPlan->duration_days),
        ]);
    }

    /**
     * Check if user has an active subscription.
     */
    public function hasActiveSubscription(): bool
    {
        // For assistants, check the teacher's subscription
        $userToCheck = $this->isAssistant() ? $this->teacher : $this;

        if (!$userToCheck) {
            return false;
        }

        $subscription = $userToCheck->activeSubscription()->first();

        return $subscription && $subscription->isCurrentlyActive();
    }

    /**
     * Get the user's current plan.
     */
    public function getCurrentPlan()
    {
        // For assistants, get the teacher's plan
        $userToCheck = $this->isAssistant() ? $this->teacher : $this;

        if (!$userToCheck) {
            return null;
        }

        $subscription = $userToCheck->activeSubscription()->with('plan')->first();

        return $subscription && $subscription->isCurrentlyActive() ? $subscription->plan : null;
    }
}
