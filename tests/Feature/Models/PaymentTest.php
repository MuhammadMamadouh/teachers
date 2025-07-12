<?php

namespace Tests\Feature\Models;

use App\Models\Attendance;
use App\Models\Group;
use App\Models\Payment;
use App\Models\Student;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    public function test_payment_belongs_to_student()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
        ]);

        $this->assertInstanceOf(Student::class, $payment->student);
        $this->assertEquals($student->id, $payment->student->id);
    }

    public function test_payment_belongs_to_group()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
        ]);

        $this->assertInstanceOf(Group::class, $payment->group);
        $this->assertEquals($group->id, $payment->group->id);
    }

    public function test_payment_belongs_to_attendance()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $attendance = Attendance::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'date' => '2025-07-12',
        ]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'related_date' => '2025-07-12',
        ]);

        $this->assertInstanceOf(Attendance::class, $payment->attendance);
    }

    public function test_get_formatted_date_attribute_for_monthly_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'payment_type' => 'monthly',
            'related_date' => '2025-07-12',
        ]);

        $this->assertEquals('July 2025', $payment->getFormattedDateAttribute());
    }

    public function test_get_formatted_date_attribute_for_per_session_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'payment_type' => 'per_session',
            'related_date' => '2025-07-12',
        ]);

        $this->assertEquals('12/07/2025', $payment->getFormattedDateAttribute());
    }

    public function test_get_payment_type_label_for_monthly()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'payment_type' => 'monthly',
        ]);

        $this->assertEquals('شهري', $payment->getPaymentTypeLabel());
    }

    public function test_get_payment_type_label_for_per_session()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'payment_type' => 'per_session',
        ]);

        $this->assertEquals('بالجلسة', $payment->getPaymentTypeLabel());
    }

    public function test_is_overdue_returns_false_for_paid_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_paid' => true,
            'payment_type' => 'monthly',
            'related_date' => now()->subMonth(),
        ]);

        $this->assertFalse($payment->isOverdue());
    }

    public function test_is_overdue_returns_true_for_overdue_monthly_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_paid' => false,
            'payment_type' => 'monthly',
            'related_date' => now()->subMonth(),
        ]);

        $this->assertTrue($payment->isOverdue());
    }

    public function test_is_overdue_returns_false_for_current_monthly_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_paid' => false,
            'payment_type' => 'monthly',
            'related_date' => now(),
        ]);

        $this->assertFalse($payment->isOverdue());
    }

    public function test_is_overdue_returns_true_for_overdue_per_session_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_paid' => false,
            'payment_type' => 'per_session',
            'related_date' => now()->subDays(10),
        ]);

        $this->assertTrue($payment->isOverdue());
    }

    public function test_is_overdue_returns_false_for_recent_per_session_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_paid' => false,
            'payment_type' => 'per_session',
            'related_date' => now()->subDays(5),
        ]);

        $this->assertFalse($payment->isOverdue());
    }

    public function test_payment_casts_are_applied_correctly()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $group = Group::factory()->create(['user_id' => $teacher->id]);
        
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_paid' => 1,
            'amount' => 100.5,
            'related_date' => '2025-07-12',
            'paid_at' => '2025-07-12 10:00:00',
        ]);

        $this->assertIsBool($payment->is_paid);
        $this->assertEquals(100.5, $payment->amount);
        $this->assertInstanceOf(\Carbon\Carbon::class, $payment->related_date);
        $this->assertInstanceOf(\Carbon\Carbon::class, $payment->paid_at);
    }
}
