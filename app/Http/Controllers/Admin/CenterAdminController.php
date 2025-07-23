<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Center;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\Subscription;
use App\Models\Plan;
use App\Models\Attendance;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class CenterAdminController extends Controller
{
    /**
     * Display the admin dashboard with full center management capabilities.
     */
    public function dashboard()
    {
        $user = Auth::user();
        $center = $user->center;
        
        if (!$center) {
            return redirect()->route('center.setup');
        }

        $statistics = $this->getAdminStatistics($center);
        $recentActivity = $this->getRecentActivity($center);
        $subscriptionInfo = $this->getSubscriptionInfo($center);
        
        return Inertia::render('Admin/Dashboard', [
            'center' => $center,
            'statistics' => $statistics,
            'recentActivity' => $recentActivity,
            'subscriptionInfo' => $subscriptionInfo,
        ]);
    }

    /**
     * Manage all users in the center (teachers and assistants).
     */
    public function manageUsers()
    {
        $user = Auth::user();
        $center = $user->center;
        
        $users = $center->users()
            ->with(['roles', 'teacher', 'assistants'])
            ->where('id', '!=', $user->id) // Exclude the admin themselves
            ->get();

        $subscriptionLimits = $this->getSubscriptionLimits($center);
        $availableTeachers = $center->users()
            ->whereHas('roles', function ($query) {
                $query->where('name', 'teacher');
            })
            ->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'center' => $center,
            'subscriptionLimits' => $subscriptionLimits,
            'availableTeachers' => $availableTeachers,
        ]);
    }

    /**
     * Create a new user (teacher or assistant) with full admin privileges.
     */
    public function createUser(Request $request, Center $center)
    {
        $user = Auth::user();
        
        if ($user->center_id !== $center->id) {
            abort(403, 'Unauthorized');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'role' => 'required|in:teacher,assistant',
            'teacher_id' => 'nullable|exists:users,id',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $this->checkSubscriptionLimits($request->role, $center);

        $defaultPassword = $this->generateDefaultPassword();

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($defaultPassword),
            'phone' => $request->phone,
            'subject' => $request->subject,
            'center_id' => $center->id,
            'type' => $request->role,
            'teacher_id' => $request->teacher_id,
            'is_approved' => true,
            'is_active' => true,
        ]);

        // Assign role
        $newUser->assignRole($request->role);

        // Assign permissions if provided
        if ($request->permissions) {
            $newUser->syncPermissions($request->permissions);
        }

        // Send welcome email with credentials
        // Mail::to($newUser->email)->send(new WelcomeUserMail($newUser, $defaultPassword));

        return redirect()->back()->with('success', 'User created successfully.');
    }

    /**
     * Update user information and permissions.
     */
    public function updateUser(Request $request, Center $center, User $userToUpdate)
    {
        $user = Auth::user();
        
        if ($user->center_id !== $center->id || $user->center_id !== $userToUpdate->center_id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userToUpdate->id,
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string|exists:permissions,name',
            'is_active' => 'boolean',
        ]);

        $userToUpdate->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'is_active' => $request->is_active,
        ]);

        // Update permissions if provided
        if ($request->permissions) {
            $userToUpdate->syncPermissions($request->permissions);
        }

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Delete a user (teacher or assistant) from the center.
     */
    public function deleteUser(Center $center, User $userToDelete)
    {
        $user = Auth::user();
        
        if ($user->center_id !== $center->id || $user->center_id !== $userToDelete->center_id) {
            abort(403, 'Unauthorized');
        }

        // Prevent admin from deleting themselves
        if ($user->id === $userToDelete->id) {
            abort(403, 'Cannot delete yourself');
        }

        $userToDelete->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Check subscription limits before creating users.
     */
    private function checkSubscriptionLimits(string $role, Center $center)
    {
        $subscription = $center->activeSubscription;
        if (!$subscription) {
            throw new \Exception('No active subscription found');
        }

        $limits = $this->getSubscriptionLimits($center);

        switch ($role) {
            case 'teacher':
                if ($limits['current_teachers'] >= $limits['max_teachers']) {
                    throw new \Exception('Maximum number of teachers reached for current plan. Please upgrade your subscription.');
                }
                break;
            case 'assistant':
                if ($limits['current_assistants'] >= $limits['max_assistants']) {
                    throw new \Exception('Maximum number of assistants reached for current plan. Please upgrade your subscription.');
                }
                break;
        }
    }

    /**
     * Get subscription limits for the center.
     */
    private function getSubscriptionLimits(Center $center)
    {
        $subscription = $center->activeSubscription;
        if (!$subscription) {
            return [
                'current_teachers' => 0,
                'max_teachers' => 0,
                'current_assistants' => 0,
                'max_assistants' => 0,
                'current_students' => 0,
                'max_students' => 0,
            ];
        }

        return [
            'current_teachers' => $center->users()->where('type', 'teacher')->count(),
            'max_teachers' => $subscription->plan->max_teachers ?? 0,
            'current_assistants' => $center->users()->where('type', 'assistant')->count(),
            'max_assistants' => $subscription->plan->max_assistants ?? 0,
            'current_students' => $center->students()->count(),
            'max_students' => $subscription->plan->max_students ?? 0,
        ];
    }

    /**
     * Generate a default password for new users.
     */
    private function generateDefaultPassword()
    {
        return 'Password123!';
    }

    /**
     * Get admin statistics for the center.
     */
    private function getAdminStatistics(Center $center)
    {
        return [
            'total_students' => $center->students()->count(),
            'total_teachers' => $center->users()->where('type', 'teacher')->count(),
            'total_assistants' => $center->users()->where('type', 'assistant')->count(),
            'active_groups' => $center->groups()->count(),
            'this_month_payments' => $center->payments()->whereMonth('created_at', now()->month)->sum('amount'),
            'pending_payments' => $center->payments()->where('status', 'pending')->count(),
        ];
    }

    /**
     * Get recent activity for the center.
     */
    private function getRecentActivity(Center $center)
    {
        return [
            // This would be populated with actual activity data
            // For now, returning empty array
        ];
    }

    /**
     * Get subscription information for the center.
     */
    private function getSubscriptionInfo(Center $center)
    {
        $subscription = $center->activeSubscription;
        if (!$subscription) {
            return null;
        }

        return [
            'plan_name' => $subscription->plan->name,
            'expires_at' => $subscription->end_date,
            'days_remaining' => $subscription->end_date->diffInDays(now()),
            'limits' => $this->getSubscriptionLimits($center),
        ];
    }
}
