<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Models\Center;
use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CenterAdminControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a plan
        $this->plan = Plan::factory()->create([
            'max_teachers' => 5,
            'max_assistants' => 10,
            'max_students' => 100,
        ]);
        
        // Create a center
        $this->center = Center::factory()->create();
        
        // Create an active subscription
        $this->subscription = Subscription::factory()->create([
            'user_id' => $this->center->owner_id ?? 1,
            'plan_id' => $this->plan->id,
            'center_id' => $this->center->id,
            'is_active' => true,
            'start_date' => now(),
            'end_date' => now()->addDays(30),
        ]);
        
        // Create an admin user
        $this->admin = User::factory()->create([
            'center_id' => $this->center->id,
            'is_admin' => true,
            'is_approved' => true,
            'is_active' => true,
        ]);
        
        // Create a regular teacher user
        $this->teacher = User::factory()->create([
            'center_id' => $this->center->id,
            'type' => 'teacher',
            'is_approved' => true,
            'is_active' => true,
        ]);
    }

    public function test_admin_can_access_dashboard()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.centers.dashboard', $this->center));

        $response->assertStatus(200);
    }

    public function test_admin_can_access_user_management()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.centers.users', $this->center));

        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('Admin/Users/Index')
            ->has('users')
            ->has('center')
            ->has('subscriptionLimits')
            ->has('availableTeachers')
        );
    }

    public function test_admin_can_create_new_user()
    {
        $userData = [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'subject' => 'Mathematics',
            'role' => 'teacher',
            'permissions' => ['view own students', 'create students'],
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.centers.users.store', $this->center), $userData);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'name' => $userData['name'],
            'email' => $userData['email'],
            'center_id' => $this->center->id,
        ]);
    }

    public function test_admin_can_update_user()
    {
        $updateData = [
            'name' => 'Updated Name',
            'email' => $this->teacher->email,
            'phone' => '123-456-7890',
            'subject' => 'Physics',
            'permissions' => ['view own students'],
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.centers.users.update', [$this->center, $this->teacher]), $updateData);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $this->teacher->id,
            'name' => 'Updated Name',
            'phone' => '123-456-7890',
            'subject' => 'Physics',
        ]);
    }

    public function test_admin_can_delete_user()
    {
        $response = $this->actingAs($this->admin)
            ->delete(route('admin.centers.users.destroy', [$this->center, $this->teacher]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('users', [
            'id' => $this->teacher->id,
        ]);
    }

    public function test_admin_cannot_delete_themselves()
    {
        $response = $this->actingAs($this->admin)
            ->delete(route('admin.centers.users.destroy', [$this->center, $this->admin]));

        $response->assertStatus(403);
        $this->assertDatabaseHas('users', [
            'id' => $this->admin->id,
        ]);
    }

    public function test_non_admin_cannot_access_admin_routes()
    {
        $response = $this->actingAs($this->teacher)
            ->get(route('admin.centers.dashboard', $this->center));

        $response->assertStatus(403);
    }

    public function test_admin_cannot_manage_users_from_different_center()
    {
        $otherCenter = Center::factory()->create();
        $otherUser = User::factory()->create([
            'center_id' => $otherCenter->id,
            'type' => 'teacher',
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.centers.users.update', [$this->center, $otherUser]), [
                'name' => 'Should not work',
                'email' => $otherUser->email,
            ]);

        $response->assertStatus(403);
    }
}
