<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;

class AdminControllerTest extends TestCase
{
    public function test_admin_can_view_unapproved_users()
    {
        $admin = $this->createAdmin();
        $unapprovedUser = $this->createTeacher(['is_approved' => false]);
        $approvedUser = $this->createTeacher(['is_approved' => true]);

        $response = $this->actingAs($admin)->get(route('admin.users'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/UserApproval')
            ->has('unapprovedUsers', 1)
            ->where('unapprovedUsers.0.id', $unapprovedUser->id)
        );
    }

    public function test_non_admin_cannot_view_admin_page()
    {
        $teacher = $this->createTeacher();

        $response = $this->actingAs($teacher)->get(route('admin.users'));

        $response->assertForbidden();
    }

    public function test_admin_can_approve_user()
    {
        $admin = $this->createAdmin();
        $unapprovedUser = $this->createTeacher(['is_approved' => false]);

        $response = $this->actingAs($admin)
            ->post(route('admin.users.approve', $unapprovedUser));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'تم الموافقة على المستخدم بنجاح!');

        $unapprovedUser->refresh();
        $this->assertTrue($unapprovedUser->is_approved);
        $this->assertNotNull($unapprovedUser->approved_at);
    }

    public function test_approving_user_creates_default_subscription()
    {
        $admin = $this->createAdmin();
        $unapprovedUser = $this->createTeacher(['is_approved' => false]);

        $this->actingAs($admin)
            ->post(route('admin.users.approve', $unapprovedUser));

        $unapprovedUser->refresh();
        $this->assertTrue($unapprovedUser->subscriptions()->exists());

        $subscription = $unapprovedUser->subscriptions()->first();
        $this->assertEquals(5, $subscription->max_students);
        $this->assertTrue($subscription->is_active);
        $this->assertNull($subscription->end_date);
    }

    public function test_approving_user_with_existing_subscription_does_not_create_new_one()
    {
        $admin = $this->createAdmin();
        $unapprovedUser = $this->createTeacher(['is_approved' => false]);
        $this->createSubscription($unapprovedUser);

        $this->actingAs($admin)
            ->post(route('admin.users.approve', $unapprovedUser));

        $this->assertEquals(1, $unapprovedUser->subscriptions()->count());
    }

    public function test_non_admin_cannot_approve_user()
    {
        $teacher = $this->createTeacher();
        $unapprovedUser = $this->createTeacher(['is_approved' => false]);

        $response = $this->actingAs($teacher)
            ->post(route('admin.users.approve', $unapprovedUser));

        $response->assertForbidden();
    }

    public function test_admin_can_reject_user()
    {
        $admin = $this->createAdmin();
        $unapprovedUser = $this->createTeacher(['is_approved' => false]);
        $userId = $unapprovedUser->id;

        $response = $this->actingAs($admin)
            ->delete(route('admin.users.reject', $unapprovedUser));

        $response->assertRedirect();
        $response->assertSessionHas('success', 'تم رفض وحذف المستخدم بنجاح!');

        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_non_admin_cannot_reject_user()
    {
        $teacher = $this->createTeacher();
        $unapprovedUser = $this->createTeacher(['is_approved' => false]);

        $response = $this->actingAs($teacher)
            ->delete(route('admin.users.reject', $unapprovedUser));

        $response->assertForbidden();
    }
}
