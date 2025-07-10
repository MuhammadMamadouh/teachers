<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\AcademicYear;

class AssistantControllerTest extends TestCase
{
    public function test_teacher_can_view_assistants_index()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 3]);
        $this->createActiveSubscription($teacher, $plan);

        // Create some assistants
        $this->createAssistant($teacher);
        $this->createAssistant($teacher);

        $response = $this->actingAs($teacher)->get(route('assistants.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Assistants/Index')
            ->has('assistants', 2)
            ->where('canAddMore', true)
            ->where('maxAssistants', 3)
        );
    }

    public function test_assistant_cannot_view_assistants_index()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $response = $this->actingAs($assistant)->get(route('assistants.index'));

        $response->assertForbidden();
    }

    public function test_teacher_can_create_assistant()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 3]);
        $this->createActiveSubscription($teacher, $plan);

        $assistantData = [
            'name' => 'مساعد المعلم',
            'email' => 'assistant@example.com',
            'phone' => '0501234567',
            'subject' => 'الرياضيات',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->actingAs($teacher)
            ->post(route('assistants.store'), $assistantData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'teacher_id' => $teacher->id,
            'name' => 'مساعد المعلم',
            'email' => 'assistant@example.com',
            'type' => 'assistant',
        ]);
    }

    public function test_cannot_create_assistant_when_limit_reached()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 1]);
        $this->createActiveSubscription($teacher, $plan);

        // Create assistant up to limit
        $this->createAssistant($teacher);

        $assistantData = [
            'name' => 'مساعد آخر',
            'email' => 'assistant2@example.com',
            'phone' => '0501234568',
            'subject' => 'الرياضيات',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->actingAs($teacher)
            ->post(route('assistants.store'), $assistantData);

        $response->assertRedirect();
        $response->assertSessionHasErrors(['limit']);
    }

    public function test_teacher_can_update_assistant()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $assistant = $this->createAssistant($teacher);

        $updateData = [
            'name' => 'مساعد محدث',
            'email' => $assistant->email,
            'phone' => '0509876543',
            'notes' => 'ملاحظات جديدة',
        ];

        $response = $this->actingAs($teacher)
            ->put(route('assistants.update', $assistant), $updateData);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $assistant->refresh();
        $this->assertEquals('مساعد محدث', $assistant->name);
        $this->assertEquals('0509876543', $assistant->phone);
        $this->assertEquals('ملاحظات جديدة', $assistant->notes);
    }

    public function test_teacher_can_delete_assistant()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $assistant = $this->createAssistant($teacher);

        $response = $this->actingAs($teacher)
            ->delete(route('assistants.destroy', $assistant));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        // Assistant should be deleted from database
        $this->assertDatabaseMissing('users', ['id' => $assistant->id]);
    }

    public function test_teacher_cannot_access_other_teachers_assistants()
    {
        $teacher1 = $this->createTeacher();
        $teacher2 = $this->createTeacher();
        $this->createActiveSubscription($teacher1);
        $this->createActiveSubscription($teacher2);

        $assistant = $this->createAssistant($teacher2);

        $response = $this->actingAs($teacher1)
            ->get(route('assistants.edit', $assistant));

        $response->assertForbidden();
    }

    public function test_teacher_can_resend_invitation()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);
        
        $assistant = $this->createAssistant($teacher, [
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($teacher)
            ->post(route('assistants.resend-invitation', $assistant));

        $response->assertRedirect();
        $response->assertSessionHas('success');
    }

    public function test_admin_cannot_create_assistant()
    {
        $admin = $this->createAdmin();

        $assistantData = [
            'name' => 'مساعد المعلم',
            'email' => 'assistant@example.com',
            'phone' => '0501234567',
            'subject' => 'الرياضيات',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ];

        $response = $this->actingAs($admin)
            ->post(route('assistants.store'), $assistantData);

        $response->assertForbidden();
    }

    public function test_assistant_validation_rules()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 3]);
        $this->createActiveSubscription($teacher, $plan);

        // Test empty name
        $response = $this->actingAs($teacher)
            ->post(route('assistants.store'), ['name' => '']);
        $response->assertSessionHasErrors(['name']);

        // Test invalid email
        $response = $this->actingAs($teacher)
            ->post(route('assistants.store'), [
                'name' => 'مساعد المعلم',
                'email' => 'invalid-email',
            ]);
        $response->assertSessionHasErrors(['email']);

        // Test duplicate email
        $existingUser = $this->createTeacher(['email' => 'existing@example.com']);

        $response = $this->actingAs($teacher)
            ->post(route('assistants.store'), [
                'name' => 'مساعد المعلم',
                'email' => 'existing@example.com',
                'phone' => '0501234567',
            ]);
        $response->assertSessionHasErrors(['email']);
    }
}
