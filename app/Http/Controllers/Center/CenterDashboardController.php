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
        
        // Get all teachers for dropdowns
        $teachers = $this->getCenterTeachers($center);
        
        // Get all students with their groups
        $students = $this->getCenterStudents($center);
        
        // Get all groups with their students count
        $groups = $this->getCenterGroups($center);
        
        // Get subscription information
        $subscription = $center->activeSubscription;
        $subscriptionLimits = $this->getSubscriptionLimits($subscription);
        
        // Get available plans for upgrade
        $availablePlans = $this->getAvailablePlans($center->type);

        return Inertia::render('Center/Management', [
            'center' => $center,
            'statistics' => $statistics,
            'users' => $users,
            'teachers' => $teachers,
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
                    'subject' => $user->subject,
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
     * Get all center teachers for dropdowns.
     */
    private function getCenterTeachers(Center $center)
    {
        return $center->users()
            ->whereHas('roles', function ($query) {
                $query->where('name', 'teacher');
            })
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'subject' => $user->subject,
                    'students_count' => $user->students ? $user->students->count() : 0,
                    'groups_count' => $user->groups ? $user->groups->count() : 0,
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
                    'level' => $student->level,
                    'teacher' => $student->user ? [
                        'id' => $student->user->id,
                        'name' => $student->user->name,
                        'subject' => $student->user->subject,
                    ] : null,
                    'group' => $student->group ? [
                        'id' => $student->group->id,
                        'name' => $student->group->name,
                        'subject' => $student->group->subject,
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
                    'level' => $group->level,
                    'max_students' => $group->max_students,
                    'student_price' => $group->student_price,
                    'payment_type' => $group->payment_type,
                    'is_active' => $group->is_active,
                    'teacher' => $group->user ? [
                        'id' => $group->user->id,
                        'name' => $group->user->name,
                        'subject' => $group->user->subject,
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

    /**
     * Create a new student in the center.
     */
    public function createStudent(Request $request)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'guardian_phone' => 'nullable|string|max:20',
            'level' => 'nullable|string|max:50',
            'teacher_id' => 'required|exists:users,id',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        // Check if teacher belongs to the same center
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->center_id !== $user->center_id) {
            abort(403, 'Invalid teacher selected');
        }

        // Check subscription limits
        $center = $user->center;
        $subscription = $center->activeSubscription;
        
        if ($subscription) {
            $currentStudents = $center->students()->count();
            if ($currentStudents >= $subscription->plan->max_students) {
                throw new \Exception('Maximum number of students reached for current plan');
            }
        }

        $student = Student::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'guardian_phone' => $request->guardian_phone,
            'level' => $request->level,
            'user_id' => $request->teacher_id,
            'group_id' => $request->group_id,
            'center_id' => $user->center_id,
        ]);

        return redirect()->back()->with('success', 'Student created successfully');
    }

    /**
     * Update student information.
     */
    public function updateStudent(Request $request, Student $student)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin') || $user->center_id !== $student->center_id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'guardian_phone' => 'nullable|string|max:20',
            'level' => 'nullable|string|max:50',
            'teacher_id' => 'required|exists:users,id',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        // Check if teacher belongs to the same center
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->center_id !== $user->center_id) {
            abort(403, 'Invalid teacher selected');
        }

        $student->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'guardian_phone' => $request->guardian_phone,
            'level' => $request->level,
            'user_id' => $request->teacher_id,
            'group_id' => $request->group_id,
        ]);

        return redirect()->back()->with('success', 'Student updated successfully');
    }

    /**
     * Delete a student from the center.
     */
    public function deleteStudent(Student $student)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin') || $user->center_id !== $student->center_id) {
            abort(403, 'Unauthorized');
        }

        $student->delete();

        return redirect()->back()->with('success', 'Student deleted successfully');
    }

    /**
     * Create a new group in the center.
     */
    public function createGroup(Request $request)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'level' => 'nullable|string|max:50',
            'teacher_id' => 'required|exists:users,id',
            'max_students' => 'required|integer|min:1|max:100',
            'student_price' => 'required|numeric|min:0',
            'payment_type' => 'required|in:monthly,session',
        ]);

        // Check if teacher belongs to the same center
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->center_id !== $user->center_id) {
            abort(403, 'Invalid teacher selected');
        }

        $group = Group::create([
            'name' => $request->name,
            'subject' => $request->subject,
            'level' => $request->level,
            'user_id' => $request->teacher_id,
            'center_id' => $user->center_id,
            'max_students' => $request->max_students,
            'student_price' => $request->student_price,
            'payment_type' => $request->payment_type,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Group created successfully');
    }

    /**
     * Update group information.
     */
    public function updateGroup(Request $request, Group $group)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin') || $user->center_id !== $group->center_id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'level' => 'nullable|string|max:50',
            'teacher_id' => 'required|exists:users,id',
            'max_students' => 'required|integer|min:1|max:100',
            'student_price' => 'required|numeric|min:0',
            'payment_type' => 'required|in:monthly,session',
        ]);

        // Check if teacher belongs to the same center
        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->center_id !== $user->center_id) {
            abort(403, 'Invalid teacher selected');
        }

        $group->update([
            'name' => $request->name,
            'subject' => $request->subject,
            'level' => $request->level,
            'user_id' => $request->teacher_id,
            'max_students' => $request->max_students,
            'student_price' => $request->student_price,
            'payment_type' => $request->payment_type,
        ]);

        return redirect()->back()->with('success', 'Group updated successfully');
    }

    /**
     * Delete a group from the center.
     */
    public function deleteGroup(Group $group)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin') || $user->center_id !== $group->center_id) {
            abort(403, 'Unauthorized');
        }

        $group->delete();

        return redirect()->back()->with('success', 'Group deleted successfully');
    }

    /**
     * Send invitation to a user to join the center.
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
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'role' => 'required|in:teacher,assistant',
        ]);

        // Check subscription limits
        $center = $user->center;
        $subscription = $center->activeSubscription;
        
        if ($subscription) {
            $this->checkSubscriptionLimits($request->role, $center, $subscription);
        }

        // Create user with default password
        $defaultPassword = 'temp123456';
        $newUser = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'password' => bcrypt($defaultPassword),
            'center_id' => $user->center_id,
            'type' => $request->role,
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        $newUser->assignRole($request->role);

        // Here you would typically send an email notification with the default password
        // For now, we'll just return success with the password info

        return redirect()->back()->with('success', 
            "User invited successfully. Default password: {$defaultPassword}");
    }

    /**
     * Get center teachers for dropdowns.
     */
    public function getTeachers()
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $teachers = $user->center->users()
            ->role('teacher')
            ->select('id', 'name', 'subject')
            ->get();

        return response()->json($teachers);
    }

    /**
     * Get teacher's groups for dropdowns.
     */
    public function getTeacherGroups(Request $request)
    {
        $user = Auth::user();
        $userModel = User::find($user->id);
        
        if (!$userModel->hasRole('admin')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'teacher_id' => 'required|exists:users,id',
        ]);

        $teacher = User::find($request->teacher_id);
        if (!$teacher || $teacher->center_id !== $user->center_id) {
            abort(403, 'Invalid teacher selected');
        }

        $groups = $teacher->groups()
            ->select('id', 'name', 'subject', 'max_students')
            ->withCount('students')
            ->get();

        return response()->json($groups);
    }
}
