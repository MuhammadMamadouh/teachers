<?php

namespace Tests\Feature\Models;

use App\Models\Plan;
use App\Models\Subscription;
use Tests\TestCase;

class PlanTest extends TestCase
{
    public function test_plan_has_many_subscriptions()
    {
        $plan = Plan::factory()->create();
        $subscription = Subscription::factory()->create(['plan_id' => $plan->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $plan->subscriptions);
        $this->assertTrue($plan->subscriptions->contains($subscription));
    }

    public function test_get_default_trial_returns_existing_default_trial_plan()
    {
        // This test verifies that the method returns the existing default trial plan
        $result = Plan::getDefaultTrial();

        $this->assertNotNull($result);
        $this->assertTrue($result->is_trial);
        $this->assertTrue($result->is_default);
    }

    public function test_get_default_trial_returns_null_when_no_default_trial_exists()
    {
        // Temporarily disable the default trial plan
        $originalDefaultTrial = Plan::where('is_trial', true)->where('is_default', true)->first();
        if ($originalDefaultTrial) {
            $originalDefaultTrial->update(['is_default' => false]);
        }

        $result = Plan::getDefaultTrial();
        $this->assertNull($result);

        // Restore the original state
        if ($originalDefaultTrial) {
            $originalDefaultTrial->update(['is_default' => true]);
        }
    }

    public function test_get_formatted_price_attribute()
    {
        $plan = Plan::factory()->create([
            'price' => 150.50,
        ]);

        $this->assertEquals('150.50 ج.م', $plan->getFormattedPriceAttribute());
    }

    public function test_get_formatted_price_attribute_with_integer_price()
    {
        $plan = Plan::factory()->create([
            'price' => 100,
        ]);

        $this->assertEquals('100.00 ج.م', $plan->getFormattedPriceAttribute());
    }

    public function test_get_formatted_duration_attribute_for_30_days()
    {
        $plan = Plan::factory()->create([
            'duration_days' => 30,
        ]);

        $this->assertEquals('شهر واحد', $plan->getFormattedDurationAttribute());
    }

    public function test_get_formatted_duration_attribute_for_90_days()
    {
        $plan = Plan::factory()->create([
            'duration_days' => 90,
        ]);

        $this->assertEquals('3 أشهر', $plan->getFormattedDurationAttribute());
    }

    public function test_get_formatted_duration_attribute_for_365_days()
    {
        $plan = Plan::factory()->create([
            'duration_days' => 365,
        ]);

        $this->assertEquals('سنة واحدة', $plan->getFormattedDurationAttribute());
    }

    public function test_get_formatted_duration_attribute_for_custom_days()
    {
        $plan = Plan::factory()->create([
            'duration_days' => 45,
        ]);

        $this->assertEquals('45 يوم', $plan->getFormattedDurationAttribute());
    }

    public function test_plan_casts_are_applied_correctly()
    {
        $plan = Plan::factory()->create([
            'is_trial' => 1,
            'is_default' => 0,
            'price' => 99.99,
        ]);

        $this->assertIsBool($plan->is_trial);
        $this->assertTrue($plan->is_trial);
        $this->assertIsBool($plan->is_default);
        $this->assertFalse($plan->is_default);
        $this->assertEquals(99.99, $plan->price);
    }
}
