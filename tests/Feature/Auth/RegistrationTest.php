<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        // Create a governorate for the test
        $governorate = \App\Models\Governorate::create([
            'name_ar' => 'الرياض',
            'name_en' => 'Riyadh',
            'code' => 'RYD',
            'is_active' => true,
        ]);

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'phone' => '0501234567',
            'subject' => 'الرياضيات',
            'governorate_id' => $governorate->id,
        ]);

        // After registration, the user should be authenticated
        $this->assertAuthenticated();

        // Since new users need approval and subscription, they won't go to dashboard
        // Instead they'll be redirected to approval or subscription page
        $response->assertRedirect();
    }
}
