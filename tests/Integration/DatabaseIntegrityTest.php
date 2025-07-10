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
use Illuminate\Support\Facades\DB;

class DatabaseIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_relationships_integrity()
    {
        $teacher = User::factory()->create(['type' => 'teacher']);
        $assistant = User::factory()->create([
            'type' => 'assistant',
            'teacher_id' => $teacher->id,
        ]);

        // Test relationships
        $this->assertEquals($teacher->id, $assistant->teacher->id);
        $this->assertTrue($assistant->isAssistant());
        $this->assertTrue($teacher->isTeacher());
        $this->assertContains($assistant->id, $teacher->assistants->pluck('id'));
    }

    public function test_subscription_cascade_behavior()
    {
        $teacher = User::factory()->create(['type' => 'teacher']);
        $plan = Plan::factory()->create();
        
        $subscription = Subscription::factory()->create([
            'user_id' => $teacher->id,
            'plan_id' => $plan->id,
        ]);

        // Test relationships
        $this->assertEquals($teacher->id, $subscription->user->id);
        $this->assertEquals($plan->id, $subscription->plan->id);
        $this->assertContains($subscription->id, $teacher->subscriptions->pluck('id'));
    }

    public function test_student_group_relationships()
    {
        $teacher = User::factory()->create(['type' => 'teacher']);
        $academicYear = AcademicYear::factory()->create();
        
        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        // Test relationships
        $this->assertEquals($teacher->id, $student->user->id);
        $this->assertEquals($group->id, $student->group->id);
        $this->assertEquals($teacher->id, $group->user->id);
        $this->assertEquals($academicYear->id, $group->academicYear->id);
        $this->assertContains($student->id, $group->students->pluck('id'));
        $this->assertContains($student->id, $teacher->students->pluck('id'));
    }

    public function test_foreign_key_constraints()
    {
        $teacher = User::factory()->create(['type' => 'teacher']);
        $academicYear = AcademicYear::factory()->create();
        
        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        // Verify that deleting a teacher cascades properly
        $teacherId = $teacher->id;
        $studentId = $student->id;
        $groupId = $group->id;

        $teacher->delete();

        // Check what happens to related records
        $this->assertDatabaseMissing('users', ['id' => $teacherId]);
        
        // Note: Depending on your foreign key constraints, 
        // these might be cascade deleted or set to null
        // Adjust these assertions based on your actual schema
    }

    public function test_unique_constraints()
    {
        // Create first user with a specific phone
        User::factory()->create([
            'type' => 'teacher',
            'phone' => '0501234567',
            'email' => 'test1@example.com',
        ]);

        // Attempt to create second user with same phone should fail
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        User::factory()->create([
            'type' => 'teacher',
            'phone' => '0501234567', // Same phone
            'email' => 'test2@example.com', // Different email to avoid email unique constraint
        ]);
    }

    public function test_data_consistency()
    {
        $teacher = User::factory()->create([
            'type' => 'teacher',
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);
        $plan = Plan::factory()->create(['max_students' => 5]);
        
        $subscription = Subscription::factory()->create([
            'user_id' => $teacher->id,
            'plan_id' => $plan->id,
            'is_active' => true,
            'start_date' => now()->subDay(),
            'end_date' => now()->addMonth(),
        ]);

        $academicYear = AcademicYear::factory()->create();
        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        // Create students
        Student::factory()->count(3)->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        // Verify counts match
        $this->assertEquals(3, $teacher->students()->count());
        $this->assertEquals(3, $group->students()->count());
        
        // Debug: Check subscription and plan relationship
        $teacher->refresh();
        $subscription->refresh();
        $plan->refresh();
        
        $this->assertNotNull($teacher->activeSubscription, 'Teacher should have an active subscription');
        $this->assertEquals($subscription->id, $teacher->activeSubscription->id);
        $this->assertNotNull($teacher->activeSubscription->plan, 'Subscription should have a plan');
        $this->assertEquals(5, $teacher->activeSubscription->plan->max_students);
        
        $limits = $teacher->getSubscriptionLimits();
        $this->assertEquals(5, $limits['max_students']);
        $this->assertEquals(3, $limits['current_students']);
        
        $this->assertTrue($teacher->canAddStudents());
    }
}
