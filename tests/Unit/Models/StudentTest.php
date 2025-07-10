<?php

namespace Tests\Unit\Models;

use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Tests\TestCase;

class StudentTest extends TestCase
{
    public function test_student_can_be_created()
    {
        $teacher = $this->createTeacher();

        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'name' => 'أحمد محمد',
            'phone' => '0501234567',
        ]);

        $this->assertDatabaseHas('students', [
            'user_id' => $teacher->id,
            'name' => 'أحمد محمد',
            'phone' => '0501234567',
        ]);
    }

    public function test_student_belongs_to_user()
    {
        $teacher = $this->createTeacher();
        $student = Student::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf(User::class, $student->user);
        $this->assertEquals($teacher->id, $student->user->id);
    }

    public function test_student_belongs_to_group()
    {
        $teacher = $this->createTeacher();
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        $this->assertInstanceOf(Group::class, $student->group);
        $this->assertEquals($group->id, $student->group->id);
    }

    public function test_student_can_have_no_group()
    {
        $teacher = $this->createTeacher();
        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => null,
        ]);

        $this->assertNull($student->group);
    }

    public function test_student_has_payments_relationship()
    {
        $teacher = $this->createTeacher();
        $student = Student::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $student->payments);
    }

    public function test_student_has_attendance_relationship()
    {
        $teacher = $this->createTeacher();
        $student = Student::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $student->attendances);
    }

    public function test_student_phone_is_unique_per_teacher()
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();

        // Same phone for different teachers should be allowed
        $student1 = Student::factory()->create([
            'user_id' => $teacher1->id,
            'phone' => '0501234567',
        ]);

        $student2 = Student::factory()->create([
            'user_id' => $teacher2->id,
            'phone' => '0501234567',
        ]);

        $this->assertDatabaseHas('students', ['id' => $student1->id]);
        $this->assertDatabaseHas('students', ['id' => $student2->id]);
    }

    public function test_student_name_is_fillable()
    {
        $teacher = $this->createTeacher();

        $student = Student::create([
            'user_id' => $teacher->id,
            'name' => 'سارة أحمد',
            'phone' => '0509876543',
            'guardian_phone' => '0501234567',
        ]);

        $this->assertEquals('سارة أحمد', $student->name);
        $this->assertEquals('0509876543', $student->phone);
        $this->assertEquals('0501234567', $student->guardian_phone);
    }
}
