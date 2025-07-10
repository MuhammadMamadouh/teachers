<?php

namespace Tests\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Student;
use App\Models\Group;
use App\Models\AcademicYear;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_complete_workflow()
    {
        // Create academic year
        $academicYear = AcademicYear::factory()->create();

        // Create a teacher
        $teacher = User::factory()->create([
            'type' => 'teacher',
            'phone' => '0501234567',
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);

        // Create a plan and subscription
        $plan = Plan::factory()->create();
        $subscription = Subscription::factory()->create([
            'user_id' => $teacher->id,
            'plan_id' => $plan->id,
            'is_active' => true,
        ]);

        // Teacher creates a group
        $uniqueName = 'مجموعة الرياضيات المتقدمة ' . now()->timestamp;
        $groupData = [
            'name' => $uniqueName,
            'description' => 'مجموعة متقدمة في الرياضيات',
            'academic_year_id' => $academicYear->id,
            'max_students' => 20,
            'payment_type' => 'monthly',
            'student_price' => 150.00,
            'schedules' => [
                [
                    'day_of_week' => 0, // 0 = Sunday
                    'start_time' => '10:00',
                    'end_time' => '11:30',
                ],
                [
                    'day_of_week' => 2, // 2 = Tuesday
                    'start_time' => '10:00',
                    'end_time' => '11:30',
                ],
                [
                    'day_of_week' => 4, // 4 = Thursday
                    'start_time' => '10:00',
                    'end_time' => '11:30',
                ],
            ],
        ];

        $response = $this->actingAs($teacher)
            ->post(route('groups.store'), $groupData);

        $response->assertRedirect();
        $this->assertDatabaseHas('groups', ['name' => $uniqueName]);

        $group = Group::where('name', $uniqueName)->first();

        // Teacher adds students to the group
        $studentData = [
            'name' => 'أحمد محمد',
            'phone' => '0501111111',
            'guardian_phone' => '0502222222',
            'group_id' => $group->id,
            'academic_year_id' => $academicYear->id,
        ];

        $response = $this->actingAs($teacher)
            ->post(route('students.store'), $studentData);

        $response->assertRedirect();
        $response->assertSessionDoesntHaveErrors(); // Check for validation errors
        $this->assertDatabaseHas('students', ['name' => 'أحمد محمد']);

        // Teacher creates an assistant
        $assistantData = [
            'name' => 'مساعد المعلم',
            'email' => 'assistant@example.com',
            'phone' => '0503333333',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->actingAs($teacher)
            ->post(route('assistants.store'), $assistantData);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
        
        $this->assertDatabaseHas('users', [
            'email' => 'assistant@example.com',
            'type' => 'assistant',
            'teacher_id' => $teacher->id,
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);

        $assistant = User::where('email', 'assistant@example.com')->first();

        // Assistant can view teacher's students and groups
        $response = $this->actingAs($assistant)
            ->get(route('students.index'));
        
        $response->assertOk();

        $response = $this->actingAs($assistant)
            ->get(route('groups.index'));
        
        $response->assertOk();

        // Verify assistant inherits teacher's subscription
        $this->assertTrue($assistant->hasActiveSubscription());
        $this->assertEquals($teacher->getCurrentPlan()->id, $assistant->getCurrentPlan()->id);
    }

    public function test_subscription_expiry_workflow()
    {
        $teacher = User::factory()->create([
            'type' => 'teacher',
            'phone' => '0501234567',
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);

        $plan = Plan::factory()->create();
        
        // Create expired subscription
        $subscription = Subscription::factory()->create([
            'user_id' => $teacher->id,
            'plan_id' => $plan->id,
            'is_active' => false,
            'end_date' => now()->subDay(),
        ]);

        $assistant = User::factory()->create([
            'type' => 'assistant',
            'teacher_id' => $teacher->id,
            'phone' => '0503333333',
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);

        // Teacher should not have access to protected routes
        $response = $this->actingAs($teacher)
            ->get(route('students.index'));
        
        $response->assertRedirect();

        // Assistant should also not have access
        $response = $this->actingAs($assistant)
            ->get(route('students.index'));
        
        $response->assertRedirect();

        // Activate subscription
        $subscription->update([
            'is_active' => true,
            'end_date' => now()->addMonth(),
        ]);

        // Both should now have access
        $response = $this->actingAs($teacher)
            ->get(route('students.index'));
        
        $response->assertOk();

        $response = $this->actingAs($assistant)
            ->get(route('students.index'));
        
        $response->assertOk();
    }

    public function test_plan_limits_enforcement()
    {
        $teacher = User::factory()->create([
            'type' => 'teacher',
            'phone' => '0501234567',
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);

        // Create plan with limits
        $plan = Plan::factory()->create([
            'max_students' => 2,
            'max_assistants' => 1,
        ]);

        $subscription = Subscription::factory()->create([
            'user_id' => $teacher->id,
            'plan_id' => $plan->id,
            'is_active' => true,
        ]);

        $academicYear = AcademicYear::factory()->create();
        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        // Add students up to limit
        Student::factory()->count(2)->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        // Try to add one more student (should fail)
        $studentData = [
            'name' => 'طالب إضافي',
            'phone' => '0501111111',
            'guardian_phone' => '0502222222',
            'group_id' => $group->id,
        ];

        $response = $this->actingAs($teacher)
            ->post(route('students.store'), $studentData);

        $response->assertRedirect();
        $response->assertSessionHasErrors();

        // Add assistant up to limit
        User::factory()->create([
            'type' => 'assistant',
            'teacher_id' => $teacher->id,
            'phone' => '0503333333',
        ]);

        // Try to add another assistant (should fail)
        $assistantData = [
            'name' => 'مساعد إضافي',
            'email' => 'assistant2@example.com',
            'phone' => '0504444444',
        ];

        $response = $this->actingAs($teacher)
            ->post(route('assistants.store'), $assistantData);

        $response->assertRedirect();
        $response->assertSessionHasErrors();
    }
}
