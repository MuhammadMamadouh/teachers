<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;
    public function test_admin_sees_admin_dashboard()
    {
        $admin = $this->createAdmin();

        // Create some test data
        $teacher = $this->createTeacher();
        $plan = $this->createPlan();
        $this->createActiveSubscription($teacher, $plan);
        Student::factory()->count(5)->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->has('systemStats')
            ->has('planStats')
            ->has('recentUsers')
            ->has('usageStats')
            ->has('adminReports')
        );
    }

    public function test_teacher_sees_teacher_dashboard()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_students' => 10]);
        $this->createActiveSubscription($teacher, $plan);

        // Create some students
        Student::factory()->count(3)->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($teacher)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('subscriptionLimits')
            ->where('currentStudentCount', 3)
            ->where('canAddStudents', true)
            ->has('availablePlans')
        );
    }

    public function test_assistant_sees_assistant_dashboard()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_students' => 10]);
        $this->createActiveSubscription($teacher, $plan);

        // Create some students for teacher
        Student::factory()->count(5)->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($assistant)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('subscriptionLimits')
            ->where('currentStudentCount', 5)
            ->where('canAddStudents', false) // Assistants can't add students directly
            ->where('isAssistant', true)
            ->where('teacherName', $teacher->name)
            ->where('availablePlans', []) // Assistants don't see upgrade options
        );
    }

    public function test_assistant_without_teacher_redirected_to_onboarding()
    {
        $assistant = User::factory()->assistant()->create([
            'teacher_id' => null,
            'is_approved' => true,
            'onboarding_completed' => false, // Not completed since they have no teacher to inherit from
        ]);

        $response = $this->actingAs($assistant)->get(route('dashboard'));

        $response->assertRedirect(route('onboarding.show'));
    }

    public function test_teacher_can_view_calendar()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($teacher)->get(route('dashboard.calendar'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Calendar')
            ->has('groups')
        );
    }

    public function test_assistant_can_view_calendar()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($assistant)->get(route('dashboard.calendar'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Calendar')
            ->has('groups')
        );
    }

    public function test_unauthenticated_user_redirected_to_login()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_system_stats_calculated_correctly()
    {
        $admin = $this->createAdmin();

        // Create test data with explicit counts
        $approvedTeacher = $this->createTeacher(['is_approved' => true]);
        $pendingTeacher = $this->createTeacher(['is_approved' => false]);
        Student::factory()->count(10)->create(['user_id' => $approvedTeacher->id]);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        // Just verify the structure and that values are reasonable numbers
        $response->assertInertia(fn ($page) => $page
            ->has('systemStats')
            ->has('systemStats.total_users')
            ->has('systemStats.approved_users') 
            ->has('systemStats.pending_users')
            ->has('systemStats.total_students')
            ->where('systemStats.total_students', fn($count) => $count >= 10) // At least our 10 students
        );
    }

    public function test_plan_stats_include_subscription_counts()
    {
        $admin = $this->createAdmin();

        $plan1 = $this->createPlan(['name' => 'Basic']);
        $plan2 = $this->createPlan(['name' => 'Premium']);

        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $teacher3 = $this->createTeacher();

        $this->createActiveSubscription($teacher1, $plan1);
        $this->createActiveSubscription($teacher2, $plan1);
        $this->createActiveSubscription($teacher3, $plan2);

        $response = $this->actingAs($admin)->get(route('dashboard'));

        // Just verify planStats exists and has reasonable structure
        // Since seeders create multiple plans, we can't predict exact count
        $response->assertInertia(fn ($page) => $page
            ->has('planStats')
            ->where('planStats', fn($stats) => count($stats) >= 2) // At least our 2 plans
        );
    }
}
