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

class AssistantWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected $assistant;
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

        // Create assistant user
        $this->assistant = User::factory()->create([
            'name' => 'فاطمة المساعدة',
            'email' => 'assistant@center.com',
            'center_id' => $this->center->id,
            'type' => 'assistant',
            'is_admin' => false,
            'teacher_id' => $this->teacher->id,
            'is_approved' => true,
            'approved_at' => now(),
            'onboarding_completed' => true,
            'email_verified_at' => now(),
        ]);
        $this->assistant->assignRole('assistant');

        // Create subscription
        Subscription::factory()->create([
            'user_id' => $this->teacher->id,
            'center_id' => $this->center->id,
            'plan_id' => $this->plan->id,
            'is_active' => true,
        ]);
    }

    
    public function test_assistant_can_access_dashboard()
    {
        $response = $this->actingAs($this->assistant)
            ->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('students')
            ->has('groups')
        );
    }

    
    public function test_assistant_can_view_all_center_students()
    {
        // Create students in the center
        Student::factory()->count(5)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        // Create students in another center (should not be visible)
        $anotherCenter = Center::factory()->create();
        Student::factory()->count(3)->create([
            'center_id' => $anotherCenter->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->get('/students');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Students/Index')
            ->has('students', 5) // All center students visible
        );
    }

    
    public function test_assistant_can_view_all_center_groups()
    {
        // Create groups in the center
        Group::factory()->count(3)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        // Create groups in another center (should not be visible)
        $anotherCenter = Center::factory()->create();
        Group::factory()->count(2)->create([
            'center_id' => $anotherCenter->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->get('/groups');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Groups/Index')
            ->has('groups', 3) // All center groups visible
        );
    }

    
    public function test_assistant_can_record_attendance()
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

        $response = $this->actingAs($this->assistant)
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

    
    public function test_assistant_can_update_student_information()
    {
        $student = Student::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->put("/students/{$student->id}", [
                'name' => 'أحمد الطالب المحدث',
                'phone' => '0501234567',
                'parent_phone' => '0507654321',
                'school' => 'مدرسة النور الجديدة',
                'level' => 'الصف الثاني الثانوي',
                'subject' => 'الرياضيات',
                'governorate_id' => 1,
                'notes' => 'طالب متميز ومحدث',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check student was updated
        $this->assertDatabaseHas('students', [
            'id' => $student->id,
            'name' => 'أحمد الطالب المحدث',
            'phone' => '0501234567',
            'school' => 'مدرسة النور الجديدة',
            'level' => 'الصف الثاني الثانوي',
        ]);
    }

    
    public function test_assistant_can_view_attendance_reports()
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

        $response = $this->actingAs($this->assistant)
            ->get("/groups/{$group->id}/attendance");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Attendance/Index')
            ->has('attendances')
        );
    }

    
    public function test_assistant_cannot_create_students()
    {
        $response = $this->actingAs($this->assistant)
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

        $response->assertStatus(403);
    }

    
    public function test_assistant_cannot_create_groups()
    {
        $response = $this->actingAs($this->assistant)
            ->post('/groups', [
                'name' => 'مجموعة الرياضيات المتقدمة',
                'subject' => 'الرياضيات',
                'level' => 'الصف الثاني الثانوي',
                'max_students' => 20,
                'session_duration' => 90,
                'price_per_session' => 50,
                'description' => 'مجموعة لطلاب الرياضيات المتقدمة',
            ]);

        $response->assertStatus(403);
    }

    
    public function test_assistant_cannot_delete_students()
    {
        $student = Student::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->delete("/students/{$student->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('students', ['id' => $student->id]);
    }

    
    public function test_assistant_cannot_delete_groups()
    {
        $group = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->delete("/groups/{$group->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('groups', ['id' => $group->id]);
    }

    
    public function test_assistant_cannot_access_admin_features()
    {
        // Try to access center management
        $response = $this->actingAs($this->assistant)
            ->get('/center/users');

        $response->assertStatus(403);

        // Try to create users
        $response = $this->actingAs($this->assistant)
            ->post('/center/users', [
                'name' => 'مساعد جديد',
                'email' => 'assistant2@center.com',
                'role' => 'assistant',
            ]);

        $response->assertStatus(403);

        // Try to access center settings
        $response = $this->actingAs($this->assistant)
            ->get('/center/settings');

        $response->assertStatus(403);
    }

    
    public function test_assistant_cannot_modify_groups()
    {
        $group = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->put("/groups/{$group->id}", [
                'name' => 'مجموعة محدثة',
                'subject' => 'الفيزياء',
                'level' => 'الصف الثالث الثانوي',
                'max_students' => 25,
                'session_duration' => 120,
                'price_per_session' => 75,
            ]);

        $response->assertStatus(403);
    }

    
    public function test_assistant_cannot_add_students_to_groups()
    {
        $group = Group::factory()->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $students = Student::factory()->count(2)->create([
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->post("/groups/{$group->id}/students", [
                'student_ids' => $students->pluck('id')->toArray(),
            ]);

        $response->assertStatus(403);
    }

    
    public function test_assistant_can_update_own_profile()
    {
        $response = $this->actingAs($this->assistant)
            ->put('/profile', [
                'name' => 'فاطمة المساعدة المحدثة',
                'phone' => '0501234567',
                'subject' => 'الرياضيات والفيزياء',
                'governorate_id' => 2,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Check profile was updated
        $this->assertDatabaseHas('users', [
            'id' => $this->assistant->id,
            'name' => 'فاطمة المساعدة المحدثة',
            'phone' => '0501234567',
            'subject' => 'الرياضيات والفيزياء',
            'governorate_id' => 2,
        ]);
    }

    
    public function test_assistant_can_only_access_own_center_data()
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
        $response = $this->actingAs($this->assistant)
            ->get("/students/{$anotherStudent->id}");

        $response->assertStatus(404);

        // Try to access another center's group
        $response = $this->actingAs($this->assistant)
            ->get("/groups/{$anotherGroup->id}");

        $response->assertStatus(404);
    }

    
    public function test_assistant_can_search_students()
    {
        // Create students with different names
        Student::factory()->create([
            'name' => 'أحمد محمد',
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        Student::factory()->create([
            'name' => 'فاطمة أحمد',
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        Student::factory()->create([
            'name' => 'علي سعد',
            'center_id' => $this->center->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($this->assistant)
            ->get('/students?search=أحمد');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Students/Index')
            ->has('students', 2) // Should find 2 students with "أحمد" in name
        );
    }
}
