<?php

namespace Tests\Unit\Models;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use Tests\TestCase;

class GroupTest extends TestCase
{
    public function test_group_can_be_created()
    {
        $teacher = $this->createTeacher();
        $academicYear = AcademicYear::factory()->create();

        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'name' => 'المجموعة الأولى',
            'academic_year_id' => $academicYear->id,
        ]);

        $this->assertDatabaseHas('groups', [
            'user_id' => $teacher->id,
            'name' => 'المجموعة الأولى',
            'academic_year_id' => $academicYear->id,
        ]);
    }

    public function test_group_belongs_to_user()
    {
        $teacher = $this->createTeacher();
        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf(User::class, $group->user);
        $this->assertEquals($teacher->id, $group->user->id);
    }

    public function test_group_belongs_to_academic_year()
    {
        $teacher = $this->createTeacher();
        $academicYear = AcademicYear::factory()->create();
        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $this->assertInstanceOf(AcademicYear::class, $group->academicYear);
        $this->assertEquals($academicYear->id, $group->academicYear->id);
    }

    public function test_group_has_many_students()
    {
        $teacher = $this->createTeacher();
        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $student1 = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        $student2 = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        $this->assertCount(2, $group->students);
        $this->assertTrue($group->students->contains($student1));
        $this->assertTrue($group->students->contains($student2));
    }

    public function test_group_has_many_schedules()
    {
        $teacher = $this->createTeacher();
        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $group->schedules);
    }

    public function test_group_has_many_special_sessions()
    {
        $teacher = $this->createTeacher();
        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $group->specialSessions);
    }

    public function test_group_has_many_payments()
    {
        $teacher = $this->createTeacher();
        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $group->payments);
    }

    public function test_group_has_many_attendance_records()
    {
        $teacher = $this->createTeacher();
        $group = Group::factory()->create(['user_id' => $teacher->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $group->attendances);
    }

    public function test_group_is_active_scope()
    {
        $teacher = $this->createTeacher();

        $activeGroup = Group::factory()->create([
            'user_id' => $teacher->id,
            'is_active' => true,
        ]);

        $inactiveGroup = Group::factory()->create([
            'user_id' => $teacher->id,
            'is_active' => false,
        ]);

        $activeGroups = Group::isActive()->get();

        $this->assertTrue($activeGroups->contains($activeGroup));
        $this->assertFalse($activeGroups->contains($inactiveGroup));
    }

    public function test_group_payment_type_enum()
    {
        $teacher = $this->createTeacher();

        $monthlyGroup = Group::factory()->create([
            'user_id' => $teacher->id,
            'payment_type' => 'monthly',
        ]);

        $perSessionGroup = Group::factory()->create([
            'user_id' => $teacher->id,
            'payment_type' => 'per_session',
        ]);

        $this->assertEquals('monthly', $monthlyGroup->payment_type);
        $this->assertEquals('per_session', $perSessionGroup->payment_type);
    }

    public function test_group_fillable_attributes()
    {
        $teacher = $this->createTeacher();
        $academicYear = AcademicYear::factory()->create();

        $group = Group::create([
            'user_id' => $teacher->id,
            'name' => 'مجموعة الرياضيات',
            'description' => 'مجموعة متقدمة للرياضيات',
            'max_students' => 15,
            'is_active' => true,
            'payment_type' => 'monthly',
            'student_price' => 150.00,
            'academic_year_id' => $academicYear->id,
        ]);

        $this->assertEquals('مجموعة الرياضيات', $group->name);
        $this->assertEquals('مجموعة متقدمة للرياضيات', $group->description);
        $this->assertEquals(15, $group->max_students);
        $this->assertTrue($group->is_active);
        $this->assertEquals('monthly', $group->payment_type);
        $this->assertEquals(150.00, $group->student_price);
    }
}
