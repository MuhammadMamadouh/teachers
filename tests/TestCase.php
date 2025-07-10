<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\AcademicYear;
use App\Models\Governorate;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    /**
     * Create a teacher user for testing.
     */
    protected function createTeacher(array $attributes = []): User
    {
        return User::factory()->teacher()->create($attributes);
    }

    /**
     * Create an assistant user for testing.
     */
    protected function createAssistant(User $teacher = null, array $attributes = []): User
    {
        if (!$teacher) {
            $teacher = $this->createTeacher();
        }
        
        return User::factory()->assistant()->create(array_merge([
            'teacher_id' => $teacher->id,
        ], $attributes));
    }

    /**
     * Create an admin user for testing.
     */
    protected function createAdmin(array $attributes = []): User
    {
        return User::factory()->admin()->create($attributes);
    }

    /**
     * Create a plan for testing.
     */
    protected function createPlan(array $attributes = []): Plan
    {
        return Plan::factory()->create($attributes);
    }

    /**
     * Create a subscription for testing.
     */
    protected function createSubscription(User $user, Plan $plan = null, array $attributes = []): Subscription
    {
        if (!$plan) {
            $plan = $this->createPlan();
        }

        return Subscription::factory()->create(array_merge([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
        ], $attributes));
    }

    /**
     * Create an active subscription for a user.
     */
    protected function createActiveSubscription(User $user, Plan $plan = null): Subscription
    {
        return $this->createSubscription($user, $plan, [
            'is_active' => true,
            'start_date' => now()->subDays(10),
            'end_date' => now()->addDays(20),
        ]);
    }
}
