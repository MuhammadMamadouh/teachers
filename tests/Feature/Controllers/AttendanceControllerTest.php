<?php

namespace Tests\Feature\Controllers;

use App\Models\AcademicYear;
use App\Models\Attendance;
use App\Models\Group;
use App\Models\Student;
use Tests\TestCase;

class AttendanceControllerTest extends TestCase
{
    public function test_teacher_can_view_attendance_index()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($teacher)->get(route('attendance.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Attendance/Index')
            ->has('groups')
        );
    }

    public function test_assistant_can_view_teachers_attendance()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($assistant)->get(route('attendance.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Attendance/Index')
            ->has('groups')
        );
    }

    public function test_teacher_can_mark_attendance()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $academicYear = AcademicYear::factory()->create();
        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
            'payment_type' => 'monthly',
        ]);

        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $attendanceData = [
            'group_id' => $group->id,
            'date' => now()->format('Y-m-d'),
            'attendances' => [
                [
                    'student_id' => $student->id,
                    'is_present' => true,
                    'notes' => 'Present and active',
                ],
            ],
        ];

        $response = $this->actingAs($teacher)
            ->post(route('attendance.store'), $attendanceData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('attendances', [
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_present' => true,
            'notes' => 'Present and active',
        ]);
    }

    public function test_attendance_creates_payment_for_per_session_group()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $academicYear = AcademicYear::factory()->create();
        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'academic_year_id' => $academicYear->id,
            'payment_type' => 'per_session',
            'student_price' => 100.00,
        ]);

        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
            'academic_year_id' => $academicYear->id,
        ]);

        $attendanceData = [
            'group_id' => $group->id,
            'date' => now()->format('Y-m-d'),
            'attendances' => [
                [
                    'student_id' => $student->id,
                    'is_present' => true,
                ],
            ],
        ];

        $response = $this->actingAs($teacher)
            ->post(route('attendance.store'), $attendanceData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Should create payment for per-session group
        $this->assertDatabaseHas('payments', [
            'student_id' => $student->id,
            'group_id' => $group->id,
            'amount' => 100.00,
            'payment_type' => 'per_session',
            'is_paid' => false,
        ]);
    }

    public function test_teacher_can_view_attendance_summary()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);
        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        // Create some attendance records
        Attendance::factory()->count(5)->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
        ]);

        $response = $this->actingAs($teacher)
            ->get(route('attendance.summary', $group));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Attendance/Summary')
            ->has('group')
            ->has('attendances')
            ->has('startDate')
            ->has('endDate')
        );
    }

    public function test_teacher_can_view_monthly_report()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($teacher)
            ->get(route('attendance.monthly-report', [
                'month' => now()->month,
                'year' => now()->year,
                'start_date' => now()->startOfMonth()->format('Y-m-d'),
                'end_date' => now()->endOfMonth()->format('Y-m-d'),
            ]));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Attendance/MonthlyReport')
            ->has('groups')
            ->has('startDate')
            ->has('endDate')
            ->has('month')
            ->has('year')
            ->has('monthName')
        );
    }

    public function test_teacher_can_view_last_month_report()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($teacher)
            ->get(route('attendance.last-month-report'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Attendance/LastMonthReport')
            ->has('groups')
            ->has('startDate')
            ->has('endDate')
            ->has('monthName')
        );
    }

    public function test_attendance_validation_rules()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        // Test missing group_id
        $response = $this->actingAs($teacher)
            ->post(route('attendance.store'), [
                'date' => now()->format('Y-m-d'),
                'attendances' => [],
            ]);
        $response->assertSessionHasErrors(['group_id']);

        // Test missing date
        $response = $this->actingAs($teacher)
            ->post(route('attendance.store'), [
                'group_id' => 1,
                'attendances' => [],
            ]);
        $response->assertSessionHasErrors(['date']);

        // Test invalid date format
        $response = $this->actingAs($teacher)
            ->post(route('attendance.store'), [
                'group_id' => 1,
                'date' => 'invalid-date',
                'attendances' => [],
            ]);
        $response->assertSessionHasErrors(['date']);
    }

    public function test_teacher_cannot_access_other_teachers_attendance()
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $this->createActiveSubscription($teacher1);
        $this->createActiveSubscription($teacher2);

        $group = Group::factory()->create(['user_id' => $teacher2->id]);

        $response = $this->actingAs($teacher1)
            ->get(route('attendance.summary', $group));

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_attendance()
    {
        $response = $this->get(route('attendance.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('attendance.store'), []);
        $response->assertRedirect(route('login'));
    }
}
