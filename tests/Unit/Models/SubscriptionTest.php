<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Plan;

class SubscriptionTest extends TestCase
{
    public function test_subscription_can_be_created()
    {
        $user = $this->createTeacher();
        $plan = $this->createPlan();
        
        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan_id' => $plan->id,
        ]);
    }

    public function test_subscription_belongs_to_user()
    {
        $user = $this->createTeacher();
        $subscription = $this->createSubscription($user);

        $this->assertInstanceOf(User::class, $subscription->user);
        $this->assertEquals($user->id, $subscription->user->id);
    }

    public function test_subscription_belongs_to_plan()
    {
        $plan = $this->createPlan();
        $user = $this->createTeacher();
        $subscription = $this->createSubscription($user, $plan);

        $this->assertInstanceOf(Plan::class, $subscription->plan);
        $this->assertEquals($plan->id, $subscription->plan->id);
    }

    public function test_is_currently_active_method()
    {
        $user = $this->createTeacher();

        // Active subscription
        $activeSubscription = Subscription::factory()->active()->create(['user_id' => $user->id]);
        $this->assertTrue($activeSubscription->isCurrentlyActive());

        // Expired subscription
        $expiredSubscription = Subscription::factory()->expired()->create(['user_id' => $user->id]);
        $this->assertFalse($expiredSubscription->isCurrentlyActive());

        // Inactive subscription
        $inactiveSubscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'is_active' => false,
        ]);
        $this->assertFalse($inactiveSubscription->isCurrentlyActive());
    }

    public function test_is_expired_method()
    {
        $user = $this->createTeacher();

        // Future end date
        $futureSubscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'end_date' => now()->addDays(10),
        ]);
        $this->assertFalse($futureSubscription->isExpired());

        // Past end date
        $expiredSubscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'end_date' => now()->subDays(5),
        ]);
        $this->assertTrue($expiredSubscription->isExpired());

        // No end date (lifetime)
        $lifetimeSubscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'end_date' => null,
        ]);
        $this->assertFalse($lifetimeSubscription->isExpired());
    }

    public function test_mark_as_expired_method()
    {
        $user = $this->createTeacher();
        $subscription = $this->createActiveSubscription($user);

        $this->assertTrue($subscription->is_active);

        $subscription->markAsExpired();

        $this->assertFalse($subscription->is_active);
    }

    public function test_active_factory_state()
    {
        $subscription = Subscription::factory()->active()->create();

        $this->assertTrue($subscription->is_active);
        $this->assertTrue($subscription->start_date->isPast());
        $this->assertTrue($subscription->end_date->isFuture());
    }

    public function test_expired_factory_state()
    {
        $subscription = Subscription::factory()->expired()->create();

        $this->assertFalse($subscription->is_active);
        $this->assertTrue($subscription->end_date->isPast());
    }

    public function test_trial_factory_state()
    {
        $subscription = Subscription::factory()->trial()->create();

        $this->assertTrue($subscription->is_active);
        $this->assertEquals(5, $subscription->max_students);
    }
}
