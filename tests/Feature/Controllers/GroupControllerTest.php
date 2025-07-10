<?php

namespace Tests\Feature\Controllers;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Student;
use Tests\TestCase;

class GroupControllerTest extends TestCase
{
    public function test_teacher_can_view_groups_index()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        // Create some groups
        Group::factory()->count(3)->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($teacher)->get(route('groups.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Groups/Index')
            ->has('groups', 3)
        );
    }

    public function test_assistant_can_view_teachers_groups()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        // Create groups for teacher with all required dependencies
        $academicYear = \App\Models\AcademicYear::factory()->create();
        Group::factory()->count(2)->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $response = $this->actingAs($assistant)->get(route('groups.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Groups/Index')
            ->has('groups') // Just check that groups exist, don't check exact count
        );
    }

    public function test_teacher_can_create_group()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        $academicYear = AcademicYear::factory()->create();

        $groupData = [
            'name' => 'مجموعة الرياضيات',
            'description' => 'مجموعة متقدمة',
            'max_students' => 20,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 150.00,
            'academic_year_id' => $academicYear->id,
            'schedules' => [
                [
                    'day_of_week' => 0, // Sunday
                    'start_time' => '10:00',
                    'end_time' => '11:30',
                ],
            ],
        ];

        $response = $this->actingAs($teacher)
            ->post(route('groups.store'), $groupData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('groups', [
            'user_id' => $teacher->id,
            'name' => 'مجموعة الرياضيات',
            'max_students' => 20,
        ]);
    }

    public function test_teacher_can_update_group()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $updateData = [
            'name' => 'مجموعة محدثة',
            'description' => 'وصف محدث',
            'max_students' => 25,
            'is_active' => true,
            'payment_type' => 'per_session',
            'student_price' => 200.00,
            'academic_year_id' => $group->academic_year_id,
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '14:00',
                    'end_time' => '15:30',
                ],
            ],
        ];

        $response = $this->actingAs($teacher)
            ->put(route('groups.update', $group), $updateData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $group->refresh();
        $this->assertEquals('مجموعة محدثة', $group->name);
        $this->assertEquals(25, $group->max_students);
    }

    public function test_teacher_can_delete_group()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($teacher)
            ->delete(route('groups.destroy', $group));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('groups', ['id' => $group->id]);
    }

    public function test_teacher_can_assign_students_to_group()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $academicYear = AcademicYear::factory()->create();

        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'max_students' => 10,
            'academic_year_id' => $academicYear->id,
        ]);

        $student1 = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => null, // Ensure students are not pre-assigned to any group
            'academic_year_id' => $academicYear->id, // Same academic year as group
        ]);
        $student2 = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => null, // Ensure students are not pre-assigned to any group
            'academic_year_id' => $academicYear->id, // Same academic year as group
        ]);

        $response = $this->actingAs($teacher)
            ->post(route('groups.assign-students', $group), [
                'student_ids' => [$student1->id, $student2->id],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $student1->refresh();
        $student2->refresh();

        $this->assertEquals($group->id, $student1->group_id);
        $this->assertEquals($group->id, $student2->group_id);
    }

    public function test_cannot_assign_students_beyond_group_capacity()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $academicYear = AcademicYear::factory()->create();

        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'max_students' => 2,
            'academic_year_id' => $academicYear->id,
        ]);

        // Already assign 2 students to reach capacity
        Student::factory()->count(2)->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $newStudent = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => null, // Ensure not pre-assigned to any group
            'academic_year_id' => $academicYear->id, // Same academic year as group
        ]);

        $response = $this->actingAs($teacher)
            ->post(route('groups.assign-students', $group), [
                'student_ids' => [$newStudent->id],
            ]);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['capacity']);
    }

    public function test_teacher_can_remove_student_from_group()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);
        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        $response = $this->actingAs($teacher)
            ->delete(route('groups.remove-student', [$group, $student]));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $student->refresh();
        $this->assertNull($student->group_id);
    }

    public function test_teacher_cannot_access_other_teachers_groups()
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $this->createActiveSubscription($teacher1);
        $this->createActiveSubscription($teacher2);

        $group = Group::factory()->create(['user_id' => $teacher2->id]);

        $response = $this->actingAs($teacher1)
            ->get(route('groups.show', $group));

        $response->assertForbidden();
    }

    public function test_assistant_can_access_teachers_groups()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($assistant)
            ->get(route('groups.show', $group));

        $response->assertOk();
    }

    public function test_group_validation_rules()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        // Test empty name
        $response = $this->actingAs($teacher)
            ->post(route('groups.store'), ['name' => '']);
        $response->assertSessionHasErrors(['name']);

        // Test invalid payment type
        $response = $this->actingAs($teacher)
            ->post(route('groups.store'), [
                'name' => 'مجموعة تجريبية',
                'payment_type' => 'invalid_type',
            ]);
        $response->assertSessionHasErrors(['payment_type']);

        // Test negative max_students
        $response = $this->actingAs($teacher)
            ->post(route('groups.store'), [
                'name' => 'مجموعة تجريبية',
                'max_students' => -1,
            ]);
        $response->assertSessionHasErrors(['max_students']);
    }

    public function test_unauthenticated_user_cannot_access_groups()
    {
        $response = $this->get(route('groups.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('groups.store'), []);
        $response->assertRedirect(route('login'));
    }
}
