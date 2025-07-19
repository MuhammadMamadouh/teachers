<?php

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class RegistrationDebugTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_with_user_data()
    {
        // Create required governorate
        $governorate = \App\Models\Governorate::create([
            'name_ar' => 'الرياض',
            'name_en' => 'Riyadh',
            'code' => 'RYD',
            'is_active' => true,
        ]);

        // Create required plan
        $plan = \App\Models\Plan::create([
            'name' => 'Basic Plan',
            'price' => 100,
            'max_students' => 20,
            'max_assistants' => 2,
            'duration_days' => 30,
            'is_active' => true,
            'is_default' => true,
        ]);

        // Test with your exact data
        $response = $this->post('/register', [
            'name' => 'حسين السيد',
            'email' => 'hussain@gmail.com',
            'password' => '123456789',
            'password_confirmation' => '123456789',
            'phone' => '012708806636',
            'subject' => null,
            'governorate_id' => $governorate->id,
            'plan_id' => $plan->id,
            'center_name' => 'مركز الحاج ابو عدنان',
            'center_type' => 'organization',
            'center_address' => 'جنب البنزينة',
            'is_teacher' => false,
        ]);

        // Assert registration was successful
        $this->assertAuthenticated();
        $response->assertRedirect('/onboarding');

        // Check that user was created correctly
        $user = \App\Models\User::where('email', 'hussain@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('center_owner', $user->type);
        $this->assertFalse($user->is_teacher);
        $this->assertNull($user->subject);

        // Check that center was created
        $center = \App\Models\Center::where('name', 'مركز الحاج ابو عدنان')->first();
        $this->assertNotNull($center);
        $this->assertEquals('organization', $center->type);
        $this->assertEquals($user->id, $center->owner_id);

        echo "✅ Registration test passed! User created successfully.\n";
    }
}
