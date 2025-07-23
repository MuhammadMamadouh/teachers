<?php

namespace Tests\Feature\Center;

use App\Models\Center;
use App\Models\Plan;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $center;
    protected $plan;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create roles if they don't exist
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'teacher']);
        Role::firstOrCreate(['name' => 'assistant']);

        // Create a plan
        $this->plan = Plan::factory()->create([
            'name' => 'Basic Plan',
            'max_students' => 50,
            'max_assistants' => 3,
            'price' => 100,
            'is_default' => true,
        ]);

        // Create center
        $this->center = Center::factory()->create([
            'name' => 'مركز التعليم المتميز',
            'type' => 'organization',
        ]);

        // Create admin user
        $this->admin = User::factory()->create([
            'name' => 'أحمد المدير',
            'email' => 'admin@center.com',
            'center_id' => $this->center->id,
            'type' => 'teacher',
            'is_admin' => false,
            'is_approved' => true,
            'approved_at' => now(),
            'onboarding_completed' => true,
            'email_verified_at' => now(),
        ]);

        $this->admin->assignRole('admin');
        $this->center->update(['owner_id' => $this->admin->id]);

        // Create subscription
        Subscription::factory()->create([
            'user_id' => $this->admin->id,
            'center_id' => $this->center->id,
            'plan_id' => $this->plan->id,
            'is_active' => true,
        ]);

        // Create sample data for dashboard tests
        Student::factory()->count(3)->create([
            'user_id' => $this->admin->id,
            'center_id' => $this->center->id,
        ]);

        Group::factory()->count(2)->create([
            'center_id' => $this->center->id,
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_admin_can_access_dashboard()
    {
        $response = $this->actingAs($this->admin)
            ->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('students')
            ->has('groups')
            ->has('teachers')
            ->has('assistants')
        );
    }

    public function test_admin_can_create_teacher()
    {
        $response = $this->actingAs($this->admin)
            ->post('/center/users', [
                'name' => 'محمد المعلم',
                'email' => 'teacher@center.com',
                'phone' => '0501234567',
                'subject' => 'الرياضيات',
                'governorate_id' => 1,
                'role' => 'teacher',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check teacher was created
        $this->assertDatabaseHas('users', [
            'email' => 'teacher@center.com',
            'name' => 'محمد المعلم',
            'center_id' => $this->center->id,
            'type' => 'teacher',
        ]);

        // Check role assigned
        $teacher = User::where('email', 'teacher@center.com')->first();
        $this->assertTrue($teacher->hasRole('teacher'));
    }

    public function test_admin_can_create_assistant()
    {
        $response = $this->actingAs($this->admin)
            ->post('/center/users', [
                'name' => 'فاطمة المساعدة',
                'email' => 'assistant@center.com',
                'phone' => '0507654321',
                'subject' => 'الفيزياء',
                'governorate_id' => 1,
                'role' => 'assistant',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check assistant was created
        $this->assertDatabaseHas('users', [
            'email' => 'assistant@center.com',
            'name' => 'فاطمة المساعدة',
            'center_id' => $this->center->id,
            'type' => 'assistant',
        ]);

        // Check role assigned
        $assistant = User::where('email', 'assistant@center.com')->first();
        $this->assertTrue($assistant->hasRole('assistant'));
    }

    public function test_admin_can_view_all_center_students()
    {
        // Create students in the center
        Student::factory()->count(5)->create([
            'center_id' => $this->center->id,
        ]);

        // Create students in another center (should not be visible)
        $anotherCenter = Center::factory()->create();
        Student::factory()->count(3)->create([
            'center_id' => $anotherCenter->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/students');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Students/Index')
            ->has('students', 5) // Only center students visible
        );
    }

    public function test_admin_can_view_all_center_groups()
    {
        // Create groups in the center
        Group::factory()->count(3)->create([
            'center_id' => $this->center->id,
        ]);

        // Create groups in another center (should not be visible)
        $anotherCenter = Center::factory()->create();
        Group::factory()->count(2)->create([
            'center_id' => $anotherCenter->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/groups');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Groups/Index')
            ->has('groups', 3) // Only center groups visible
        );
    }

    public function test_admin_can_manage_center_settings()
    {
        $response = $this->actingAs($this->admin)
            ->patch("/center/{$this->center->id}", [
                'name' => 'مركز التعليم المحدث',
                'address' => 'الرياض الجديدة',
                'phone' => '0501234567',
                'email' => 'center@updated.com',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check center was updated
        $this->assertDatabaseHas('centers', [
            'id' => $this->center->id,
            'name' => 'مركز التعليم المحدث',
            'address' => 'الرياض الجديدة',
            'phone' => '0501234567',
            'email' => 'center@updated.com',
        ]);
    }

    public function test_admin_can_delete_teachers_and_assistants()
    {
        // Create teacher and assistant
        $teacher = User::factory()->create([
            'center_id' => $this->center->id,
            'type' => 'teacher',
        ]);
        $teacher->assignRole('teacher');

        $assistant = User::factory()->create([
            'center_id' => $this->center->id,
            'type' => 'assistant',
        ]);
        $assistant->assignRole('assistant');

        // Delete teacher
        $response = $this->actingAs($this->admin)
            ->delete("/center/users/{$teacher->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $teacher->id]);

        // Delete assistant
        $response = $this->actingAs($this->admin)
            ->delete("/center/users/{$assistant->id}");

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $assistant->id]);
    }

    public function test_admin_cannot_delete_self()
    {
        $response = $this->actingAs($this->admin)
            ->delete("/center/users/{$this->admin->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_can_view_center_statistics()
    {
        // Create test data
        Student::factory()->count(10)->create(['center_id' => $this->center->id]);
        Group::factory()->count(5)->create(['center_id' => $this->center->id]);
        
        $teachers = User::factory()->count(3)->create([
            'center_id' => $this->center->id,
            'type' => 'teacher',
        ]);
        foreach ($teachers as $teacher) {
            $teacher->assignRole('teacher');
        }

        $assistants = User::factory()->count(2)->create([
            'center_id' => $this->center->id,
            'type' => 'assistant',
        ]);
        foreach ($assistants as $assistant) {
            $assistant->assignRole('assistant');
        }

        $response = $this->actingAs($this->admin)
            ->get('/center/statistics');

        $response->assertStatus(200);
        $response->assertJson([
            'students_count' => 10,
            'groups_count' => 5,
            'teachers_count' => 3,
            'assistants_count' => 2,
        ]);
    }

    /** @test */
    public function test_admin_respects_subscription_limits()
    {
        // Create maximum assistants allowed by plan
        for ($i = 0; $i < $this->plan->max_assistants; $i++) {
            $assistant = User::factory()->create([
                'center_id' => $this->center->id,
                'type' => 'assistant',
            ]);
            $assistant->assignRole('assistant');
        }

        // Try to create one more assistant (should fail)
        $response = $this->actingAs($this->admin)
            ->post('/center/users', [
                'name' => 'مساعد إضافي',
                'email' => 'extra@center.com',
                'phone' => '0501234567',
                'subject' => 'الرياضيات',
                'governorate_id' => 1,
                'role' => 'assistant',
            ]);

        $response->assertSessionHasErrors(['role']);
    }
}
