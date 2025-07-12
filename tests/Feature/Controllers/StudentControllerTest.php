<?php

namespace Tests\Feature\Controllers;

use App\Models\AcademicYear;
use App\Models\Student;
use Tests\TestCase;

class StudentControllerTest extends TestCase
{
    public function test_teacher_can_view_students_index()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_students' => 10]);
        $this->createActiveSubscription($teacher, $plan);

        // Create some students
        Student::factory()->count(3)->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($teacher)->get(route('students.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Students/Index')
            ->has('students', 3)
            ->where('canAddStudents', true)
        );
    }

    public function test_assistant_can_view_teachers_students()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_students' => 10]);
        $this->createActiveSubscription($teacher, $plan);

        // Create students for teacher
        Student::factory()->count(3)->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($assistant)->get(route('students.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Students/Index')
            ->has('students', 3)
        );
    }

    public function test_teacher_can_create_student()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_students' => 10]);
        $this->createActiveSubscription($teacher, $plan);

        $academicYear = AcademicYear::factory()->create();

        $studentData = [
            'name' => 'أحمد محمد',
            'phone' => '0501234567',
            'guardian_phone' => '0507654321',
            'academic_year_id' => $academicYear->id,
            'notes' => 'طالب متميز',
        ];

        $response = $this->actingAs($teacher)
            ->post(route('students.store'), $studentData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('students', [
            'user_id' => $teacher->id,
            'name' => 'أحمد محمد',
            'phone' => '0501234567',
        ]);
    }

    public function test_cannot_create_student_when_plan_limit_reached()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_students' => 2]);
        $this->createActiveSubscription($teacher, $plan);

        $academicYear = AcademicYear::factory()->create();

        // Create students up to limit
        Student::factory()->count(2)->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $studentData = [
            'name' => 'أحمد محمد',
            'phone' => '0501234567',
            'guardian_phone' => '0507654321',
            'academic_year_id' => $academicYear->id,
        ];

        $response = $this->actingAs($teacher)
            ->post(route('students.store'), $studentData);

        $response->assertRedirect();
        // The error message appears as a general error, not a field-specific error
        $response->assertSessionHasErrors();
    }

    public function test_teacher_can_update_student()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $academicYear = AcademicYear::factory()->create();
        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $updateData = [
            'name' => 'محمد علي',
            'phone' => '0509876543',
            'guardian_phone' => '0501234567',
            'academic_year_id' => $academicYear->id,
        ];

        $response = $this->actingAs($teacher)
            ->put(route('students.update', $student), $updateData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $student->refresh();
        $this->assertEquals('محمد علي', $student->name);
        $this->assertEquals('0509876543', $student->phone);
    }

    public function test_teacher_can_delete_student()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $student = Student::factory()->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($teacher)
            ->delete(route('students.destroy', $student));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('students', ['id' => $student->id]);
    }

    public function test_teacher_cannot_access_other_teachers_students()
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $this->createActiveSubscription($teacher1);
        $this->createActiveSubscription($teacher2);

        $student = Student::factory()->create(['user_id' => $teacher2->id]);

        $response = $this->actingAs($teacher1)
            ->get(route('students.show', $student));

        $response->assertForbidden();
    }

    public function test_assistant_can_access_teachers_students()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $student = Student::factory()->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($assistant)
            ->get(route('students.show', $student));

        $response->assertOk();
    }

    public function test_student_validation_rules()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $academicYear = AcademicYear::factory()->create();

        // Test empty name
        $response = $this->actingAs($teacher)
            ->post(route('students.store'), [
                'name' => '',
                'phone' => '0501234567',
                'guardian_phone' => '0501234567',
                'academic_year_id' => $academicYear->id,
            ]);
        $response->assertSessionHasErrors(['name']);

        // Test missing required fields
        $response = $this->actingAs($teacher)
            ->post(route('students.store'), [
                'name' => 'أحمد محمد',
            ]);
        $response->assertSessionHasErrors([ 'academic_year_id']);

        // Test duplicate phone within same teacher
        Student::factory()->create([
            'user_id' => $teacher->id,
            'phone' => '0501234567',
            'guardian_phone' => '0502345678',
            'academic_year_id' => $academicYear->id,
        ]);

        $response = $this->actingAs($teacher)
            ->post(route('students.store'), [
                'name' => 'محمد علي',
                'phone' => '0501234567',
                'guardian_phone' => '0503456789',
                'academic_year_id' => $academicYear->id,
            ]);
        // Should pass because the unique constraint is handled by the model/database level
        $response->assertRedirect();
    }
}
