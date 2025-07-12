<?php

namespace Tests\Feature\Controllers;

use App\Models\Group;
use App\Models\Payment;
use App\Models\Student;
use Tests\TestCase;

class PaymentControllerTest extends TestCase
{
    public function test_teacher_can_view_payments_index()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($teacher)->get(route('payments.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Payments/Index')
            ->has('payments')
            ->has('groups')
            ->has('students')
        );
    }

    public function test_assistant_can_view_teachers_payments()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($assistant)->get(route('payments.index'));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Payments/Index')
            ->has('payments')
            ->has('groups')
            ->has('students')
        );
    }

    public function test_teacher_can_view_payment_show()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);
        $student = Student::factory()->create(['user_id' => $teacher->id]);

        $response = $this->actingAs($teacher)
            ->get(route('payments.show') . '?' . http_build_query([
                'group_id' => $group->id,
                'start_date' => now()->startOfMonth()->format('Y-m-d'),
                'end_date' => now()->endOfMonth()->format('Y-m-d'),
            ]));

        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Payments/Index')
            ->has('group')
            ->has('student_payments')
            ->has('summary')
            ->has('date_range')
        );
    }

    public function test_teacher_can_create_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create([
            'user_id' => $teacher->id,
            'payment_type' => 'monthly',
            'student_price' => 200.00,
        ]);
        $student = Student::factory()->create([
            'user_id' => $teacher->id,
            'group_id' => $group->id,
        ]);

        $paymentData = [
            'student_id' => $student->id,
            'group_id' => $group->id,
            'amount' => 200.00,
            'payment_type' => 'monthly',
            'related_date' => now()->format('Y-m-d'),
            'notes' => 'Monthly payment for group',
        ];

        $response = $this->actingAs($teacher)
            ->post(route('payments.store'), $paymentData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('payments', [
            'student_id' => $student->id,
            'group_id' => $group->id,
            'amount' => 200.00,
            'payment_type' => 'monthly',
            'notes' => 'Monthly payment for group',
        ]);
    }

    public function test_teacher_can_update_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
            'is_paid' => false,
        ]);

        $updateData = [
            'is_paid' => true,
            'paid_at' => now()->format('Y-m-d H:i:s'),
            'notes' => 'Payment received in cash',
        ];

        $response = $this->actingAs($teacher)
            ->patch(route('payments.update', $payment), $updateData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $payment->refresh();
        $this->assertTrue($payment->is_paid);
        $this->assertEquals('Payment received in cash', $payment->notes);
    }

    public function test_teacher_can_bulk_update_payments()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);
        $student1 = Student::factory()->create(['user_id' => $teacher->id]);
        $student2 = Student::factory()->create(['user_id' => $teacher->id]);

        $payment1 = Payment::factory()->create([
            'student_id' => $student1->id,
            'group_id' => $group->id,
            'is_paid' => false,
        ]);
        $payment2 = Payment::factory()->create([
            'student_id' => $student2->id,
            'group_id' => $group->id,
            'is_paid' => false,
        ]);

        $bulkData = [
            'payment_ids' => [$payment1->id, $payment2->id],
            'is_paid' => true,
            'paid_at' => now()->format('Y-m-d H:i:s'),
        ];

        $response = $this->actingAs($teacher)
            ->post(route('payments.bulk-update'), [
                'payments' => [
                    ['id' => $payment1->id, 'is_paid' => true],
                    ['id' => $payment2->id, 'is_paid' => true],
                ],
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $payment1->refresh();
        $payment2->refresh();
        $this->assertTrue($payment1->is_paid);
        $this->assertTrue($payment2->is_paid);
    }

    public function test_teacher_can_delete_payment()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $group = Group::factory()->create(['user_id' => $teacher->id]);
        $student = Student::factory()->create(['user_id' => $teacher->id]);
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
        ]);

        $response = $this->actingAs($teacher)
            ->delete(route('payments.destroy', $payment));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('payments', ['id' => $payment->id]);
    }

    public function test_payment_validation_rules()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        // Test missing required fields
        $response = $this->actingAs($teacher)
            ->post(route('payments.store'), []);
        $response->assertSessionHasErrors(['student_id', 'group_id', 'amount']);

        // Test invalid amount
        $response = $this->actingAs($teacher)
            ->post(route('payments.store'), [
                'student_id' => 1,
                'group_id' => 1,
                'amount' => -100,
                'payment_type' => 'monthly',
            ]);
        $response->assertSessionHasErrors(['amount']);

        // Test invalid payment type
        $response = $this->actingAs($teacher)
            ->post(route('payments.store'), [
                'student_id' => 1,
                'group_id' => 1,
                'amount' => 100,
                'payment_type' => 'invalid_type',
            ]);
        $response->assertSessionHasErrors(['payment_type']);
    }

    public function test_bulk_update_validation_rules()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        // Test missing payments
        $response = $this->actingAs($teacher)
            ->post(route('payments.bulk-update'), [
                'is_paid' => true,
            ]);
        $response->assertSessionHasErrors(['payments']);

        // Test empty payments array
        $response = $this->actingAs($teacher)
            ->post(route('payments.bulk-update'), [
                'payments' => [],
            ]);
        $response->assertSessionHasErrors(['payments']);

        // Test invalid payments structure
        $response = $this->actingAs($teacher)
            ->post(route('payments.bulk-update'), [
                'payments' => [
                    ['id' => 'invalid', 'is_paid' => true],
                ],
            ]);
        $response->assertSessionHasErrors(['payments.0.id']);
    }

    public function test_teacher_cannot_access_other_teachers_payments()
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $this->createActiveSubscription($teacher1);
        $this->createActiveSubscription($teacher2);

        $group = Group::factory()->create(['user_id' => $teacher2->id]);
        $student = Student::factory()->create(['user_id' => $teacher2->id]);
        $payment = Payment::factory()->create([
            'student_id' => $student->id,
            'group_id' => $group->id,
        ]);

        $response = $this->actingAs($teacher1)
            ->patch(route('payments.update', $payment), ['is_paid' => true]);

        $response->assertForbidden();
    }

    public function test_unauthenticated_user_cannot_access_payments()
    {
        $response = $this->get(route('payments.index'));
        $response->assertRedirect(route('login'));

        $response = $this->post(route('payments.store'), []);
        $response->assertRedirect(route('login'));
    }
}
