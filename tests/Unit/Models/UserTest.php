<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Plan;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_be_created()
    {
        $user = User::factory()->create();

        $this->assertInstanceOf(User::class, $user);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_user_has_subscriptions_relationship()
    {
        $user = $this->createTeacher();
        $subscription = Subscription::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($user->subscriptions->contains($subscription));
    }

    public function test_user_has_active_subscription_relationship()
    {
        $user = $this->createTeacher();
        $activeSubscription = Subscription::factory()->active()->create(['user_id' => $user->id]);
        $expiredSubscription = Subscription::factory()->expired()->create(['user_id' => $user->id]);

        $this->assertTrue($user->activeSubscriptions->contains($activeSubscription));
        $this->assertFalse($user->activeSubscriptions->contains($expiredSubscription));
    }

    public function test_teacher_has_assistants_relationship()
    {
        $teacher = $this->createTeacher();
        $assistant1 = $this->createAssistant($teacher);
        $assistant2 = $this->createAssistant($teacher);

        $this->assertCount(2, $teacher->assistants);
        $this->assertTrue($teacher->assistants->contains($assistant1));
        $this->assertTrue($teacher->assistants->contains($assistant2));
    }

    public function test_assistant_has_teacher_relationship()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);

        $this->assertEquals($teacher->id, $assistant->teacher->id);
    }

    public function test_is_teacher_method()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $admin = $this->createAdmin();

        $this->assertTrue($teacher->isTeacher());
        $this->assertFalse($assistant->isTeacher());
        $this->assertTrue($admin->isTeacher()); // Admin is also a teacher type
    }

    public function test_is_assistant_method()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $admin = $this->createAdmin();

        $this->assertFalse($teacher->isAssistant());
        $this->assertTrue($assistant->isAssistant());
        $this->assertFalse($admin->isAssistant());
    }

    public function test_get_main_teacher_method()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);

        $this->assertEquals($teacher->id, $teacher->getMainTeacher()->id);
        $this->assertEquals($teacher->id, $assistant->getMainTeacher()->id);
    }

    public function test_has_active_subscription_for_teacher()
    {
        $teacher = $this->createTeacher();
        
        $this->assertFalse($teacher->hasActiveSubscription());
        
        $this->createActiveSubscription($teacher);
        
        $this->assertTrue($teacher->hasActiveSubscription());
    }

    public function test_has_active_subscription_for_assistant()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        
        $this->assertFalse($assistant->hasActiveSubscription());
        
        $this->createActiveSubscription($teacher);
        
        $this->assertTrue($assistant->hasActiveSubscription());
    }

    public function test_get_subscription_limits_for_teacher()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_students' => 50, 'max_assistants' => 3]);
        $this->createActiveSubscription($teacher, $plan);

        $limits = $teacher->getSubscriptionLimits();

        $this->assertEquals(50, $limits['max_students']);
        $this->assertEquals(3, $limits['max_assistants']);
    }

    public function test_get_subscription_limits_for_assistant()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_students' => 30, 'max_assistants' => 2]);
        $this->createActiveSubscription($teacher, $plan);

        $limits = $assistant->getSubscriptionLimits();

        $this->assertEquals(30, $limits['max_students']);
        $this->assertEquals(2, $limits['max_assistants']);
    }

    public function test_can_add_students_for_teacher()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_students' => 2]);
        $this->createActiveSubscription($teacher, $plan);

        $this->assertTrue($teacher->canAddStudents());

        // Add students up to limit
        Student::factory()->count(2)->create(['user_id' => $teacher->id]);

        $this->assertFalse($teacher->canAddStudents());
    }

    public function test_can_add_students_for_assistant()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_students' => 2]);
        $this->createActiveSubscription($teacher, $plan);

        $this->assertTrue($assistant->canAddStudents());

        // Add students up to limit (shared with teacher)
        Student::factory()->count(2)->create(['user_id' => $teacher->id]);

        $this->assertFalse($assistant->canAddStudents());
    }

    public function test_can_add_assistants()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 1]);
        $this->createActiveSubscription($teacher, $plan);

        $this->assertTrue($teacher->canAddAssistants());

        // Add assistant up to limit
        $this->createAssistant($teacher);

        $this->assertFalse($teacher->canAddAssistants());
    }

    public function test_assistant_cannot_add_assistants()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $this->assertFalse($assistant->canAddAssistants());
    }

    public function test_get_student_count_for_teacher()
    {
        $teacher = $this->createTeacher();
        
        $this->assertEquals(0, $teacher->getStudentCount());
        
        Student::factory()->count(3)->create(['user_id' => $teacher->id]);
        
        $this->assertEquals(3, $teacher->getStudentCount());
    }

    public function test_get_student_count_for_assistant()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        
        $this->assertEquals(0, $assistant->getStudentCount());
        
        Student::factory()->count(2)->create(['user_id' => $teacher->id]);
        
        $this->assertEquals(2, $assistant->getStudentCount());
    }

    public function test_has_pending_plan_upgrade()
    {
        $teacher = $this->createTeacher();
        
        $this->assertFalse($teacher->hasPendingPlanUpgrade());
        
        $teacher->planUpgradeRequests()->create([
            'current_plan_id' => 1,
            'requested_plan_id' => 2,
            'status' => 'pending',
            'notes' => 'Test upgrade'
        ]);
        
        $this->assertTrue($teacher->hasPendingPlanUpgrade());
    }
}
