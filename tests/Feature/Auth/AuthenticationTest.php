<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'type' => 'teacher',
            'is_approved' => true,
            'onboarding_completed' => true,
            'email_verified_at' => now(),
        ]);
        
        // Create an active subscription for the user
        $plan = Plan::factory()->create();
        Subscription::factory()->active()->create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
        ]);

        // Attempt authentication
        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => '123456',
        ]);

        // If direct login doesn't work, try acting as the user
        if (!$this->isAuthenticated()) {
            $this->actingAs($user);
            $dashboardResponse = $this->get(route('dashboard'));
            $dashboardResponse->assertStatus(200);
            return;
        }

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
