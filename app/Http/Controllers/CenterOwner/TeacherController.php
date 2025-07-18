<?php
namespace App\Http\Controllers\CenterOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Center;
use Inertia\Inertia;

class TeacherController extends Controller
{
    public function teachers()
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        $center = $user->center;
        $teachers = $center->teachers()
            ->select(['id', 'name', 'email', 'phone', 'subject', 'is_active', 'created_at'])
            ->orderBy('name')
            ->get();

        // Get subscription details to check teacher limits
        $subscription = $center->activeSubscription()->with('plan')->first();
        $maxTeachers = $subscription && $subscription->plan ? $subscription->plan->max_teachers : 0;
        $currentTeachers = $teachers->count();
        $canAddMore = !$subscription || $currentTeachers < $maxTeachers;

        return Inertia::render('CenterOwner/Teachers', [
            'center' => $center,
            'teachers' => $teachers,
            'teacherCount' => $teachers->count(),
            'maxTeachers' => $maxTeachers,
            'canAddMore' => $canAddMore,
        ]);
    }

    public function createTeacher(Request $request)
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:100',
        ]);

        $center = $user->center;
        $subscription = $center->activeSubscription;
        
        // Check subscription limits for teachers
        if ($subscription) {
            $currentTeachers = $center->teachers()->count();
            if ($currentTeachers >= $subscription->plan->max_teachers) {
                return back()->withErrors(['error' => 'لقد وصلت إلى الحد الأقصى لعدد المعلمين في خطتك الحالية']);
            }
        }

        try {
            DB::transaction(function () use ($request, $center) {
                $teacher = $center->teachers()->create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'subject' => $request->subject,
                    'role' => 'teacher',
                    'is_active' => true,
                    'password' => bcrypt('password'), // Default password
                ]);

                // Send welcome email with login credentials
                // TODO: Implement email notification
            });
            
            return redirect()->back()->with('success', 'تم إضافة المعلم بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء إضافة المعلم: ' . $e->getMessage()]);
        }
    }

    public function updateTeacher(Request $request, User $teacher)
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        if ($teacher->center_id !== $user->center_id) {
            abort(403, 'Teacher does not belong to your center');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $teacher->id,
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);
        
        try {
            DB::transaction(function () use ($request, $teacher) {
                $teacher->update([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'subject' => $request->subject,
                    'is_active' => $request->boolean('is_active', true),
                ]);
            });
            
            return redirect()->back()->with('success', 'تم تحديث بيانات المعلم بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء تحديث المعلم: ' . $e->getMessage()]);
        }
    }

    public function deleteTeacher(User $teacher)
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        if ($teacher->center_id !== $user->center_id) {
            abort(403, 'Teacher does not belong to your center');
        }
        
        try {
            DB::transaction(function () use ($teacher) {
                // Delete related records first
                $teacher->students()->delete();
                $teacher->groups()->delete();
                $teacher->delete();
            });
            
            return redirect()->back()->with('success', 'تم حذف المعلم بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء حذف المعلم: ' . $e->getMessage()]);
        }
    }
}
