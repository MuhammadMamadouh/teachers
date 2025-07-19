<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Center;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionController extends Controller
{
    /**
     * Display permission management interface.
     */
    public function index()
    {
        $user = Auth::user();
        
        if (!$user->is_admin) {
            abort(403, 'Unauthorized - Admin access required');
        }

        $center = $user->center;
        $users = $center->users()->with(['roles', 'permissions'])->get();
        $availablePermissions = $this->getAvailablePermissions();
        $roles = Role::all();

        return Inertia::render('Admin/Permissions/Index', [
            'users' => $users,
            'availablePermissions' => $availablePermissions,
            'roles' => $roles,
            'center' => $center,
        ]);
    }

    /**
     * Update user permissions.
     */
    public function updateUserPermissions(Request $request, User $targetUser)
    {
        $user = Auth::user();
        
        if (!$user->is_admin || $user->center_id !== $targetUser->center_id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        DB::transaction(function () use ($request, $targetUser) {
            // Sync permissions for the user
            $targetUser->syncPermissions($request->permissions);
        });

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }

    /**
     * Assign assistant to specific teacher with custom permissions.
     */
    public function assignAssistantToTeacher(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->is_admin) {
            abort(403, 'Unauthorized - Admin access required');
        }

        $request->validate([
            'assistant_id' => 'required|exists:users,id',
            'teacher_id' => 'required|exists:users,id',
            'permissions' => 'required|array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $assistant = User::findOrFail($request->assistant_id);
        $teacher = User::findOrFail($request->teacher_id);

        // Verify both users belong to the same center
        if ($assistant->center_id !== $user->center_id || $teacher->center_id !== $user->center_id) {
            abort(403, 'Users must belong to the same center');
        }

        // Verify assistant role
        if (!$assistant->hasRole('assistant')) {
            abort(403, 'User must have assistant role');
        }

        // Verify teacher role
        if (!$teacher->hasRole('teacher')) {
            abort(403, 'Target user must have teacher role');
        }

        DB::transaction(function () use ($request, $assistant, $teacher) {
            // Assign assistant to teacher
            $assistant->update(['teacher_id' => $teacher->id]);

            // Assign custom permissions
            $assistant->syncPermissions($request->permissions);
        });

        return redirect()->back()->with('success', 'Assistant assigned to teacher with custom permissions.');
    }

    /**
     * Remove assistant from teacher assignment.
     */
    public function removeAssistantFromTeacher(Request $request, User $assistant)
    {
        $user = Auth::user();
        
        if (!$user->is_admin || $user->center_id !== $assistant->center_id) {
            abort(403, 'Unauthorized');
        }

        if (!$assistant->hasRole('assistant')) {
            abort(403, 'User must have assistant role');
        }

        DB::transaction(function () use ($assistant) {
            // Remove teacher assignment
            $assistant->update(['teacher_id' => null]);

            // Reset to default assistant permissions
            $assistant->syncPermissions($this->getDefaultAssistantPermissions());
        });

        return redirect()->back()->with('success', 'Assistant removed from teacher assignment.');
    }

    /**
     * Get available permissions grouped by category.
     */
    private function getAvailablePermissions()
    {
        return [
            'Student Management' => [
                'view own students' => 'View students assigned to user',
                'view all students' => 'View all students in center',
                'create students' => 'Create new students',
                'edit students' => 'Edit student information',
                'delete students' => 'Delete students',
            ],
            'Group Management' => [
                'view own groups' => 'View groups assigned to user',
                'view all groups' => 'View all groups in center',
                'create groups' => 'Create new groups',
                'edit groups' => 'Edit group information',
                'delete groups' => 'Delete groups',
            ],
            'Attendance Management' => [
                'view own attendance' => 'View attendance for assigned groups',
                'view all attendance' => 'View attendance for all groups',
                'manage attendance' => 'Mark and manage attendance',
            ],
            'Payment Management' => [
                'view own payments' => 'View payments for assigned students',
                'view all payments' => 'View all payments in center',
                'manage payments' => 'Process and manage payments',
            ],
            'Reports' => [
                'view own reports' => 'View reports for assigned data',
                'view all reports' => 'View all reports in center',
                'generate reports' => 'Generate custom reports',
            ],
            'Center Management' => [
                'view center' => 'View center information',
                'edit center' => 'Edit center settings',
                'manage center users' => 'Manage center users',
                'invite users' => 'Invite new users to center',
                'view subscriptions' => 'View subscription information',
                'manage subscriptions' => 'Manage subscription plans',
            ],
        ];
    }

    /**
     * Get default permissions for assistant role.
     */
    private function getDefaultAssistantPermissions()
    {
        return [
            'view center',
            'view own students',
            'view own groups',
            'view own attendance',
            'view own reports',
        ];
    }

    /**
     * Get role-based permission templates.
     */
    public function getPermissionTemplates()
    {
        return [
            'assistant_basic' => [
                'name' => 'Basic Assistant',
                'description' => 'View-only access to assigned data',
                'permissions' => [
                    'view center',
                    'view own students',
                    'view own groups',
                    'view own attendance',
                    'view own reports',
                ],
            ],
            'assistant_attendance' => [
                'name' => 'Attendance Assistant',
                'description' => 'Can mark attendance and view assigned data',
                'permissions' => [
                    'view center',
                    'view own students',
                    'view own groups',
                    'view own attendance',
                    'manage attendance',
                    'view own reports',
                ],
            ],
            'assistant_student_manager' => [
                'name' => 'Student Manager Assistant',
                'description' => 'Can manage students and attendance',
                'permissions' => [
                    'view center',
                    'view own students',
                    'create students',
                    'edit students',
                    'view own groups',
                    'view own attendance',
                    'manage attendance',
                    'view own reports',
                ],
            ],
            'assistant_full' => [
                'name' => 'Full Assistant',
                'description' => 'Full access to assigned teacher data',
                'permissions' => [
                    'view center',
                    'view own students',
                    'create students',
                    'edit students',
                    'view own groups',
                    'create groups',
                    'edit groups',
                    'view own attendance',
                    'manage attendance',
                    'view own payments',
                    'manage payments',
                    'view own reports',
                ],
            ],
        ];
    }

    /**
     * Apply permission template to user.
     */
    public function applyPermissionTemplate(Request $request, User $targetUser)
    {
        $user = Auth::user();
        
        if (!$user->is_admin || $user->center_id !== $targetUser->center_id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'template' => 'required|string|in:assistant_basic,assistant_attendance,assistant_student_manager,assistant_full',
        ]);

        $templates = $this->getPermissionTemplates();
        $selectedTemplate = $templates[$request->template];

        DB::transaction(function () use ($selectedTemplate, $targetUser) {
            $targetUser->syncPermissions($selectedTemplate['permissions']);
        });

        return redirect()->back()->with('success', "Permission template '{$selectedTemplate['name']}' applied successfully.");
    }

    /**
     * Get user's current permissions with descriptions.
     */
    public function getUserPermissions(User $targetUser)
    {
        $user = Auth::user();
        
        if (!$user->is_admin || $user->center_id !== $targetUser->center_id) {
            abort(403, 'Unauthorized');
        }

        $userPermissions = $targetUser->permissions->pluck('name')->toArray();
        $allPermissions = $this->getAvailablePermissions();

        $permissionsWithStatus = [];
        foreach ($allPermissions as $category => $permissions) {
            $categoryPermissions = [];
            foreach ($permissions as $permission => $description) {
                $categoryPermissions[] = [
                    'name' => $permission,
                    'description' => $description,
                    'granted' => in_array($permission, $userPermissions),
                ];
            }
            $permissionsWithStatus[$category] = $categoryPermissions;
        }

        return response()->json([
            'permissions' => $permissionsWithStatus,
            'templates' => $this->getPermissionTemplates(),
        ]);
    }
}
