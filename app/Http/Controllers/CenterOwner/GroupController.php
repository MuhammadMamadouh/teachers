<?php

namespace App\Http\Controllers\CenterOwner;

use App\Enums\CenterType;
use App\Enums\EducationLevel;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignStudentsRequest;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Models\Group;
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

        // Get all groups in the center
        $query = Group::where('center_id', $user->center_id)
            ->with(['user', 'schedules', 'assignedStudents', 'academicYear']);

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

        // Apply level filter
        if ($request->filled('level')) {
            $query->where('level', $request->level);
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
                'students_count' => $group->assignedStudents->count(),
                'expected_monthly_income' => $group->getExpectedMonthlyIncome(),
                'payment_type_label' => $group->getPaymentTypeLabel(),
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

        return Inertia::render('CenterOwner/Groups/Index', [
            'groups' => $transformedGroups,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'educationLevels' => EducationLevel::forFrontend(),
            'filters' => $request->only(['search', 'academic_year_id', 'teacher_id', 'level']),
            'centerType' => $user->center->type ?? 'individual',
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

        return Inertia::render('CenterOwner/Groups/Create', [
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'educationLevels' => EducationLevel::forFrontend(),
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

       
        // Determine teacher ID
        $teacherId = $request->input('teacher_id');

        if (!$teacherId) {
            if ($user->center->type === CenterType::INDIVIDUAL) {
                $teacherId = $user->id;
            } else {
                return back()->withErrors(['teacher_id' => 'يجب اختيار معلم للمجموعة']);
            }
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

        return redirect()->route('center.owner.groups.index')->with('success', 'تم إنشاء المجموعة بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(Group $group)
    {
        $user = Auth::user();

        // Ensure user is a center owner and group belongs to the center
        if (!$user->center_id || !$user->is_admin || $group->center_id !== $user->center_id) {
            abort(403);
        }

        $group->load(['schedules', 'assignedStudents', 'specialSessions', 'academicYear', 'user']);

        // Get students from the center that match the group's academic year
        $availableStudents = Student::whereHas('user', function ($query) use ($user) {
            $query->where('center_id', $user->center_id);
        })
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

        return Inertia::render('CenterOwner/Groups/Show', [
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

        // Ensure user is a center owner and group belongs to the center
        if (!$user->center_id || !$user->is_admin || $group->center_id !== $user->center_id) {
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

        return Inertia::render('CenterOwner/Groups/Edit', [
            'group' => $group,
            'academicYears' => $academicYears,
            'teachers' => $teachers,
            'educationLevels' => EducationLevel::forFrontend(),
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

        // Ensure user is a center owner and group belongs to the center
        if (!$user->center_id || !$user->is_admin || $group->center_id !== $user->center_id) {
            abort(403);
        }

        // Determine teacher ID
        $teacherId = $request->input('teacher_id', $group->user_id);

        if ($teacherId !== $group->user_id) {
            // Validate teacher belongs to the same center
            $teacher = \App\Models\User::find($teacherId);
            if (!$teacher || $teacher->center_id !== $user->center_id) {
                return back()->withErrors(['teacher_id' => 'المعلم المحدد غير موجود في المركز']);
            }
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

        return redirect()->route('center.owner.groups.index')->with('success', 'تم تحديث المجموعة بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group)
    {
        $user = Auth::user();

        // Ensure user is a center owner and group belongs to the center
        if (!$user->center_id || !$user->is_admin || $group->center_id !== $user->center_id) {
            abort(403);
        }

        $group->delete();

        return redirect()->route('center.owner.groups.index')->with('success', 'تم حذف المجموعة بنجاح');
    }

    /**
     * Assign students to a group
     */
    public function assignStudents(AssignStudentsRequest $request, Group $group)
    {
        $user = Auth::user();

        // Ensure user is a center owner and group belongs to the center
        if (!$user->center_id || !$user->is_admin || $group->center_id !== $user->center_id) {
            abort(403);
        }

        // Verify that all students belong to the center
        $students = Student::whereHas('user', function ($query) use ($user) {
            $query->where('center_id', $user->center_id);
        })
            ->whereIn('id', $request->student_ids)
            ->get();

        if ($students->count() !== count($request->student_ids)) {
            abort(403, 'يمكنك فقط تعيين طلاب المركز');
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
            ->whereHas('user', function ($query) use ($user) {
                $query->where('center_id', $user->center_id);
            })
            ->whereNull('group_id') // Extra safety check
            ->update(['group_id' => $group->id]);

        return back()->with('success', 'تم تعيين الطلاب للمجموعة بنجاح');
    }

    /**
     * Remove a student from a group
     */
    public function removeStudent(Group $group, Student $student)
    {
        $user = Auth::user();

        // Ensure user is a center owner and group/student belong to the center
        if (!$user->center_id || !$user->is_admin || $group->center_id !== $user->center_id || $student->user->center_id !== $user->center_id) {
            abort(403);
        }

        // Remove student from group by setting group_id to null
        $student->group_id = null;
        $student->save();

        return back()->with('success', 'تم إزالة الطالب من المجموعة بنجاح');
    }
}
