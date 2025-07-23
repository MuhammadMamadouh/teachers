<?php

namespace App\Http\Controllers;

use App\Models\Center;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class CenterController extends Controller
{
    /**
     * Display the center setup page for new users.
     */
    public function setup()
    {
        $user = Auth::user();
        
        if ($user->center_id) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Center/Setup');
    }

    /**
     * Store a new center for the user.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:individual,organization',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
        ]);

        $user = Auth::user();

        if ($user->center_id) {
            return redirect()->route('dashboard');
        }

        $center = Center::create([
            'name' => $request->name,
            'type' => $request->type,
            'address' => $request->address,
            'phone' => $request->phone,
            'email' => $request->email,
            'description' => $request->description,
            'owner_id' => $user->id,
        ]);

        // Update user with center_id
        $user->update(['center_id' => $center->id]);

        // Assign admin role to the center owner
        $user->assignRole('admin');
        
        // If individual center, also assign teacher role
        if ($request->type === 'individual') {
            $user->assignRole('teacher');
        }

        return redirect()->route('dashboard');
    }

    /**
     * Display the center dashboard.
     */
    public function dashboard(Request $request)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        $center = $user->center;

        if (!$center) {
            return redirect()->route('center.setup');
        }

        // For admins, redirect to the comprehensive center dashboard
        if ($userModel->hasRole('admin')) {
            return app(\App\Http\Controllers\Center\CenterDashboardController::class)->index($request);
        }

        // For non-admins, show a simplified view
        $subscriptionLimits = $userModel->getSubscriptionLimits();
        
        $data = [
            'center' => $center,
            'statistics' => [
                'total_users' => $center->users()->count(),
                'teachers_count' => $center->users()->role('teacher')->count(),
                'assistants_count' => $center->users()->role('assistant')->count(),
                'students_count' => $userModel->students()->count(),
                'groups_count' => $userModel->groups()->count(),
                'active_groups_count' => $userModel->groups()->count(),
                'recent_registrations' => 0,
                'monthly_growth' => 0,
            ],
            'users' => [],
            'students' => $userModel->students()->with('group')->paginate(20, ['*'], 'page', $request->get('page', 1)),
            'groups' => $userModel->groups()->with('students')->get(),
            'subscription' => $center->activeSubscription,
            'subscriptionLimits' => $subscriptionLimits,
            'availablePlans' => [],
            'roles' => [],
        ];

        return Inertia::render('Center/Dashboard', $data);
    }

    /**
     * Display center users management (admin only).
     */
    public function users()
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $center = $user->center;
        $users = $center->users()->with('roles')->get();

        return Inertia::render('Center/Users', [
            'center' => $center,
            'users' => $users,
            'roles' => Role::all(),
        ]);
    }

    /**
     * Invite a new user to the center.
     */
    public function inviteUser(Request $request)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:teacher,assistant',
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt('temporary123'), // Temporary password
            'center_id' => $user->center_id,
            'type' => $request->role,
            'teacher_id' => $request->teacher_id,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Assign role
        $newUser->assignRole($request->role);

        // TODO: Send invitation email to user

        return redirect()->back()->with('success', 'User invited successfully');
    }

    /**
     * Update center information.
     */
    public function update(Request $request, Center $center)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin') || $user->center_id !== $center->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
        ]);

        $center->update($request->only(['name', 'address', 'phone', 'email', 'description']));

        return redirect()->back()->with('success', 'Center updated successfully');
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
            'role' => 'required|in:teacher,assistant',
            'teacher_id' => 'nullable|exists:users,id',
        ]);

        // Check subscription limits
        $center = $user->center;
        $subscription = $center->activeSubscription;
        
        if ($request->role === 'assistant' && $subscription) {
            $currentAssistants = $center->assistants()->count();
            if ($currentAssistants >= $subscription->plan->max_assistants) {
                return redirect()->back()->withErrors(['role' => 'Maximum number of assistants reached for current plan']);
            }
        }

        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'governorate_id' => $request->governorate_id,
            'password' => bcrypt('temporary123'), // Temporary password
            'center_id' => $user->center_id,
            'type' => $request->role,
            'teacher_id' => $request->teacher_id,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Assign role
        $newUser->assignRole($request->role);

        return redirect()->back()->with('success', 'User created successfully');
    }

    /**
     * Delete a user from the center.
     */
    public function deleteUser(User $user)
    {
        $currentUser = Auth::user();
        $currentUserModel = User::find($currentUser->id);
        
        if (!$currentUserModel->hasRole('admin') || $currentUser->center_id !== $user->center_id) {
            abort(403, 'Unauthorized');
        }

        // Prevent admin from deleting themselves
        if ($currentUser->id === $user->id) {
            abort(403, 'Cannot delete yourself');
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully');
    }

    /**
     * Get center statistics.
     */
    public function statistics()
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $center = $user->center;
        
        $statistics = [
            'students_count' => $center->students()->count(),
            'groups_count' => $center->groups()->count(),
            'teachers_count' => $center->teachers()->count(),
            'assistants_count' => $center->assistants()->count(),
            'total_users' => $center->users()->count(),
        ];

        return response()->json($statistics);
    }
}
