<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Student;
use App\Models\User;
use App\Enums\EducationLevel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of the students.
     */
    public function index(Request $request)
    {
        /** @var User $user */
        $user = Auth::user();

        // Ensure user belongs to a center
        if (!$user->center_id) {
            return redirect()->route('center.setup');
        }

        // Determine which students to show based on user role and permissions
        if ($user->hasRole('admin')) {
            // Admins can see all students in their center
            $query = Student::where('center_id', $user->center_id);
        } elseif ($user->hasRole('teacher')) {
            // Teachers can only see their own students
            $query = Student::where('user_id', $user->id)
                           ->where('center_id', $user->center_id);
        } elseif ($user->hasRole('assistant')) {
            // Assistants can see their teacher's students
            $teacherId = $user->teacher_id;
            $query = Student::where('user_id', $teacherId)
                           ->where('center_id', $user->center_id);
        } else {
            // Fallback for legacy users
            $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;
            $query = Student::where('user_id', $teacherId)
                           ->where('center_id', $user->center_id);
        }

        $query->with(['group.teacher', 'academicYear']);

        // Search by name
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
            $query->whereHas('group', function ($q) use ($request) {
                $q->where('user_id', $request->input('teacher_id'));
            });
        }

        // Filter by level
        if ($request->filled('level')) {
            $query->where('level', $request->input('level'));
        }

        // Apply pagination with 20 students per page
        $students = $query->orderBy('name')->paginate(20)->withQueryString();
        $groups = Group::with(['academicYear', 'teacher'])->where('user_id', $user->id)->select('id', 'name')->get();
        $academicYears = \App\Models\AcademicYear::getGroupedByLevel();

        // Get teachers for the filter
        $teachers = collect();
        if ($user->center_id) {
            $center = $user->center;
            
            if ($center->type === 'individual') {
                // For individual centers, only show the owner
                $teachers = collect([
                    [
                        'id' => $user->id,
                        'name' => $user->name,
                        'subject' => $user->subject,
                        'email' => $user->email,
                    ]
                ]);
            } else {
                // For multi-teacher centers, get all teachers
                $teachers = $center->users()
                    ->whereHas('roles', function ($query) {
                        $query->where('name', 'teacher');
                    })
                    ->get()
                    ->map(function ($teacher) {
                        return [
                            'id' => $teacher->id,
                            'name' => $teacher->name,
                            'subject' => $teacher->subject,
                            'email' => $teacher->email,
                        ];
                    });
            }
        }

        $subscriptionLimits = $user->getSubscriptionLimits();
        $currentStudentCount = $user->getStudentCount();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'groups' => $groups,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => $user->canAddStudents(),
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
     * Show the form for creating a new student.
     */
    public function create(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        // Check subscription limits and pass to view
        $canAdd = $user->canAddStudents();
        $subscriptionLimits = $user->getSubscriptionLimits();
        $currentStudentCount = $user->getStudentCount();

        $groups = Group::where('center_id', $user->center_id)
                      ->where('is_active', true)
                      ->with(['academicYear', 'teacher'])
                      ->get();
                    //   dd($groups->toArray());
        $academicYears = \App\Models\AcademicYear::getGroupedByLevel();
        
        // Get teachers for the center
        $teachers = User::where('center_id', $user->center_id)
                       ->where('type', 'teacher')
                       ->where('is_active', true)
                       ->select('id', 'name')
                       ->get();

        return Inertia::render('Students/Create', [
            'groups' => $groups,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'canAddStudents' => $canAdd,
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'lastStudent' => session('last_student'), // Pass last created student name
        ]);
    }

    /**
     * Store a newly created student in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        // Check subscription limit before creating
        if (!$user->canAddStudents()) {
            throw ValidationException::withMessages([
                'subscription' => 'لقد وصلت إلى الحد الأقصى للطلاب في خطتك الحالية.',
            ]);
        }
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'guardian_phone' => 'nullable|string|max:20',
            'level' => ['required', 'string', 'in:' . implode(',', EducationLevel::values())],
            'academic_year_id' => 'required|exists:academic_years,id',
            'group_id' => 'nullable|exists:groups,id',
            'redirect_to' => 'nullable|string|in:create,index', // Add redirect option
        ]);
        // Validate that if a group is selected, it matches the academic year
        if (isset($validated['group_id']) && $validated['group_id']) {
            $group = Group::find($validated['group_id']);
            if ($group && $group->academic_year_id && $group->academic_year_id != $validated['academic_year_id']) {
                throw ValidationException::withMessages([
                    'group_id' => 'لا يمكن إضافة الطالب إلى هذه المجموعة لأنها لا تنتمي لنفس الصف الدراسي.',
                ]);
            }
        }

        // Add user_id and center_id to the validated data
        $validated['user_id'] = $user->id;
        $validated['center_id'] = $user->center_id;

        // Remove redirect_to from validated data before creating student
        $redirectTo = $validated['redirect_to'] ?? 'index';
        unset($validated['redirect_to']);

        $student = Student::create($validated);
        // Determine redirect destination
        if ($redirectTo === 'create') {
            return redirect()->route('students.create')
                ->with('success', 'تم إضافة الطالب بنجاح! يمكنك إضافة طالب آخر.')
                ->with('last_student', $student->name);
        }

        return redirect()->route('students.index')
            ->with('success', 'تم إضافة الطالب بنجاح!');
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student): Response
    {
        $user = Auth::user();

        // Ensure the student belongs to the authenticated user or their teacher
        if ($student->user_id !== $user->id &&
            ($user->type !== 'assistant' || $student->user_id !== $user->teacher_id)) {
            abort(403);
        }

        $student->load(['group.teacher', 'academicYear', 'payments.group']);

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

        // dd($student->toArray());
        return Inertia::render('Students/Show', [
            'student' => $student,
            'recentPayments' => $recentPayments,
        ]);
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(Student $student): Response
    {
        // Ensure the student belongs to the authenticated user
        if ($student->user_id !== Auth::id()) {
            abort(403);
        }

        $groups = Group::where('is_active', true)->with(['academicYear', 'teacher'])->get();
        $academicYears = \App\Models\AcademicYear::getGroupedByLevel();
        
        // Get teachers for the center
        $teachers = User::where('center_id', Auth::user()->center_id)
                       ->where('type', 'teacher')
                       ->where('is_active', true)
                       ->select('id', 'name')
                       ->get();

        return Inertia::render('Students/Edit', [
            'student' => $student->load(['academicYear', 'group.teacher']),
            'groups' => $groups,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Update the specified student in storage.
     */
    public function update(Request $request, Student $student): RedirectResponse
    {
        // Ensure the student belongs to the authenticated user
        if ($student->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'guardian_phone' => 'required|string|max:20',
            'level' => ['required', 'string', 'in:' . implode(',', EducationLevel::values())],
            'academic_year_id' => 'required|exists:academic_years,id',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        // Validate that if a group is selected, it matches the academic year
        if (isset($validated['group_id']) && $validated['group_id']) {
            $group = Group::find($validated['group_id']);
            if ($group && $group->academic_year_id && $group->academic_year_id != $validated['academic_year_id']) {
                throw ValidationException::withMessages([
                    'group_id' => 'لا يمكن إضافة الطالب إلى هذه المجموعة لأنها لا تنتمي لنفس الصف الدراسي.',
                ]);
            }
        }

        $student->update($validated);

        return redirect()->route('students.index')
            ->with('success', 'تم تحديث بيانات الطالب بنجاح!');
    }

    /**
     * Remove the specified student from storage.
     */
    public function destroy(Student $student): RedirectResponse
    {
        // Ensure the student belongs to the authenticated user
        if ($student->user_id !== Auth::id()) {
            abort(403);
        }

        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'تم حذف الطالب بنجاح!');
    }
}
