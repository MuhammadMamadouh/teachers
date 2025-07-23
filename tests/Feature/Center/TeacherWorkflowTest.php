<?php

namespace Tests\Feature\Center;

use App\Models\Center;
use App\Models\Plan;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\Subscription;
use App\Models\Attendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class TeacherWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $teacher;
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

        // Create teacher user
        $this->teacher = User::factory()->create([
            'name' => 'محمد المعلم',
            'email' => 'teacher@center.com',
            'center_id' => $this->center->id,
            'type' => 'teacher',
            'is_admin' => false,
            'is_approved' => true,
            'approved_at' => now(),
            'onboarding_completed' => true,
            'email_verified_at' => now(),
        ]);

        $this->teacher->assignRole('teacher');

        // Create subscription
        Subscription::factory()->create([
            'user_id' => $this->teacher->id,
            'center_id' => $this->center->id,
            'plan_id' => $this->plan->id,
            'is_active' => true,
        ]);
    }

  
    public function test_teacher_can_access_dashboard()
    {
        $response = $this->actingAs($this->teacher)
            ->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('students')
            ->has('groups')
        );
    }

  
    public function test_teacher_can_create_student()
    {
        $response = $this->actingAs($this->teacher)
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

        $response->assertRedirect('/students');
        $response->assertSessionHas('success');

        // Check student was created with correct center
        $this->assertDatabaseHas('students', [
            'name' => 'أحمد الطالب',
            'phone' => '0501234567',
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);
    }

  
    public function test_teacher_can_create_group()
    {
        $response = $this->actingAs($this->teacher)
            ->post('/groups', [
                'name' => 'مجموعة الرياضيات المتقدمة',
                'subject' => 'الرياضيات',
                'level' => 'الصف الثاني الثانوي',
                'max_students' => 20,
                'session_duration' => 90,
                'price_per_session' => 50,
                'description' => 'مجموعة لطلاب الرياضيات المتقدمة',
            ]);

        $response->assertRedirect('/groups');
        $response->assertSessionHas('success');

        // Check group was created with correct center
        $this->assertDatabaseHas('groups', [
            'name' => 'مجموعة الرياضيات المتقدمة',
            'subject' => 'الرياضيات',
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);
    }

  
    public function test_teacher_can_add_students_to_group()
    {
        // Create group
        $group = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        // Create students
        $students = Student::factory()->count(3)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->post("/groups/{$group->id}/students", [
                'student_ids' => $students->pluck('id')->toArray(),
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check students were added to group
        foreach ($students as $student) {
            $this->assertDatabaseHas('group_student', [
                'group_id' => $group->id,
                'student_id' => $student->id,
            ]);
        }
    }

  
    public function test_teacher_can_record_attendance()
    {
        // Create group with students
        $group = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $students = Student::factory()->count(3)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $group->students()->attach($students);

        $response = $this->actingAs($this->teacher)
            ->post('/attendance', [
                'group_id' => $group->id,
                'session_date' => now()->toDateString(),
                'attendances' => [
                    ['student_id' => $students[0]->id, 'status' => 'present'],
                    ['student_id' => $students[1]->id, 'status' => 'absent'],
                    ['student_id' => $students[2]->id, 'status' => 'late'],
                ],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check attendance records were created
        $this->assertDatabaseHas('attendances', [
            'group_id' => $group->id,
            'student_id' => $students[0]->id,
            'status' => 'present',
        ]);

        $this->assertDatabaseHas('attendances', [
            'group_id' => $group->id,
            'student_id' => $students[1]->id,
            'status' => 'absent',
        ]);

        $this->assertDatabaseHas('attendances', [
            'group_id' => $group->id,
            'student_id' => $students[2]->id,
            'status' => 'late',
        ]);
    }

  
    public function test_teacher_can_only_access_own_center_data()
    {
        // Create another center with data
        $anotherCenter = Center::factory()->create();
        $anotherStudent = Student::factory()->create([
            'center_id' => $anotherCenter->id,
        ]);
        $anotherGroup = Group::factory()->create([
            'center_id' => $anotherCenter->id,
        ]);

        // Try to access another center's student
        $response = $this->actingAs($this->teacher)
            ->get("/students/{$anotherStudent->id}");

        $response->assertStatus(404);

        // Try to access another center's group
        $response = $this->actingAs($this->teacher)
            ->get("/groups/{$anotherGroup->id}");

        $response->assertStatus(404);
    }

  
    public function test_teacher_can_view_own_students_only()
    {
        // Create students for this teacher
        Student::factory()->count(3)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        // Create students for another teacher in same center
        $anotherTeacher = User::factory()->create([
            'center_id' => $this->center->id,
            'type' => 'teacher',
        ]);
        $anotherTeacher->assignRole('teacher');

        Student::factory()->count(2)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $anotherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get('/students');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Students/Index')
            ->has('students', 3) // Only own students visible
        );
    }

  
    public function test_teacher_can_view_own_groups_only()
    {
        // Create groups for this teacher
        Group::factory()->count(2)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        // Create groups for another teacher in same center
        $anotherTeacher = User::factory()->create([
            'center_id' => $this->center->id,
            'type' => 'teacher',
        ]);
        $anotherTeacher->assignRole('teacher');

        Group::factory()->count(3)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $anotherTeacher->id,
        ]);

        $response = $this->actingAs($this->teacher)
            ->get('/groups');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Groups/Index')
            ->has('groups', 2) // Only own groups visible
        );
    }

  
    public function test_teacher_cannot_access_admin_features()
    {
        // Try to access center management
        $response = $this->actingAs($this->teacher)
            ->get('/center/users');

        $response->assertStatus(403);

        // Try to create users
        $response = $this->actingAs($this->teacher)
            ->post('/center/users', [
                'name' => 'مساعد جديد',
                'email' => 'assistant@center.com',
                'role' => 'assistant',
            ]);

        $response->assertStatus(403);

        // Try to access center settings
        $response = $this->actingAs($this->teacher)
            ->get('/center/settings');

        $response->assertStatus(403);
    }

  
    public function test_teacher_can_update_own_profile()
    {
        $response = $this->actingAs($this->teacher)
            ->put('/profile', [
                'name' => 'محمد المعلم المحدث',
                'phone' => '0501234567',
                'subject' => 'الرياضيات المتقدمة',
                'governorate_id' => 2,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check profile was updated
        $this->assertDatabaseHas('users', [
            'id' => $this->teacher->id,
            'name' => 'محمد المعلم المحدث',
            'phone' => '0501234567',
            'subject' => 'الرياضيات المتقدمة',
            'governorate_id' => 2,
        ]);
    }

  
    public function test_teacher_can_view_attendance_reports()
    {
        // Create group with students and attendance
        $group = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $students = Student::factory()->count(2)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $group->students()->attach($students);

        // Create attendance records
        foreach ($students as $student) {
            Attendance::factory()->create([
                'group_id' => $group->id,
                'student_id' => $student->id,
                'status' => 'present',
                'session_date' => now()->toDateString(),
            ]);
        }

        $response = $this->actingAs($this->teacher)
            ->get("/groups/{$group->id}/attendance");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Attendance/Index')
            ->has('attendances')
        );
    }
}
