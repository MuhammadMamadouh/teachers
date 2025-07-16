<?php

namespace App\Http\Controllers\Center;

use App\Http\Controllers\Controller;
use App\Models\Center;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class CenterDashboardController extends Controller
{
    /**
     * Display the center dashboard with full control panel.
     */
    public function index()
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized - Admin access required');
        }

        $center = $user->center;
        if (!$center) {
            return redirect()->route('center.setup');
        }

        // Get comprehensive center statistics
        $statistics = $this->getCenterStatistics($center);
        
        // Get all center users with their roles
        $users = $this->getCenterUsers($center);
        
        // Get all students with their groups
        $students = $this->getCenterStudents($center);
        
        // Get all groups with their students count
        $groups = $this->getCenterGroups($center);
        
        // Get subscription information
        $subscription = $center->activeSubscription;
        $subscriptionLimits = $this->getSubscriptionLimits($subscription);
        
        // Get available plans for upgrade
        $availablePlans = $this->getAvailablePlans($center->type);

        return Inertia::render('Center/Dashboard', [
            'center' => $center,
            'statistics' => $statistics,
            'users' => $users,
            'students' => $students,
            'groups' => $groups,
            'subscription' => $subscription,
            'subscriptionLimits' => $subscriptionLimits,
            'availablePlans' => $availablePlans,
            'roles' => Role::all(),
        ]);
    }

    /**
     * Get comprehensive center statistics.
     */
    private function getCenterStatistics(Center $center): array
    {
        return [
            'total_users' => $center->users()->count(),
            'admins_count' => $center->users()->role('admin')->count(),
            'teachers_count' => $center->users()->role('teacher')->count(),
            'assistants_count' => $center->users()->role('assistant')->count(),
            'students_count' => $center->students()->count(),
            'groups_count' => $center->groups()->count(),
            'active_groups_count' => $center->groups()->where('is_active', true)->count(),
            'recent_registrations' => $center->users()->where('created_at', '>=', now()->subDays(7))->count(),
            'monthly_growth' => $this->calculateMonthlyGrowth($center),
        ];
    }

    /**
     * Get all center users with roles and statistics.
     */
    private function getCenterUsers(Center $center)
    {
        return $center->users()
            ->with(['roles', 'students', 'groups'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'type' => $user->type,
                    'is_approved' => $user->is_approved,
                    'roles' => $user->roles->pluck('name'),
                    'students_count' => $user->students ? $user->students->count() : 0,
                    'groups_count' => $user->groups ? $user->groups->count() : 0,
                    'created_at' => $user->created_at,
                    'last_login' => $user->last_login_at,
                ];
            });
    }

    /**
     * Get all center students with their groups and teacher info.
     */
    private function getCenterStudents(Center $center)
    {
        return $center->students()
            ->with(['user', 'group', 'academicYear'])
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'phone' => $student->phone,
                    'guardian_phone' => $student->guardian_phone,
                    'teacher' => $student->user ? [
                        'id' => $student->user->id,
                        'name' => $student->user->name,
                    ] : null,
                    'group' => $student->group ? [
                        'id' => $student->group->id,
                        'name' => $student->group->name,
                    ] : null,
                    'academic_year' => $student->academicYear ? $student->academicYear->name : null,
                    'created_at' => $student->created_at,
                ];
            });
    }

    /**
     * Get all center groups with their statistics.
     */
    private function getCenterGroups(Center $center)
    {
        return $center->groups()
            ->with(['user', 'students', 'academicYear'])
            ->get()
            ->map(function ($group) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'subject' => $group->subject,
                    'teacher' => $group->user ? [
                        'id' => $group->user->id,
                        'name' => $group->user->name,
                    ] : null,
                    'students_count' => $group->students ? $group->students->count() : 0,
                    'academic_year' => $group->academicYear ? $group->academicYear->name : null,
                    'start_date' => $group->start_date,
                    'end_date' => $group->end_date,
                    'schedule' => $group->schedule,
                    'created_at' => $group->created_at,
                ];
            });
    }

    /**
     * Get subscription limits based on current plan.
     */
    private function getSubscriptionLimits(?Subscription $subscription): array
    {
        if (!$subscription || !$subscription->plan) {
            return [
                'max_students' => 10,
                'max_teachers' => 1,
                'max_assistants' => 0,
                'plan_type' => 'individual',
            ];
        }

        return [
            'max_students' => $subscription->plan->max_students,
            'max_teachers' => $subscription->plan->max_teachers,
            'max_assistants' => $subscription->plan->max_assistants,
            'plan_type' => $subscription->plan->plan_type,
            'current_students' => $subscription->center->students()->count(),
            'current_teachers' => $subscription->center->users()->role('teacher')->count(),
            'current_assistants' => $subscription->center->users()->role('assistant')->count(),
        ];
    }

    /**
     * Get available plans for upgrade based on center type.
     */
    private function getAvailablePlans(string $centerType)
    {
        $query = Plan::query();
        
        if ($centerType === 'individual') {
            // Individual centers can see both individual and multi-teacher plans
            $query->whereIn('plan_type', ['individual', 'multi_teacher']);
        } else {
            // Organization centers typically need multi-teacher plans
            $query->where('plan_type', 'multi_teacher');
        }
        
        return $query->orderBy('price')->get();
    }

    /**
     * Calculate monthly growth percentage.
     */
    private function calculateMonthlyGrowth(Center $center): float
    {
        $currentMonth = $center->students()->whereMonth('created_at', now()->month)->count();
        $previousMonth = $center->students()->whereMonth('created_at', now()->subMonth()->month)->count();
        
        if ($previousMonth === 0) {
            return $currentMonth > 0 ? 100 : 0;
        }
        
        return round((($currentMonth - $previousMonth) / $previousMonth) * 100, 2);
    }

    /**
     * Create a new user in the center.
     */
    public function createUser(Request $request)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'governorate_id' => 'nullable|integer',
            'role' => 'required|in:admin,teacher,assistant',
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        // Check subscription limits
        $center = $user->center;
        $subscription = $center->activeSubscription;
        
        if ($subscription) {
            $this->checkSubscriptionLimits($request->role, $center, $subscription);
        }

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'governorate_id' => $request->governorate_id,
            'password' => bcrypt('temporary123'),
            'center_id' => $user->center_id,
            'type' => $request->role,
            'teacher_id' => $request->teacher_id,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $newUser->assignRole($request->role);

        return redirect()->back()->with('success', 'User created successfully');
    }

    /**
     * Check subscription limits before creating users.
     */
    private function checkSubscriptionLimits(string $role, Center $center, Subscription $subscription)
    {
        switch ($role) {
            case 'teacher':
                $currentTeachers = $center->users()->role('teacher')->count();
                if ($currentTeachers >= $subscription->plan->max_teachers) {
                    throw new \Exception('Maximum number of teachers reached for current plan');
                }
                break;
                
            case 'assistant':
                $currentAssistants = $center->users()->role('assistant')->count();
                if ($currentAssistants >= $subscription->plan->max_assistants) {
                    throw new \Exception('Maximum number of assistants reached for current plan');
                }
                break;
        }
    }

    /**
     * Update user information.
     */
    public function updateUser(Request $request, User $userToUpdate)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin') || $user->center_id !== $userToUpdate->center_id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userToUpdate->id,
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'is_approved' => 'boolean',
        ]);

        $userToUpdate->update($request->only(['name', 'email', 'phone', 'subject', 'is_approved']));

        return redirect()->back()->with('success', 'User updated successfully');
    }

    /**
     * Delete a user from the center.
     */
    public function deleteUser(User $userToDelete)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin') || $user->center_id !== $userToDelete->center_id) {
            abort(403, 'Unauthorized');
        }

        if ($user->id === $userToDelete->id) {
            abort(403, 'Cannot delete yourself');
        }

        $userToDelete->delete();

        return redirect()->back()->with('success', 'User deleted successfully');
    }
}
