<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Plan;
use App\Models\PlanUpgradeRequest;

class PlanControllerTest extends TestCase
{
    public function test_teacher_can_view_plans_index()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan();
        $this->createActiveSubscription($teacher, $plan);

        $response = $this->actingAs($teacher)->get(route('plans.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Plans/Index')
            ->has('currentPlan')
            ->has('availablePlans')
            ->where('isAssistant', false)
            ->where('teacherName', null)
        );
    }

    public function test_assistant_can_view_plans_index_with_teacher_data()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan();
        $this->createActiveSubscription($teacher, $plan);

        $response = $this->actingAs($assistant)->get(route('plans.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Plans/Index')
            ->has('currentPlan')
            ->has('availablePlans')
            ->where('isAssistant', true)
            ->where('teacherName', $teacher->name)
        );
    }

    public function test_teacher_can_request_plan_upgrade()
    {
        $teacher = $this->createTeacher();
        $currentPlan = $this->createPlan(['max_students' => 10]);
        $newPlan = $this->createPlan(['max_students' => 25]);
        $this->createActiveSubscription($teacher, $currentPlan);

        $response = $this->actingAs($teacher)
            ->post(route('plans.upgrade'), ['plan_id' => $newPlan->id]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('plan_upgrade_requests', [
            'user_id' => $teacher->id,
            'current_plan_id' => $currentPlan->id,
            'requested_plan_id' => $newPlan->id,
            'status' => 'pending',
        ]);
    }

    public function test_assistant_can_request_plan_upgrade_for_teacher()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $currentPlan = $this->createPlan(['max_students' => 10]);
        $newPlan = $this->createPlan(['max_students' => 25]);
        $this->createActiveSubscription($teacher, $currentPlan);

        $response = $this->actingAs($assistant)
            ->post(route('plans.upgrade'), ['plan_id' => $newPlan->id]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('plan_upgrade_requests', [
            'user_id' => $teacher->id, // Should be teacher's ID, not assistant's
            'current_plan_id' => $currentPlan->id,
            'requested_plan_id' => $newPlan->id,
            'status' => 'pending',
        ]);
    }

    public function test_cannot_request_upgrade_without_active_subscription()
    {
        $teacher = $this->createTeacher();
        $newPlan = $this->createPlan();

        $response = $this->actingAs($teacher)
            ->post(route('plans.upgrade'), ['plan_id' => $newPlan->id]);

        // Should be redirected to subscription expired page by middleware
        $response->assertRedirect('/subscription/expired');
    }

    public function test_cannot_request_upgrade_with_pending_request()
    {
        $teacher = $this->createTeacher();
        $currentPlan = $this->createPlan();
        $newPlan = $this->createPlan();
        $this->createActiveSubscription($teacher, $currentPlan);

        // Create existing pending request
        PlanUpgradeRequest::factory()->create([
            'user_id' => $teacher->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($teacher)
            ->post(route('plans.upgrade'), ['plan_id' => $newPlan->id]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['plan']);
    }

    public function test_plan_upgrade_request_validation()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan();
        $this->createActiveSubscription($teacher, $plan);

        // Test missing plan_id
        $response = $this->actingAs($teacher)
            ->post(route('plans.upgrade'), []);

        $response->assertSessionHasErrors(['plan_id']);

        // Test invalid plan_id
        $response = $this->actingAs($teacher)
            ->post(route('plans.upgrade'), ['plan_id' => 99999]);

        $response->assertSessionHasErrors(['plan_id']);
    }

    public function test_unauthenticated_user_cannot_access_plans()
    {
        $response = $this->get(route('plans.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('plans.upgrade'), ['plan_id' => 1]);
        $response->assertRedirect(route('login'));
    }

    public function test_assistant_without_teacher_gets_error()
    {
        $assistant = User::factory()->assistant()->create(['teacher_id' => null]);

        $response = $this->actingAs($assistant)->get(route('plans.index'));

        // Assistant without teacher should be redirected to onboarding by middleware
        $response->assertRedirect('/onboarding');
    }
}
