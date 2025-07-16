<?php

namespace App\Http\Controllers;

use App\Enums\CenterType;
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
        $userRoles = $user->roles->pluck('name')->toArray();
        $isAdmin = in_array('admin', $userRoles) || $user->is_admin;
        $isTeacher = in_array('teacher', $userRoles) || $user->type === 'teacher';
        $isAssistant = in_array('assistant', $userRoles) || $user->type === 'assistant';

        if ($isAdmin) {
            // Admins can see all groups in their center
            $query = Group::where('center_id', $user->center_id)
                ->with(['user']); // Load teacher info
        } elseif ($isTeacher) {
            // Teachers can only see their own groups
            $query = Group::where('user_id', $user->id)
                ->where('center_id', $user->center_id)
                ->with(['user']); // Load teacher info
        } elseif ($isAssistant) {
            // Assistants can see their teacher's groups
            $teacherId = $user->teacher_id;
            $query = Group::where('user_id', $teacherId)
                ->where('center_id', $user->center_id)
                ->with(['user']); // Load teacher info
        } else {
            // Fallback for legacy users
            $query = Group::where('user_id', $user->id)
                ->where('center_id', $user->center_id)
                ->with(['user']); // Load teacher info
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

        // Apply teacher filter
        if ($request->filled('teacher_id')) {
            $query->where('user_id', $request->teacher_id);
        }

        $groups = $query->get();

        // Transform the data to ensure consistency
        $transformedGroups = $groups->map(function ($group) {
            return array_merge($group->toArray(), [
                'assigned_students' => $group->assignedStudents->toArray(),
                'schedules' => $group->schedules->toArray(),
                'teacher' => $group->user ? [
                    'id' => $group->user->id,
                    'name' => $group->user->name,
                    'subject' => $group->user->subject,
                    'email' => $group->user->email,
                ] : null,
            ]);
        });

        $academicYears = \App\Models\AcademicYear::getGroupedByLevel();

        // Get teachers for the filter
        $teachers = collect();
        if ($user->center_id) {
            $center = $user->center;

            if ($center->type === CenterType::INDIVIDUAL) {
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

        return Inertia::render('Groups/Index', [
            'groups' => $transformedGroups,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'academic_year_id', 'teacher_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $user = Auth::user();
        $academicYears = \App\Models\AcademicYear::getGroupedByLevel();

        // Get available teachers for the center
        $teachers = collect();
        $defaultTeacherId = null;


        $center = $user->center;

        if ($center->type === CenterType::INDIVIDUAL) {
            // For individual centers, the admin is the default teacher
            $defaultTeacherId = $user->id;
            $teachers = collect([
                [
                    'id' => $user->id,
                    'name' => $user->name,
                    'subject' => $user->subject,
                    'email' => $user->email,
                ]
            ]);
        } else {
            // For multi-teacher centers, get all teachers (including admin if they're also a teacher)
            $teachers = $center->users()
                ->where(function ($query) {
                    $query->where('type', 'teacher')
                        ->orWhere('is_admin', true);
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

            // Set default teacher ID to current user if they're a teacher
            if ($user->type === 'teacher' || $user->is_admin) {
                $defaultTeacherId = $user->id;
            }
        }

        return Inertia::render('Groups/Create', [
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'defaultTeacherId' => $defaultTeacherId,
            'centerType' => $user->center->type ?? 'individual',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreGroupRequest $request)
    {
        $user = Auth::user();

        // Determine teacher ID based on center type and user role
        $teacherId = $request->input('teacher_id');
        $userRoles = $user->roles->pluck('name')->toArray();
        $isAdmin = in_array('admin', $userRoles) || $user->is_admin;

        if ($isAdmin) {
            // Admin can assign group to any teacher in their center
            if (!$teacherId) {
                if ($user->center->type === CenterType::INDIVIDUAL) {
                    $teacherId = $user->id;
                } else {
                    return back()->withErrors(['teacher_id' => 'يجب اختيار معلم للمجموعة']);
                }
            }
        } else {
            // Teachers can only create groups for themselves
            $teacherId = $user->id;
        }

        // Validate teacher belongs to the same center
        $teacher = \App\Models\User::find($teacherId);
        if (!$teacher || $teacher->center_id !== $user->center_id) {
            return back()->withErrors(['teacher_id' => 'المعلم المحدد غير موجود في المركز']);
        }

        $group = Group::create(array_merge(
            $request->only(['name', 'subject', 'level', 'description', 'max_students', 'is_active', 'payment_type', 'student_price', 'academic_year_id']),
            [
                'user_id' => $teacherId,
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

        // dd($group->center_id, $user->center_id);
        // Ensure the group belongs to the user's center
        if ($group->center_id !== $user->center_id) {
            abort(403);
        }

        // Additional role-based authorization
        $userRoles = $user->roles->pluck('name')->toArray();
        $isAdmin = in_array('admin', $userRoles) || $user->is_admin;
        $isTeacher = in_array('teacher', $userRoles) || $user->type === 'teacher';
        $isAssistant = in_array('assistant', $userRoles) || $user->type === 'assistant';


        if (!$isAdmin && $isTeacher && $group->user_id !== $user->id) {
            abort(403);
        } elseif ($isAssistant && $group->user_id !== $user->teacher_id) {
            abort(403);
        } elseif (!$isAdmin && !$isTeacher && !$isAssistant) {
            // Legacy check for users without roles
            if (
                $group->user_id !== $user->id &&
                ($user->type !== 'assistant' || $group->user_id !== $user->teacher_id)
            ) {
                abort(403);
            }
        }

        $group->load(['schedules', 'assignedStudents', 'specialSessions', 'academicYear', 'user']);

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
                'teacher' => $group->user ? [
                    'id' => $group->user->id,
                    'name' => $group->user->name,
                    'email' => $group->user->email,
                    'phone' => $group->user->phone,
                    'subject' => $group->user->subject,
                    'bio' => $group->user->bio,
                    'profile_photo' => $group->user->profile_photo_path,
                ] : null,
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
        $user = Auth::user();

        // Ensure the group belongs to the user's center
        if ($group->center_id !== $user->center_id) {
            abort(403);
        }

        // Additional role-based authorization
        $userRoles = $user->roles->pluck('name')->toArray();
        $isAdmin = in_array('admin', $userRoles) || $user->is_admin;
        $isTeacher = in_array('teacher', $userRoles) || $user->type === 'teacher';
        $isAssistant = in_array('assistant', $userRoles) || $user->type === 'assistant';

        if (!$isAdmin && $group->user_id !== $user->id) {
            abort(403);
        }

        $group->load(['schedules', 'academicYear', 'user']);
        $academicYears = \App\Models\AcademicYear::getGroupedByLevel();

        // Get available teachers for the center
        $teachers = collect();
        $defaultTeacherId = $group->user_id;

        if ($user->center_id) {
            $center = $user->center;

            if ($center->type === CenterType::INDIVIDUAL) {
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

        return Inertia::render('Groups/Edit', [
            'group' => $group,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'defaultTeacherId' => $defaultTeacherId,
            'centerType' => $user->center->type ?? 'individual',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateGroupRequest $request, Group $group)
    {
        $user = Auth::user();

        // Ensure the group belongs to the user's center
        if ($group->center_id !== $user->center_id) {
            abort(403);
        }

        // Additional role-based authorization
        $userRoles = $user->roles->pluck('name')->toArray();
        $isAdmin = in_array('admin', $userRoles) || $user->is_admin;

        if (!$isAdmin && $group->user_id !== $user->id) {
            abort(403);
        }

        // Determine teacher ID based on center type and user role
        $teacherId = $request->input('teacher_id', $group->user_id);

        if ($isAdmin) {
            // Admin can assign group to any teacher in their center
            if ($teacherId !== $group->user_id) {
                // Validate teacher belongs to the same center
                $teacher = \App\Models\User::find($teacherId);
                if (!$teacher || $teacher->center_id !== $user->center_id) {
                    return back()->withErrors(['teacher_id' => 'المعلم المحدد غير موجود في المركز']);
                }
            }
        } else {
            // Teachers can only update their own groups
            $teacherId = $group->user_id;
        }

        $group->update(array_merge(
            $request->only([
                'name',
                'subject',
                'level',
                'description',
                'max_students',
                'is_active',
                'payment_type',
                'student_price',
                'academic_year_id',
            ]),
            ['user_id' => $teacherId]
        ));

        // Delete existing schedules and create new ones
        $group->schedules()->delete();
        foreach ($request->schedules as $schedule) {
            $group->schedules()->create(array_merge($schedule, [
                'center_id' => $user->center_id,
            ]));
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
            'date',
            'start_time',
            'end_time',
            'description',
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
            'date',
            'start_time',
            'end_time',
            'description',
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
