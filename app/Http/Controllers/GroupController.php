<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignStudentsRequest;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\StoreSpecialSessionRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Http\Requests\UpdateSpecialSessionRequest;
use App\Models\Group;
use App\Models\GroupSpecialSession;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Ensure user belongs to a center
        if (!$user->center_id) {
            return redirect()->route('center.setup');
        }

        // Determine which groups to show based on user role and permissions
        if ($user->hasRole('admin')) {
            // Admins can see all groups in their center
            $query = Group::where('center_id', $user->center_id);
        } elseif ($user->hasRole('teacher')) {
            // Teachers can only see their own groups
            $query = Group::where('user_id', $user->id)
                          ->where('center_id', $user->center_id);
        } elseif ($user->hasRole('assistant')) {
            // Assistants can see their teacher's groups
            $teacherId = $user->teacher_id;
            $query = Group::where('user_id', $teacherId)
                          ->where('center_id', $user->center_id);
        } else {
            // Fallback for legacy users
            $query = Group::where('user_id', $user->id)
                          ->where('center_id', $user->center_id);
        }

        $query->with(['schedules', 'assignedStudents', 'academicYear']);

        // Apply search filter
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Apply academic year filter
        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }

        $groups = $query->get();

        // Transform the data to ensure consistency
        $transformedGroups = $groups->map(function ($group) {
            return array_merge($group->toArray(), [
                'assigned_students' => $group->assignedStudents->toArray(),
            ]);
        });

        $academicYears = \App\Models\AcademicYear::all();

        return Inertia::render('Groups/Index', [
            'groups' => $transformedGroups,
            'academicYears' => $academicYears,
            'filters' => $request->only(['search', 'academic_year_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $academicYears = \App\Models\AcademicYear::all();

        return Inertia::render('Groups/Create', [
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGroupRequest $request)
    {
        $user = Auth::user();

        $group = Group::create(array_merge(
            $request->only(['name', 'description', 'max_students', 'is_active', 'payment_type', 'student_price', 'academic_year_id']),
            [
                'user_id' => $user->id,
                'center_id' => $user->center_id,
            ]
        ));

        foreach ($request->schedules as $schedule) {
            $group->schedules()->create(array_merge($schedule, [
                'center_id' => $user->center_id,
            ]));
        }

        return redirect()->route('groups.index')->with('success', 'تم إنشاء المجموعة بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(Group $group)
    {
        $user = Auth::user();

        // Ensure the group belongs to the user's center
        if ($group->center_id !== $user->center_id) {
            abort(403);
        }

        // Additional role-based authorization
        if ($user->hasRole('teacher') && $group->user_id !== $user->id) {
            abort(403);
        } elseif ($user->hasRole('assistant') && $group->user_id !== $user->teacher_id) {
            abort(403);
        } elseif (!$user->hasRole(['admin', 'teacher', 'assistant'])) {
            // Legacy check for users without roles
            if ($group->user_id !== $user->id &&
                ($user->type !== 'assistant' || $group->user_id !== $user->teacher_id)) {
                abort(403);
            }
        }

        $group->load(['schedules', 'assignedStudents', 'specialSessions', 'academicYear']);

        // Get only students that are not assigned to any group and have matching academic year
        $availableStudents = Student::where('user_id', Auth::id())
            ->whereNull('group_id')
            ->where('academic_year_id', $group->academic_year_id)
            ->get();


        // Get payment summary for current month
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $paymentSummary = [
            'total_students' => $group->assignedStudents->count(),
            'paid_students' => $group->payments()
                ->where('payment_type', 'monthly')
                ->whereYear('related_date', $currentYear)
                ->whereMonth('related_date', $currentMonth)
                ->where('is_paid', true)
                ->count(),
            'unpaid_students' => $group->assignedStudents->count() - $group->payments()
                ->where('payment_type', 'monthly')
                ->whereYear('related_date', $currentYear)
                ->whereMonth('related_date', $currentMonth)
                ->where('is_paid', true)
                ->count(),
            'total_amount' => $group->payments()
                ->where('payment_type', 'monthly')
                ->whereYear('related_date', $currentYear)
                ->whereMonth('related_date', $currentMonth)
                ->where('is_paid', true)
                ->sum('amount'),
            'current_month' => now()->format('F Y'),
            'current_month_arabic' => now()->locale('ar')->monthName . ' ' . now()->year,
        ];

        return Inertia::render('Groups/Show', [
            'group' => array_merge($group->toArray(), [
                'assigned_students' => $group->assignedStudents->toArray(),
                'expected_monthly_income' => $group->getExpectedMonthlyIncome(),
                'expected_income_per_session' => $group->getExpectedIncomePerSession(),
                'payment_type_label' => $group->getPaymentTypeLabel(),
            ]),
            'availableStudents' => $availableStudents,
            'paymentSummary' => $paymentSummary,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->load(['schedules', 'academicYear']);
        $academicYears = \App\Models\AcademicYear::all();

        return Inertia::render('Groups/Edit', [
            'group' => $group,
            'academicYears' => $academicYears,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGroupRequest $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->update($request->only([
            'name', 'description', 'max_students', 'is_active', 'payment_type', 'student_price', 'academic_year_id',
        ]));

        // Delete existing schedules and create new ones
        $group->schedules()->delete();
        foreach ($request->schedules as $schedule) {
            $group->schedules()->create($schedule);
        }

        return redirect()->route('groups.index')->with('success', 'تم تحديث المجموعة بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->delete();

        return redirect()->route('groups.index')->with('success', 'تم حذف المجموعة بنجاح');
    }

    /**
     * Assign students to a group
     */
    public function assignStudents(AssignStudentsRequest $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        // Verify that all students belong to the authenticated user
        $students = Student::where('user_id', Auth::id())
            ->whereIn('id', $request->student_ids)
            ->get();

        if ($students->count() !== count($request->student_ids)) {
            abort(403, 'يمكنك فقط تعيين طلابك الخاصين');
        }

        // Check if group has an academic year and students match it
        if ($group->academic_year_id) {
            $mismatchedStudents = $students->filter(function ($student) use ($group) {
                return $student->academic_year_id && $student->academic_year_id !== $group->academic_year_id;
            });

            if ($mismatchedStudents->count() > 0) {
                $studentNames = $mismatchedStudents->pluck('name')->join('، ');

                return back()->withErrors([
                    'assignment' => "لا يمكن إضافة الطلاب التالية لأنهم في صف دراسي مختلف: {$studentNames}",
                ]);
            }
        }

        // Check if any of the students are already assigned to a group
        $alreadyAssignedStudents = $students->whereNotNull('group_id');
        if ($alreadyAssignedStudents->count() > 0) {
            $studentNames = $alreadyAssignedStudents->pluck('name')->join('، ');

            return back()->withErrors([
                'assignment' => "الطلاب التالية مُعينين بالفعل في مجموعات أخرى: {$studentNames}",
            ]);
        }

        // Check if adding these students would exceed the group's maximum capacity
        $currentStudentCount = $group->assignedStudents()->count();
        $newStudentCount = count($request->student_ids);

        if (($currentStudentCount + $newStudentCount) > $group->max_students) {
            return back()->withErrors([
                'capacity' => "لا يمكن إضافة {$newStudentCount} طلاب. الحد الأقصى للمجموعة {$group->max_students} والعدد الحالي {$currentStudentCount}",
            ]);
        }

        // Assign students to the group by updating their group_id
        Student::whereIn('id', $request->student_ids)
            ->where('user_id', Auth::id())
            ->whereNull('group_id') // Extra safety check
            ->update(['group_id' => $group->id]);

        return back()->with('success', 'تم تعيين الطلاب للمجموعة بنجاح');
    }

    /**
     * Remove a student from a group
     */
    public function removeStudent(Group $group, Student $student)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id() || $student->user_id !== Auth::id()) {
            abort(403);
        }

        // Remove student from group by setting group_id to null
        $student->group_id = null;
        $student->save();

        return back()->with('success', 'تم إزالة الطالب من المجموعة بنجاح');
    }

    /**
     * Display the calendar view for a group
     */
    public function calendar(Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->load(['schedules', 'specialSessions']);

        return Inertia::render('Groups/Calendar', [
            'group' => $group,
        ]);
    }

    /**
     * Get calendar events for a group
     */
    public function getCalendarEvents(Request $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $start = $request->input('start');
        $end = $request->input('end');

        $events = [];

        // Add recurring schedule events
        if ($start && $end) {
            $startDate = new \DateTime($start);
            $endDate = new \DateTime($end);

            while ($startDate <= $endDate) {
                $dayOfWeek = (int) $startDate->format('w'); // 0 = Sunday, 6 = Saturday

                foreach ($group->schedules as $schedule) {
                    if ($schedule->day_of_week == $dayOfWeek) {
                        $events[] = [
                            'id' => 'schedule_' . $schedule->id . '_' . $startDate->format('Y-m-d'),
                            'title' => $group->name . ' - جلسة منتظمة',
                            'start' => $startDate->format('Y-m-d') . 'T' . $schedule->start_time,
                            'end' => $startDate->format('Y-m-d') . 'T' . $schedule->end_time,
                            'backgroundColor' => '#3b82f6',
                            'borderColor' => '#2563eb',
                            'type' => 'recurring',
                            'editable' => false,
                        ];
                    }
                }

                $startDate->modify('+1 day');
            }
        }

        // Add special session events
        $specialSessions = $group->specialSessions()
            ->when($start, function ($query) use ($start) {
                $query->where('date', '>=', $start);
            })
            ->when($end, function ($query) use ($end) {
                $query->where('date', '<=', $end);
            })
            ->get();

        foreach ($specialSessions as $session) {
            $events[] = [
                'id' => 'special_' . $session->id,
                'title' => $group->name . ' - جلسة خاصة',
                'start' => $session->date->format('Y-m-d') . 'T' . $session->start_time,
                'end' => $session->date->format('Y-m-d') . 'T' . $session->end_time,
                'backgroundColor' => '#10b981',
                'borderColor' => '#059669',
                'extendedProps' => [
                    'description' => $session->description,
                    'type' => 'special',
                    'sessionId' => $session->id,
                ],
                'editable' => true,
            ];
        }

        return response()->json($events);
    }

    /**
     * Store a new special session
     */
    public function storeSpecialSession(StoreSpecialSessionRequest $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $specialSession = $group->specialSessions()->create($request->only([
            'date', 'start_time', 'end_time', 'description',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الجلسة الخاصة بنجاح',
            'session' => $specialSession,
        ]);
    }

    /**
     * Update a special session
     */
    public function updateSpecialSession(UpdateSpecialSessionRequest $request, Group $group, GroupSpecialSession $specialSession)
    {
        // Ensure the group and session belong to the authenticated user
        if ($group->user_id !== Auth::id() || $specialSession->group_id !== $group->id) {
            abort(403);
        }

        $specialSession->update($request->only([
            'date', 'start_time', 'end_time', 'description',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الجلسة الخاصة بنجاح',
            'session' => $specialSession,
        ]);
    }

    /**
     * Delete a special session
     */
    public function destroySpecialSession(Group $group, GroupSpecialSession $specialSession)
    {
        // Ensure the group and session belong to the authenticated user
        if ($group->user_id !== Auth::id() || $specialSession->group_id !== $group->id) {
            abort(403);
        }

        $specialSession->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الجلسة الخاصة بنجاح',
        ]);
    }
}
