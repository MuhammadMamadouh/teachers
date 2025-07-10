<?php

namespace Tests\Feature\Middleware;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnsureUserIsApprovedTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_passes_through()
    {
        $admin = $this->createAdmin();
        $this->actingAs($admin);

        $response = $this->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_approved_teacher_passes_through()
    {
        $teacher = $this->createTeacher([
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);
        $this->createActiveSubscription($teacher);
        $this->actingAs($teacher);

        $response = $this->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_unapproved_teacher_redirects()
    {
        $teacher = $this->createTeacher(['is_approved' => false]);
        $this->actingAs($teacher);

        $response = $this->get('/dashboard');

        $response->assertRedirect(route('pending-approval'));
    }

    public function test_assistant_with_approved_teacher_passes_through()
    {
        $teacher = $this->createTeacher([
            'is_approved' => true,
            'onboarding_completed' => true,
        ]);
        $this->createActiveSubscription($teacher);
        $assistant = $this->createAssistant($teacher, [
            'onboarding_completed' => true,
        ]);
        $this->actingAs($assistant);

        $response = $this->get('/dashboard');

        $response->assertStatus(200);
    }

    public function test_assistant_with_unapproved_teacher_redirects()
    {
        $teacher = $this->createTeacher(['is_approved' => false]);
        $assistant = $this->createAssistant($teacher);
        $this->actingAs($assistant);

        $response = $this->get('/dashboard');

        $response->assertRedirect(route('pending-approval'));
    }

    public function test_assistant_without_teacher_redirects()
    {
        $assistant = User::factory()->assistant()->create([
            'teacher_id' => null,
            'onboarding_completed' => true,
        ]);
        $this->actingAs($assistant);

        $response = $this->get('/dashboard');

        $response->assertRedirect(route('onboarding.show'));
    }

    public function test_unauthenticated_user_passes_through()
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect(route('login'));
    }
}
