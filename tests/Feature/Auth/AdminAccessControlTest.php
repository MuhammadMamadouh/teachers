<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\Center;
use App\Models\Plan;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AdminAccessControlTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    /** @test */
    public function center_admin_cannot_access_system_admin_routes()
    {
        // Create a center admin user
        $plan = Plan::factory()->create();
        $center = Center::factory()->create(['owner_id' => null]);
        $user = User::factory()->create([
            'center_id' => $center->id,
            'type' => 'center_owner',
            'is_admin' => true,
            'is_approved' => true,
        ]);
        
        // Assign center admin role
        $user->assignRole('center-admin');
        
        // Update center owner
        $center->update(['owner_id' => $user->id]);
        
        // Test that center admin cannot access system admin routes
        $response = $this->actingAs($user)->get('/admin/teachers');
        $response->assertStatus(403);
        
        // Test that center admin cannot access plan management
        $response = $this->actingAs($user)->get('/admin/plans');
        $response->assertStatus(403);
        
        // Test that center admin can access center admin routes
        $response = $this->actingAs($user)->get("/admin/centers/{$center->id}/dashboard");
        $response->assertStatus(200);
    }

    /** @test */
    public function system_admin_can_access_all_admin_routes()
    {
        // Create a system admin user
        $user = User::factory()->create([
            'is_admin' => true,
            'is_approved' => true,
        ]);
        
        // Assign system admin role
        $user->assignRole('system-admin');
        
        // Test that system admin can access system admin routes
        $response = $this->actingAs($user)->get('/admin/teachers');
        $response->assertStatus(200);
        
        // Test that system admin can access plan management
        $response = $this->actingAs($user)->get('/admin/plans');
        $response->assertStatus(200);
    }
}
