<?php

namespace Tests\Feature;

use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssistantInheritanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_assistant_inherits_teacher_subscription_status()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $assistant = $this->createAssistant($teacher);

        // Initially, neither has a subscription
        $this->assertFalse($teacher->hasActiveSubscription());
        $this->assertFalse($assistant->hasActiveSubscription());

        // Create active subscription for teacher
        $this->createActiveSubscription($teacher);

        // Assistant should now inherit the teacher's subscription status
        $this->assertTrue($teacher->hasActiveSubscription());
        $this->assertTrue($assistant->hasActiveSubscription());
    }

    public function test_assistant_inherits_teacher_plan_limits()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $assistant = $this->createAssistant($teacher);

        $plan = $this->createPlan([
            'max_students' => 50,
            'max_assistants' => 3,
        ]);
        $this->createActiveSubscription($teacher, $plan);

        $teacherLimits = $teacher->getSubscriptionLimits();
        $assistantLimits = $assistant->getSubscriptionLimits();

        // Core limits should be the same
        $this->assertEquals($teacherLimits['max_students'], $assistantLimits['max_students']);
        $this->assertEquals($teacherLimits['max_assistants'], $assistantLimits['max_assistants']);
        $this->assertEquals(50, $assistantLimits['max_students']);
        $this->assertEquals(3, $assistantLimits['max_assistants']);
    }

    public function test_assistant_shares_student_count_with_teacher()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_students' => 5]);
        $this->createActiveSubscription($teacher, $plan);

        // Initially both have 0 students
        $this->assertEquals(0, $teacher->getStudentCount());
        $this->assertEquals(0, $assistant->getStudentCount());

        // Teacher adds students
        Student::factory()->count(3)->create(['user_id' => $teacher->id]);

        // Both teacher and assistant should see the same count
        $this->assertEquals(3, $teacher->getStudentCount());
        $this->assertEquals(3, $assistant->getStudentCount());

        // Test if they can add more students (shared limit)
        $this->assertTrue($teacher->canAddStudents()); // Can add 2 more
        $this->assertTrue($assistant->canAddStudents()); // Same limit

        // Add more students to reach limit
        Student::factory()->count(2)->create(['user_id' => $teacher->id]);

        $this->assertFalse($teacher->canAddStudents());
        $this->assertFalse($assistant->canAddStudents());
    }

    public function test_assistant_cannot_add_assistants_but_shares_count()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_assistants' => 2]);
        $this->createActiveSubscription($teacher, $plan);

        // Teacher can add assistants
        $this->assertTrue($teacher->canAddAssistants());

        // Assistant cannot add assistants (business rule)
        $this->assertFalse($assistant->canAddAssistants());

        // Add another assistant to reach limit
        $this->createAssistant($teacher);

        // Teacher can no longer add assistants (limit reached)
        $this->assertFalse($teacher->canAddAssistants());

        // Assistant still cannot add assistants
        $this->assertFalse($assistant->canAddAssistants());
    }

    public function test_assistant_loses_access_when_teacher_subscription_expires()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $assistant = $this->createAssistant($teacher);

        // Create active subscription
        $plan = $this->createPlan();
        $subscription = Subscription::factory()->create([
            'user_id' => $teacher->id,
            'plan_id' => $plan->id,
            'end_date' => Carbon::now()->addDays(30),
            'is_active' => true,
        ]);

        $this->assertTrue($teacher->hasActiveSubscription());
        $this->assertTrue($assistant->hasActiveSubscription());

        // Expire the subscription
        $subscription->update(['end_date' => Carbon::now()->subDay(), 'is_active' => false]);

        // Refresh models to get updated data
        $teacher->refresh();
        $assistant->refresh();

        $this->assertFalse($teacher->hasActiveSubscription());
        $this->assertFalse($assistant->hasActiveSubscription());
    }

    public function test_assistant_inherits_teacher_approval_status()
    {
        // Test with approved teacher
        $approvedTeacher = $this->createTeacher(['is_approved' => true, 'onboarding_completed' => true]);
        $assistantOfApproved = $this->createAssistant($approvedTeacher, ['onboarding_completed' => true]);

        // Test with unapproved teacher (but with onboarding completed)
        $unapprovedTeacher = $this->createTeacher([
            'is_approved' => false,
            'onboarding_completed' => true,
        ]);
        $assistantOfUnapproved = $this->createAssistant($unapprovedTeacher, ['onboarding_completed' => true]);

        // Assistant should inherit teacher's approval status through middleware
        $this->actingAs($assistantOfApproved);
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('subscription.expired')); // No subscription yet

        $this->actingAs($assistantOfUnapproved);
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('pending-approval')); // Teacher not approved
    }

    public function test_assistant_without_teacher_has_no_access()
    {
        $orphanedAssistant = User::factory()->assistant()->create([
            'teacher_id' => null,
            'onboarding_completed' => true,
        ]);

        $this->assertFalse($orphanedAssistant->hasActiveSubscription());

        $limits = $orphanedAssistant->getSubscriptionLimits();
        $this->assertArrayHasKey('max_students', $limits);
        $this->assertEquals(0, $limits['max_students']); // Default limit for no subscription

        $this->assertFalse($orphanedAssistant->canAddStudents());
        $this->assertFalse($orphanedAssistant->canAddAssistants());

        // Should be redirected to onboarding (middleware behavior)
        $this->actingAs($orphanedAssistant);
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('onboarding.show'));
    }

    public function test_multiple_assistants_share_same_limits()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $assistant1 = $this->createAssistant($teacher);
        $assistant2 = $this->createAssistant($teacher);

        $plan = $this->createPlan(['max_students' => 10, 'max_assistants' => 3]);
        $this->createActiveSubscription($teacher, $plan);

        // All users should have the same core limits
        $teacherLimits = $teacher->getSubscriptionLimits();
        $assistant1Limits = $assistant1->getSubscriptionLimits();
        $assistant2Limits = $assistant2->getSubscriptionLimits();

        $this->assertEquals($teacherLimits['max_students'], $assistant1Limits['max_students']);
        $this->assertEquals($teacherLimits['max_students'], $assistant2Limits['max_students']);
        $this->assertEquals($teacherLimits['max_assistants'], $assistant1Limits['max_assistants']);
        $this->assertEquals($teacherLimits['max_assistants'], $assistant2Limits['max_assistants']);

        // All should share the same student count
        Student::factory()->count(5)->create(['user_id' => $teacher->id]);

        $this->assertEquals(5, $teacher->getStudentCount());
        $this->assertEquals(5, $assistant1->getStudentCount());
        $this->assertEquals(5, $assistant2->getStudentCount());
    }

    public function test_assistant_inherits_teacher_onboarding_status()
    {
        // Teacher with completed onboarding
        $completedTeacher = $this->createTeacher(['onboarding_completed' => true, 'is_approved' => true]);
        $assistantOfCompleted = $this->createAssistant($completedTeacher, ['onboarding_completed' => false]);

        // Teacher without completed onboarding
        $incompleteTeacher = $this->createTeacher(['onboarding_completed' => false]);
        $assistantOfIncomplete = $this->createAssistant($incompleteTeacher, ['onboarding_completed' => true]);

        // Assistant inherits teacher's onboarding status through middleware
        $this->actingAs($assistantOfCompleted);
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('subscription.expired')); // Would proceed if had subscription

        $this->actingAs($assistantOfIncomplete);
        $response = $this->get('/dashboard');
        $response->assertRedirect(route('onboarding.show')); // Teacher's onboarding incomplete
    }
}
