<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Plan;
use App\Models\Subscription;

class PlanTest extends TestCase
{
    public function test_plan_can_be_created()
    {
        $plan = Plan::factory()->create([
            'name' => 'Test Plan',
            'price' => 100.50,
            'max_students' => 25,
        ]);

        $this->assertDatabaseHas('plans', [
            'name' => 'Test Plan',
            'price' => 100.50,
            'max_students' => 25,
        ]);
    }

    public function test_plan_has_subscriptions_relationship()
    {
        $plan = $this->createPlan();
        $subscription = Subscription::factory()->create(['plan_id' => $plan->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $plan->subscriptions);
        $this->assertTrue($plan->subscriptions->contains($subscription));
    }

    public function test_formatted_price_attribute()
    {
        $plan = Plan::factory()->create(['price' => 150.75]);
        $this->assertEquals('150.75 ج.م', $plan->formatted_price);

        $freePlan = Plan::factory()->create(['price' => 0]);
        $this->assertEquals('0.00 ج.م', $freePlan->formatted_price);
    }

    public function test_trial_plan_factory_state()
    {
        $trialPlan = Plan::factory()->trial()->create();

        $this->assertTrue($trialPlan->is_trial);
        $this->assertEquals(0, $trialPlan->price);
        $this->assertEquals(5, $trialPlan->max_students);
        $this->assertEquals(0, $trialPlan->max_assistants);
    }

    public function test_default_plan_factory_state()
    {
        $defaultPlan = Plan::factory()->default()->create();
        $this->assertTrue($defaultPlan->is_default);
    }

    public function test_basic_plan_factory_state()
    {
        $basicPlan = Plan::factory()->basic()->create();

        $this->assertEquals('الأساسية', $basicPlan->name);
        $this->assertEquals(50, $basicPlan->price);
        $this->assertEquals(10, $basicPlan->max_students);
        $this->assertEquals(0, $basicPlan->max_assistants);
    }

    public function test_premium_plan_factory_state()
    {
        $premiumPlan = Plan::factory()->premium()->create();

        $this->assertEquals('الاحترافية', $premiumPlan->name);
        $this->assertEquals(200, $premiumPlan->price);
        $this->assertEquals(100, $premiumPlan->max_students);
        $this->assertEquals(5, $premiumPlan->max_assistants);
    }
}
