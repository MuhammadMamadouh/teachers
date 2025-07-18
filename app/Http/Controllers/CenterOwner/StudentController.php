<?php
namespace App\Http\Controllers\CenterOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Student;
use App\Models\User;
use App\Models\Group;
use App\Models\Center;
use App\Enums\EducationLevel;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of the students.
     */
    public function students(Request $request)
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        $center = $user->center;
        
        // Start with all students in the center
        $query = $center->students()->with(['user:id,name,subject', 'group:id,name,subject', 'academicYear:id,name_ar']);

        // Search by name, phone, or guardian phone
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('guardian_phone', 'like', "%{$search}%");
            });
        }

        // Filter by group
        if ($request->filled('group_id')) {
            if ($request->input('group_id') === 'unassigned') {
                $query->whereNull('group_id');
            } else {
                $query->where('group_id', $request->input('group_id'));
            }
        }

        // Filter by academic year
        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->input('academic_year_id'));
        }

        // Filter by teacher (through group)
        if ($request->filled('teacher_id')) {
            $query->where('user_id', $request->input('teacher_id'));
        }

        // Filter by level
        if ($request->filled('level')) {
            $query->where('level', $request->input('level'));
        }

        // Apply pagination with 20 students per page
        $students = $query->paginate(20)->withQueryString();

        // Get teachers and groups for dropdowns
        $teachers = $center->teachers()
            ->select(['id', 'name', 'subject'])
            ->orderBy('name')
            ->get();

        $groups = $center->groups()
            ->with(['user:id,name,subject', 'academicYear:id,name_ar'])
            ->select(['id', 'name', 'subject', 'user_id', 'level', 'academic_year_id'])
            ->orderBy('name')
            ->get();

        // Get academic years
        $academicYears = \App\Models\AcademicYear::getGroupedByLevel();

        // Get subscription details to check student limits
        $subscription = $center->activeSubscription()->with('plan')->first();
        $maxStudents = $subscription && $subscription->plan ? $subscription->plan->max_students : 0;
        $currentStudents = $center->students()->count();
        $canAddMore = !$subscription || $currentStudents < $maxStudents;

        return Inertia::render('CenterOwner/Students', [
            'center' => $center,
            'students' => $students,
            'teachers' => $teachers,
            'groups' => $groups,
            'academicYears' => $academicYears,
            'educationLevels' => EducationLevel::forFrontend(),
            'studentCount' => $students->total(),
            'maxStudents' => $maxStudents,
            'canAddMore' => $canAddMore,
            'filters' => [
                'search' => $request->input('search', ''),
                'group_id' => $request->input('group_id', ''),
                'academic_year_id' => $request->input('academic_year_id', ''),
                'teacher_id' => $request->input('teacher_id', ''),
                'level' => $request->input('level', ''),
            ],
        ]);
    }

    /**
     * Store a newly created student in storage.
     */
    public function createStudent(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        $center = $user->center;
        $subscription = $center->activeSubscription;
        
        // Check subscription limits for students
        if ($subscription) {
            $currentStudents = $center->students()->count();
            if ($currentStudents >= $subscription->plan->max_students) {
                throw ValidationException::withMessages([
                    'subscription' => 'لقد وصلت إلى الحد الأقصى للطلاب في خطتك الحالية.',
                ]);
            }
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'guardian_phone' => 'nullable|string|max:20',
            'level' => ['required', 'string', 'in:' . implode(',', EducationLevel::values())],
            'academic_year_id' => 'required|exists:academic_years,id',
            'teacher_id' => 'required|exists:users,id',
            'group_id' => 'nullable|exists:groups,id',
            'redirect_to' => 'nullable|string|in:create,index',
        ]);

        // Verify teacher belongs to this center
        $teacher = User::find($validated['teacher_id']);
        if (!$teacher || $teacher->center_id !== $center->id) {
            throw ValidationException::withMessages([
                'teacher_id' => 'المعلم المحدد غير موجود في المركز',
            ]);
        }

        // Verify group belongs to this center and matches academic year (if provided)
        if ($validated['group_id']) {
            $group = Group::find($validated['group_id']);
            if (!$group || $group->center_id !== $center->id) {
                throw ValidationException::withMessages([
                    'group_id' => 'المجموعة المحددة غير موجودة في المركز',
                ]);
            }
            
            // Validate that if a group is selected, it matches the academic year
            if ($group->academic_year_id && $group->academic_year_id != $validated['academic_year_id']) {
                throw ValidationException::withMessages([
                    'group_id' => 'لا يمكن إضافة الطالب إلى هذه المجموعة لأنها لا تنتمي لنفس الصف الدراسي.',
                ]);
            }
        }

        // Add center_id to the validated data
        $validated['center_id'] = $center->id;
        $validated['user_id'] = $validated['teacher_id'];

        // Remove redirect_to and teacher_id from validated data before creating student
        $redirectTo = $validated['redirect_to'] ?? 'index';
        unset($validated['redirect_to'], $validated['teacher_id']);

        try {
            DB::transaction(function () use ($validated, &$student) {
                $student = Student::create($validated);
            });
            
            // Determine redirect destination
            if ($redirectTo === 'create') {
                return redirect()->back()
                    ->with('success', 'تم إضافة الطالب بنجاح! يمكنك إضافة طالب آخر.')
                    ->with('last_student', $student->name);
            }
            
            return redirect()->back()->with('success', 'تم إضافة الطالب بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء إضافة الطالب: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified student in storage.
     */
    public function updateStudent(Request $request, Student $student): RedirectResponse
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        if ($student->center_id !== $user->center_id) {
            abort(403, 'Student does not belong to your center');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'guardian_phone' => 'nullable|string|max:20',
            'level' => ['required', 'string', 'in:' . implode(',', EducationLevel::values())],
            'academic_year_id' => 'required|exists:academic_years,id',
            'teacher_id' => 'required|exists:users,id',
            'group_id' => 'nullable|exists:groups,id',
        ]);
        
        $center = $user->center;
        
        // Verify teacher belongs to this center
        $teacher = User::find($validated['teacher_id']);
        if (!$teacher || $teacher->center_id !== $center->id) {
            throw ValidationException::withMessages([
                'teacher_id' => 'المعلم المحدد غير موجود في المركز',
            ]);
        }
        
        // Verify group belongs to this center and matches academic year (if provided)
        if ($validated['group_id']) {
            $group = Group::find($validated['group_id']);
            if (!$group || $group->center_id !== $center->id) {
                throw ValidationException::withMessages([
                    'group_id' => 'المجموعة المحددة غير موجودة في المركز',
                ]);
            }
            
            // Validate that if a group is selected, it matches the academic year
            if ($group->academic_year_id && $group->academic_year_id != $validated['academic_year_id']) {
                throw ValidationException::withMessages([
                    'group_id' => 'لا يمكن إضافة الطالب إلى هذه المجموعة لأنها لا تنتمي لنفس الصف الدراسي.',
                ]);
            }
        }

        // Set user_id to teacher_id
        $validated['user_id'] = $validated['teacher_id'];
        unset($validated['teacher_id']);
        
        try {
            DB::transaction(function () use ($validated, $student) {
                $student->update($validated);
            });
            
            return redirect()->back()->with('success', 'تم تحديث بيانات الطالب بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء تحديث الطالب: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified student from storage.
     */
    public function deleteStudent(Student $student): RedirectResponse
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        if ($student->center_id !== $user->center_id) {
            abort(403, 'Student does not belong to your center');
        }
        
        try {
            DB::transaction(function () use ($student) {
                // Delete related records (payments, attendance, etc.)
                $student->payments()->delete();
                $student->attendances()->delete();
                $student->delete();
            });
            
            return redirect()->back()->with('success', 'تم حذف الطالب بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء حذف الطالب: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified student.
     */
    public function showStudent(Student $student): Response
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        // Ensure the student belongs to the center
        if ($student->center_id !== $user->center_id) {
            abort(403, 'Student does not belong to your center');
        }

        $student->load(['group.teacher', 'academicYear', 'payments.group', 'user']);

        // Get recent payments (last 6 months)
        $recentPayments = $student->payments()
            ->with('group')
            ->where('related_date', '>=', now()->subMonths(6)->startOfMonth())
            ->orderBy('related_date', 'desc')
            ->take(6)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'payment_type' => $payment->payment_type,
                    'related_date' => $payment->related_date->format('Y-m-d'),
                    'formatted_date' => $payment->related_date->format('F Y'),
                    'is_paid' => $payment->is_paid,
                    'amount' => $payment->amount,
                    'paid_date' => $payment->paid_at?->format('Y-m-d'),
                    'group' => $payment->group ? [
                        'id' => $payment->group->id,
                        'name' => $payment->group->name,
                    ] : null,
                ];
            });

        return Inertia::render('CenterOwner/StudentShow', [
            'student' => $student,
            'recentPayments' => $recentPayments,
        ]);
    }
}
