<?php

namespace Tests\Feature\Models;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Tests\TestCase;

class SubscriptionTest extends TestCase
{
    public function test_subscription_belongs_to_user()
    {
        $user = User::factory()->create();
        $subscription = Subscription::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $subscription->user);
        $this->assertEquals($user->id, $subscription->user->id);
    }

    public function test_subscription_belongs_to_plan()
    {
        $plan = Plan::factory()->create();
        $subscription = Subscription::factory()->create(['plan_id' => $plan->id]);

        $this->assertInstanceOf(Plan::class, $subscription->plan);
        $this->assertEquals($plan->id, $subscription->plan->id);
    }

    public function test_is_currently_active_returns_false_when_not_active()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => false,
            'start_date' => Carbon::now()->subDays(5),
            'end_date' => Carbon::now()->addDays(5),
        ]);

        $this->assertFalse($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_true_when_active_and_within_period()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => Carbon::now()->subDays(5),
            'end_date' => Carbon::now()->addDays(5),
        ]);

        $this->assertTrue($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_false_when_before_start_date()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => Carbon::now()->addDays(5),
            'end_date' => Carbon::now()->addDays(10),
        ]);

        $this->assertFalse($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_false_when_after_end_date()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => Carbon::now()->subDays(10),
            'end_date' => Carbon::now()->subDays(5),
        ]);

        $this->assertFalse($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_true_when_no_start_date_and_within_end_date()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => null,
            'end_date' => Carbon::now()->addDays(5),
        ]);

        $this->assertTrue($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_false_when_no_start_date_and_past_end_date()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => null,
            'end_date' => Carbon::now()->subDays(5),
        ]);

        $this->assertFalse($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_true_when_no_end_date_and_past_start_date()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => Carbon::now()->subDays(5),
            'end_date' => null,
        ]);

        $this->assertTrue($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_false_when_no_end_date_and_before_start_date()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => Carbon::now()->addDays(5),
            'end_date' => null,
        ]);

        $this->assertFalse($subscription->isCurrentlyActive());
    }

    public function test_is_currently_active_returns_true_when_no_dates_and_active()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => null,
            'end_date' => null,
        ]);

        $this->assertTrue($subscription->isCurrentlyActive());
    }

    public function test_get_days_remaining_attribute_returns_correct_days()
    {
        $endDate = Carbon::now()->addDays(10);
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => Carbon::now()->subDays(5),
            'end_date' => $endDate,
        ]);

        $expectedDays = (int) now()->diffInDays($endDate, false);
        $this->assertEquals($expectedDays, $subscription->getDaysRemainingAttribute());
    }

    public function test_get_days_remaining_attribute_returns_zero_when_no_end_date()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
            'start_date' => Carbon::now()->subDays(5),
            'end_date' => null,
        ]);

        $this->assertEquals(0, $subscription->getDaysRemainingAttribute());
    }

    public function test_get_days_remaining_attribute_returns_zero_when_not_active()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => false,
            'start_date' => Carbon::now()->subDays(5),
            'end_date' => Carbon::now()->addDays(10),
        ]);

        $this->assertEquals(0, $subscription->getDaysRemainingAttribute());
    }

    public function test_is_expired_returns_true_when_past_end_date()
    {
        $subscription = Subscription::factory()->create([
            'end_date' => Carbon::now()->subDays(5),
        ]);

        $this->assertTrue($subscription->isExpired());
    }

    public function test_is_expired_returns_false_when_before_end_date()
    {
        $subscription = Subscription::factory()->create([
            'end_date' => Carbon::now()->addDays(5),
        ]);

        $this->assertFalse($subscription->isExpired());
    }

    public function test_is_expired_returns_false_when_no_end_date()
    {
        $subscription = Subscription::factory()->create([
            'end_date' => null,
        ]);

        $this->assertFalse($subscription->isExpired());
    }

    public function test_mark_as_expired_updates_is_active_to_false()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => true,
        ]);

        $subscription->markAsExpired();

        $this->assertFalse($subscription->fresh()->is_active);
    }

    public function test_subscription_casts_are_applied_correctly()
    {
        $subscription = Subscription::factory()->create([
            'is_active' => 1,
            'is_trial' => 0,
            'start_date' => '2025-07-12',
            'end_date' => '2025-08-12',
        ]);

        $this->assertIsBool($subscription->is_active);
        $this->assertTrue($subscription->is_active);
        $this->assertIsBool($subscription->is_trial);
        $this->assertFalse($subscription->is_trial);
        $this->assertInstanceOf(Carbon::class, $subscription->start_date);
        $this->assertInstanceOf(Carbon::class, $subscription->end_date);
    }
}
