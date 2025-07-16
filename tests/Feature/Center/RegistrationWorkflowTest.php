<?php

namespace Tests\Feature\Center;

use App\Enums\CenterType;
use App\Models\Center;
use App\Models\Governorate;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RegistrationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create necessary roles
        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'teacher', 'guard_name' => 'web']);
        Role::firstOrCreate(['name' => 'assistant', 'guard_name' => 'web']);
        
        // Create a governorate for testing
        Governorate::firstOrCreate([
            'name_ar' => 'الرياض',
            'name_en' => 'Riyadh',
            'is_active' => true,
        ]);
    }

    /** @test */
    public function user_can_register_with_individual_center()
    {
        $response = $this->post('/register', [
            'name' => 'أحمد محمد',
            'email' => 'ahmed@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '0501234567',
            'subject' => 'الرياضيات',
            'governorate_id' => 1,
            'center_name' => 'مركز أحمد للرياضيات',
            'center_type' => CenterType::INDIVIDUAL->value,
            'center_address' => 'الرياض، المملكة العربية السعودية',
        ]);

        // Check user was created
        $this->assertDatabaseHas('users', [
            'email' => 'ahmed@example.com',
            'name' => 'أحمد محمد',
            'type' => 'teacher',
            'is_admin' => false,
        ]);

        // Check center was created
        $this->assertDatabaseHas('centers', [
            'name' => 'مركز أحمد للرياضيات',
            'type' => 'individual',
            'address' => 'الرياض، المملكة العربية السعودية',
        ]);

        // Check user is linked to center
        $user = User::where('email', 'ahmed@example.com')->first();
        $center = Center::where('name', 'مركز أحمد للرياضيات')->first();
        
        $this->assertNotNull($user, 'User should exist');
        $this->assertNotNull($center, 'Center should exist');
        
        $this->assertEquals($user->center_id, $center->id);
        $this->assertEquals($center->owner_id, $user->id);

        // Check roles assigned
        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->hasRole('teacher'));

        // Check subscription created
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'center_id' => $center->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function user_can_register_with_organization_center()
    {
        $response = $this->post('/register', [
            'name' => 'فاطمة أحمد',
            'email' => 'fatima@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '0507654321',
            'subject' => 'إدارة تعليمية',
            'governorate_id' => 1,
            'center_name' => 'مركز النور التعليمي',
            'center_type' => CenterType::ORGANIZATION->value,
            'center_address' => 'جدة، المملكة العربية السعودية',
        ]);

        // Check user was created
        $this->assertDatabaseHas('users', [
            'email' => 'fatima@example.com',
            'name' => 'فاطمة أحمد',
            'type' => 'teacher',
            'is_admin' => false,
        ]);

        // Check center was created
        $this->assertDatabaseHas('centers', [
            'name' => 'مركز النور التعليمي',
            'type' => 'organization',
            'address' => 'جدة، المملكة العربية السعودية',
        ]);

        // Check user is linked to center
        $user = User::where('email', 'fatima@example.com')->first();
        $center = Center::where('name', 'مركز النور التعليمي')->first();
        
        $this->assertEquals($user->center_id, $center->id);
        $this->assertEquals($center->owner_id, $user->id);

        // Check admin role assigned (not teacher for organization)
        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('teacher'));
    }

    /** @test */
    public function registration_requires_all_center_fields()
    {
        $response = $this->post('/register', [
            'name' => 'محمد علي',
            'email' => 'mohamed@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '0501234567',
            'subject' => 'الفيزياء',
            'governorate_id' => 1,
            // Missing center fields
        ]);

        $response->assertSessionHasErrors(['center_name', 'center_type']);
    }

    /** @test */
    public function user_cannot_register_with_duplicate_email()
    {
        // Create existing user
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->post('/register', [
            'name' => 'محمد علي',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '0501234567',
            'subject' => 'الفيزياء',
            'governorate_id' => 1,
            'center_name' => 'مركز محمد للفيزياء',
            'center_type' => 'individual',
        ]);

        $response->assertSessionHasErrors(['email']);
    }

    /** @test */
    public function registered_user_redirects_to_onboarding()
    {
        $response = $this->post('/register', [
            'name' => 'سارة أحمد',
            'email' => 'sara@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '0501234567',
            'subject' => 'الكيمياء',
            'governorate_id' => 1,
            'center_name' => 'مركز سارة للكيمياء',
            'center_type' => 'individual',
        ]);

        $response->assertRedirect(route('onboarding.show'));
    }
}
