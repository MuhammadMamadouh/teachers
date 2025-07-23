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

class CenterWorkflowIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $teacher;
    protected $assistant;
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
            'name' => 'مركز التعليم المتكامل',
            'type' => 'organization',
        ]);

        // Create admin user
        $this->admin = User::factory()->create([
            'name' => 'سارة المديرة',
            'email' => 'admin@center.com',
            'center_id' => $this->center->id,
            'type' => 'teacher',
            'is_admin' => false,
        ]);
        $this->admin->assignRole('admin');
        $this->center->update(['owner_id' => $this->admin->id]);

        // Create teacher user
        $this->teacher = User::factory()->create([
            'name' => 'محمد المعلم',
            'email' => 'teacher@center.com',
            'center_id' => $this->center->id,
            'type' => 'teacher',
            'is_admin' => false,
        ]);
        $this->teacher->assignRole('teacher');

        // Create assistant user
        $this->assistant = User::factory()->create([
            'name' => 'فاطمة المساعدة',
            'email' => 'assistant@center.com',
            'center_id' => $this->center->id,
            'type' => 'assistant',
            'is_admin' => false,
        ]);
        $this->assistant->assignRole('assistant');

        // Create subscription
        Subscription::factory()->create([
            'user_id' => $this->admin->id,
            'center_id' => $this->center->id,
            'plan_id' => $this->plan->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function complete_workflow_from_registration_to_teaching()
    {
        // 1. Registration (covered in RegistrationWorkflowTest)
        $this->assertTrue($this->center->exists());
        $this->assertTrue($this->admin->exists());
        $this->assertTrue($this->admin->hasRole('admin'));

        // 2. Admin creates teacher and assistant
        $this->actingAs($this->admin)
            ->post('/center/users', [
                'name' => 'أحمد المعلم الجديد',
                'email' => 'new-teacher@center.com',
                'phone' => '0501234567',
                'subject' => 'الفيزياء',
                'governorate_id' => 1,
                'role' => 'teacher',
            ]);

        $newTeacher = User::where('email', 'new-teacher@center.com')->first();
        $this->assertTrue($newTeacher->hasRole('teacher'));
        $this->assertEquals($this->center->id, $newTeacher->center_id);

        // 3. Teacher creates students
        $this->actingAs($this->teacher)
            ->post('/students', [
                'name' => 'أحمد الطالب',
                'phone' => '0501234567',
                'parent_phone' => '0507654321',
                'school' => 'مدرسة النور',
                'level' => 'الصف الأول الثانوي',
                'subject' => 'الرياضيات',
                'governorate_id' => 1,
                'notes' => 'طالب متميز',
            ]);

        $student = Student::where('name', 'أحمد الطالب')->first();
        $this->assertEquals($this->center->id, $student->center_id);
        $this->assertEquals($this->teacher->id, $student->teacher_id);

        // 4. Teacher creates group
        $this->actingAs($this->teacher)
            ->post('/groups', [
                'name' => 'مجموعة الرياضيات المتقدمة',
                'subject' => 'الرياضيات',
                'level' => 'الصف الأول الثانوي',
                'max_students' => 20,
                'session_duration' => 90,
                'price_per_session' => 50,
                'description' => 'مجموعة للطلاب المتميزين',
            ]);

        $group = Group::where('name', 'مجموعة الرياضيات المتقدمة')->first();
        $this->assertEquals($this->center->id, $group->center_id);
        $this->assertEquals($this->teacher->id, $group->teacher_id);

        // 5. Teacher adds student to group
        $this->actingAs($this->teacher)
            ->post("/groups/{$group->id}/students", [
                'student_ids' => [$student->id],
            ]);

        $this->assertDatabaseHas('group_student', [
            'group_id' => $group->id,
            'student_id' => $student->id,
        ]);

        // 6. Assistant records attendance
        $this->actingAs($this->assistant)
            ->post('/attendance', [
                'group_id' => $group->id,
                'session_date' => now()->toDateString(),
                'attendances' => [
                    ['student_id' => $student->id, 'status' => 'present'],
                ],
            ]);

        $this->assertDatabaseHas('attendances', [
            'group_id' => $group->id,
            'student_id' => $student->id,
            'status' => 'present',
        ]);

        // 7. Admin can view all data
        $response = $this->actingAs($this->admin)
            ->get('/dashboard');

        $response->assertStatus(200);

        // 8. Role-based permissions are enforced
        // Assistant cannot create students
        $response = $this->actingAs($this->assistant)
            ->post('/students', [
                'name' => 'طالب جديد',
                'phone' => '0501234567',
                'parent_phone' => '0507654321',
                'school' => 'مدرسة النور',
                'level' => 'الصف الأول الثانوي',
                'subject' => 'الرياضيات',
                'governorate_id' => 1,
            ]);

        $response->assertStatus(403);

        // Teacher cannot access admin features
        $response = $this->actingAs($this->teacher)
            ->get('/center/users');

        $response->assertStatus(403);
    }

    /** @test */
    public function data_isolation_between_centers()
    {
        // Create another center with its own data
        $anotherCenter = Center::factory()->create([
            'name' => 'مركز آخر',
            'type' => 'individual',
        ]);

        $anotherAdmin = User::factory()->create([
            'center_id' => $anotherCenter->id,
            'type' => 'teacher',
        ]);
        $anotherAdmin->assignRole('admin');
        $anotherCenter->update(['owner_id' => $anotherAdmin->id]);

        $anotherStudent = Student::factory()->create([
            'center_id' => $anotherCenter->id,
            'teacher_id' => $anotherAdmin->id,
        ]);

        $anotherGroup = Group::factory()->create([
            'center_id' => $anotherCenter->id,
            'teacher_id' => $anotherAdmin->id,
        ]);

        // Create data in our center
        $ourStudent = Student::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $ourGroup = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        // Test that admin can only see own center data
        $response = $this->actingAs($this->admin)
            ->get('/students');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Students/Index')
            ->has('students', 1) // Only our student
        );

        // Test that users cannot access other center's data
        $response = $this->actingAs($this->teacher)
            ->get("/students/{$anotherStudent->id}");

        $response->assertStatus(404);

        $response = $this->actingAs($this->assistant)
            ->get("/groups/{$anotherGroup->id}");

        $response->assertStatus(404);
    }

    /** @test */
    public function subscription_limits_are_enforced()
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

    /** @test */
    public function role_hierarchy_is_respected()
    {
        // Admin can manage teachers and assistants
        $this->assertTrue($this->admin->hasRole('admin'));
        
        // Teacher can manage students and groups
        $this->assertTrue($this->teacher->hasRole('teacher'));
        
        // Assistant has limited permissions
        $this->assertTrue($this->assistant->hasRole('assistant'));
        
        // Test permission hierarchy
        $this->assertTrue($this->admin->can('manage-users'));
        $this->assertTrue($this->teacher->can('manage-students'));
        $this->assertTrue($this->assistant->can('view-students'));
        
        // Assistant cannot manage
        $this->assertFalse($this->assistant->can('manage-students'));
        $this->assertFalse($this->assistant->can('manage-groups'));
    }

    /** @test */
    public function system_handles_concurrent_operations()
    {
        // Simulate multiple users working simultaneously
        $students = Student::factory()->count(10)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $group = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        // Teacher adds students to group
        $this->actingAs($this->teacher)
            ->post("/groups/{$group->id}/students", [
                'student_ids' => $students->pluck('id')->toArray(),
            ]);

        // Assistant records attendance for all students
        $attendances = $students->map(function ($student) {
            return [
                'student_id' => $student->id,
                'status' => 'present',
            ];
        })->toArray();

        $this->actingAs($this->assistant)
            ->post('/attendance', [
                'group_id' => $group->id,
                'session_date' => now()->toDateString(),
                'attendances' => $attendances,
            ]);

        // Verify all attendance records were created
        foreach ($students as $student) {
            $this->assertDatabaseHas('attendances', [
                'group_id' => $group->id,
                'student_id' => $student->id,
                'status' => 'present',
            ]);
        }

        // Admin can view statistics
        $response = $this->actingAs($this->admin)
            ->get('/center/statistics');

        $response->assertStatus(200);
        $response->assertJson([
            'students_count' => 10,
            'groups_count' => 1,
            'teachers_count' => 1,
            'assistants_count' => 1,
        ]);
    }
}
