<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Group;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Display attendance interface
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // Ensure user belongs to a center
        if (!$user->center_id) {
            return redirect()->route('center.setup');
        }

        // Determine which groups to show based on user role and permissions
        if ($user->type === 'admin') {
            // Admins can see all groups in their center
            $groups = Group::where('center_id', $user->center_id)
                          ->withCount('assignedStudents')
                          ->with('schedules')
                          ->get();
        } elseif ($user->type === 'teacher') {
            // Teachers can only see their own groups
            $groups = Group::where('user_id', $user->id)
                          ->where('center_id', $user->center_id)
                          ->withCount('assignedStudents')
                          ->with('schedules')
                          ->get();
        } elseif ($user->type === 'assistant') {
            // Assistants can see their teacher's groups
            $teacherId = $user->teacher_id;
            $groups = Group::where('user_id', $teacherId)
                          ->where('center_id', $user->center_id)
                          ->withCount('assignedStudents')
                          ->with('schedules')
                          ->get();
        } else {
            // Fallback for legacy users
            $groups = Group::where('user_id', $user->id)
                          ->where('center_id', $user->center_id)
                          ->withCount('assignedStudents')
                          ->with('schedules')
                          ->get();
        }

        $selectedGroup = null;
        $selectedDate = $request->get('date', now()->format('Y-m-d'));
        $students = collect();
        $attendances = collect();
        $searchTerm = $request->get('search', '');

        if ($request->has('group_id')) {
            $selectedGroup = Group::where('center_id', $user->center_id)
                ->where('id', $request->group_id)
                ->with('schedules')
                ->first();

            // Additional authorization check
            if ($selectedGroup && $user->type === 'teacher' && $selectedGroup->user_id !== $user->id) {
                $selectedGroup = null;
            } elseif ($selectedGroup && $user->type === 'assistant' && $selectedGroup->user_id !== $user->teacher_id) {
                $selectedGroup = null;
            }

            if ($selectedGroup) {
                // Build students query with search
                $studentsQuery = Student::where('group_id', $selectedGroup->id)
                    ->where('center_id', $user->center_id);

                if ($searchTerm) {
                    $studentsQuery->where(function ($query) use ($searchTerm) {
                        $query->where('name', 'like', '%' . $searchTerm . '%')
                              ->orWhere('phone', 'like', '%' . $searchTerm . '%');
                    });
                }

                // Paginate students (20 per page)
                $students = $studentsQuery->orderBy('name')
                    ->paginate(20)
                    ->withQueryString();

                // Get attendances for current page students
                $studentIds = $students->pluck('id')->toArray();
                $attendances = Attendance::where('group_id', $selectedGroup->id)
                    ->where('date', $selectedDate)
                    ->where('center_id', $user->center_id)
                    ->whereIn('student_id', $studentIds)
                    ->with('student')
                    ->get()
                    ->keyBy('student_id');
            }
        }

        return Inertia::render('Attendance/Index', [
            'groups' => $groups,
            'selectedGroup' => $selectedGroup,
            'selectedDate' => $selectedDate,
            'students' => $students,
            'attendances' => $attendances,
            'searchTerm' => $searchTerm,
        ]);
    }

    /**
     * Store attendance records
     */
    public function store(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.is_present' => 'required|boolean',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $group = Group::where('center_id', $user->center_id)
            ->where('id', $request->group_id)
            ->first();

        if (!$group) {
            abort(403);
        }

        // Additional authorization check
        if ($user->type === 'teacher' && $group->user_id !== $user->id) {
            abort(403);
        } elseif ($user->type === 'assistant' && $group->user_id !== $user->teacher_id) {
            abort(403);
        } elseif (!in_array($user->type, ['admin', 'teacher', 'assistant'])) {
            // Legacy check
            if ($group->user_id !== $user->id) {
                abort(403);
            }
        }

        DB::transaction(function () use ($request, $group, $user) {
            foreach ($request->attendances as $attendanceData) {
                // Verify student belongs to the center
                $student = Student::where('center_id', $user->center_id)
                    ->where('id', $attendanceData['student_id'])
                    ->first();

                if (!$student) {
                    continue;
                }

                // Create or update attendance record
                Attendance::updateOrCreate(
                    [
                        'student_id' => $attendanceData['student_id'],
                        'group_id' => $group->id,
                        'date' => $request->date,
                        'center_id' => $user->center_id,
                    ],
                    [
                        'is_present' => $attendanceData['is_present'],
                        'notes' => $attendanceData['notes'] ?? null,
                    ]
                );

                // Generate payment for per-session groups when student is present
                if ($group->payment_type === 'per_session' && $attendanceData['is_present']) {
                    Payment::updateOrCreate(
                        [
                            'group_id' => $group->id,
                            'student_id' => $student->id,
                            'related_date' => $request->date,
                        ],
                        [
                            'payment_type' => 'per_session',
                            'amount' => $group->student_price,
                            'is_paid' => true, // Payment created and marked as paid
                            'paid_at' => now(),
                            'notes' => $attendanceData['notes'] ?? null,
                        ]
                    );
                }
            }
        });

        return back()->with('success', 'تم حفظ سجل الحضور بنجاح');
    }

    /**
     * Show attendance summary for a group
     */
    public function summary(Group $group, Request $request)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));

        $attendances = Attendance::where('group_id', $group->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->with('student')
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date');

        $group->load('assignedStudents');

        return Inertia::render('Attendance/Summary', [
            'group' => $group,
            'attendances' => $attendances,
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Show last month's attendance report
     */
    public function lastMonthReport()
    {
        $startDate = now()->subMonth()->startOfMonth()->format('Y-m-d');
        $endDate = now()->subMonth()->endOfMonth()->format('Y-m-d');

        $groups = Group::where('user_id', Auth::id())
            ->with(['assignedStudents', 'attendances' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('date', [$startDate, $endDate])
                      ->with('student')
                      ->orderBy('date', 'desc');
            }])
            ->get();

        // Calculate summary statistics for each group
        $groupsWithStats = $groups->map(function ($group) use ($startDate, $endDate) {
            $attendances = $group->attendances;
            $totalStudents = $group->assignedStudents->count();
            $uniqueDates = $attendances->pluck('date')->unique()->count();

            $totalPresent = $attendances->where('is_present', true)->count();
            $totalAbsent = $attendances->where('is_present', false)->count();
            $totalSessions = $totalPresent + $totalAbsent;

            $attendanceRate = $totalSessions > 0 ? round(($totalPresent / $totalSessions) * 100, 1) : 0;

            return [
                'id' => $group->id,
                'name' => $group->name,
                'payment_type' => $group->payment_type,
                'total_students' => $totalStudents,
                'total_sessions' => $uniqueDates,
                'total_present' => $totalPresent,
                'total_absent' => $totalAbsent,
                'attendance_rate' => $attendanceRate,
                'attendances_by_date' => $attendances->groupBy('date'),
            ];
        });

        return Inertia::render('Attendance/LastMonthReport', [
            'groups' => $groupsWithStats,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'monthName' => now()->subMonth()->format('F Y'),
        ]);
    }

    /**
     * Show attendance report for a specific month
     */
    public function monthlyReport(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;
        $month = $request->month;
        $year = $request->year;

        $groups = Group::where('user_id', Auth::id())
            ->with(['assignedStudents', 'attendances' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('date', [$startDate, $endDate])
                      ->with('student')
                      ->orderBy('date', 'desc');
            }])
            ->get();

        // Calculate summary statistics for each group
        $groupsWithStats = $groups->map(function ($group) use ($startDate, $endDate) {
            $attendances = $group->attendances;
            $totalStudents = $group->assignedStudents->count();
            $uniqueDates = $attendances->pluck('date')->unique()->count();

            $totalPresent = $attendances->where('is_present', true)->count();
            $totalAbsent = $attendances->where('is_present', false)->count();
            $totalSessions = $totalPresent + $totalAbsent;

            $attendanceRate = $totalSessions > 0 ? round(($totalPresent / $totalSessions) * 100, 1) : 0;

            return [
                'id' => $group->id,
                'name' => $group->name,
                'payment_type' => $group->payment_type,
                'total_students' => $totalStudents,
                'total_sessions' => $uniqueDates,
                'total_present' => $totalPresent,
                'total_absent' => $totalAbsent,
                'attendance_rate' => $attendanceRate,
                'attendances_by_date' => $attendances->groupBy('date'),
            ];
        });

        $monthNames = [
            1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
            5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
            9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر',
        ];

        return Inertia::render('Attendance/MonthlyReport', [
            'groups' => $groupsWithStats,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'month' => $month,
            'year' => $year,
            'monthName' => $monthNames[$month] . ' ' . $year,
        ]);
    }
}
