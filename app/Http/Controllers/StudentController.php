<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Student;
use App\Models\User;
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
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();

        // For assistants, use the teacher's students
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        // Build the query with search filters
        $query = Student::where('user_id', $teacherId)->with(['group', 'academicYear']);

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

        $students = $query->orderBy('name')->get();
        $groups = Group::where('user_id', $teacherId)->select('id', 'name')->get();
        $academicYears = \App\Models\AcademicYear::all();

        $subscriptionLimits = $user->getSubscriptionLimits();
        $currentStudentCount = $user->getStudentCount();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'groups' => $groups,
            'academicYears' => $academicYears,
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => $user->canAddStudents(),
            'filters' => [
                'search' => $request->input('search', ''),
                'group_id' => $request->input('group_id', ''),
                'academic_year_id' => $request->input('academic_year_id', ''),
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

        $groups = Group::where('user_id', $user->id)->where('is_active', true)->with('academicYear')->get();
        $academicYears = \App\Models\AcademicYear::all();

        return Inertia::render('Students/Create', [
            'groups' => $groups,
            'academicYears' => $academicYears,
            'canAddStudents' => $canAdd,
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
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

        // Add user_id to the validated data
        $validated['user_id'] = $user->id;

        Student::create($validated);

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

        $student->load(['group', 'academicYear', 'payments.group']);

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

        $groups = Group::where('user_id', Auth::id())->where('is_active', true)->with('academicYear')->get();
        $academicYears = \App\Models\AcademicYear::all();

        return Inertia::render('Students/Edit', [
            'student' => $student->load('academicYear'),
            'groups' => $groups,
            'academicYears' => $academicYears,
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
