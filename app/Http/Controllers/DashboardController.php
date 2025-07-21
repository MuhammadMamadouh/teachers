<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupSpecialSession;
use App\Models\Plan;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Prometheus\Facades\Prometheus;

class DashboardController extends Controller
{
    public const TEACHER = 'teacher';
    public const ASSISTANT = 'assistant';


    public function index()
    {
        $user = Auth::user();

        
        // Ensure user belongs to a center
        // if (!$user->center_id && !$user->is_admin) {
        //     return redirect()->route('center.setup');
        // }

        // Get the User model instance to access role methods
        $userModel = User::find($user->id);

        // Determine dashboard type based on user role
        // Priority: system admin > center owner > center admin > assistant > teacher
        if ($userModel->hasRole('system-admin')) {

            return $this->adminDashboard($userModel);
        }

        // Check if user is a center owner - redirect to center owner dashboard
        // if ($userModel->isCenterOwner() && $userModel->type !== self::ASSISTANT) {
        //     dd($user);
        //     return redirect()->route('center.owner.dashboard');
        // }

        // Check if user is a center admin (is_admin = true)
        if ($user->is_admin) {
            return $this->adminDashboard($userModel);
        }

        if ($user->type === 'assistant') {
            return $this->assistantDashboard($userModel);
        }

        return $this->teacherDashboard($userModel);


    }

    /**
     * Admin dashboard with center-wide reports.
     */
    private function adminDashboard(User $user)
    {
        $center = $user->center;
        if (!$center && !$user->is_admin) {
            return redirect()->route('center.setup');
        }

        // Get center-wide statistics
        $totalTeachers = User::where('center_id', $user->center_id)
            ->where('type', self::TEACHER)
            ->where('is_admin', false)
            ->count();
        $totalAssistants = User::where('center_id', $user->center_id)
            ->where('type', self::ASSISTANT)
            ->count();

        $totalStudents = Student::where('center_id', $user->center_id)->count();
        $totalGroups = Group::where('center_id', $user->center_id)->count();

        // Get center subscription info
        $subscription = Subscription::where('center_id', $user->center_id)
            ->where('is_active', true)
            ->with('plan')
            ->first();

        // Get recent activities (last 7 days)
        $recentStudents = Student::where('center_id', $user->center_id)
            ->where('created_at', '>=', now()->subDays(7))
            ->with('user')
            ->latest()
            ->take(10)
            ->get();

        $recentGroups = Group::where('center_id', $user->center_id)
            ->where('created_at', '>=', now()->subDays(7))
            ->with('user')
            ->latest()
            ->take(10)
            ->get();

        // Get teachers with their stats
        $teachersWithStats = User::where('center_id', $user->center_id)
            ->where('type', self::TEACHER)
            ->withCount(['students', 'groups'])
            ->get();

        // Get all center users for the admin dashboard
        $students = Student::where('center_id', $user->center_id)
            ->with('user')
            ->get();

        $groups = Group::where('center_id', $user->center_id)
            ->with('user')
            ->get();

        $teachers = User::where('center_id', $user->center_id)
            ->where('type', self::TEACHER)
            ->where('is_admin', false)
            ->get();

        $assistants = User::where('center_id', $user->center_id)
            ->where('type', self::ASSISTANT)
            ->get();

        // Get subscription limits for the admin/center
        $subscriptionLimits = $user->getSubscriptionLimits();
        // dd($subscriptionLimits);
        return Inertia::render('Dashboard', [
            'center' => $center,
            'students' => $students,
            'groups' => $groups,
            'teachers' => $teachers,
            'assistants' => $assistants,
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $totalStudents,
            'canAddStudents' => $user->canAddStudents(),
            'availablePlans' => [],
            'stats' => [
                'totalTeachers' => $totalTeachers,
                'totalAssistants' => $totalAssistants,
                'totalStudents' => $totalStudents,
                'totalGroups' => $totalGroups,
            ],
            'subscription' => $subscription,
            'recentStudents' => $recentStudents,
            'recentGroups' => $recentGroups,
            'teachersWithStats' => $teachersWithStats,
        ]);
    }

    /**
     * Teacher dashboard with subscription info.
     */
    private function teacherDashboard(User $user): Response
    {
        $subscriptionLimits = $user->getSubscriptionLimits();
        $currentStudentCount = $user->getStudentCount();
        $availablePlans = Plan::where('max_students', '>', $subscriptionLimits['max_students'])
            ->orderBy('max_students')
            ->get();

        // Get teacher's students and groups
        // $students = Student::where('center_id', $user->center_id)
        //     ->where('user_id', $user->id)
        //     ->with('user')
        //     ->get();

        // $groups = Group::where('center_id', $user->center_id)
        //     ->where('user_id', $user->id)
        //     ->with('user')
        //     ->get();

        return Inertia::render('Dashboard', [
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => $user->canAddStudents(),
            'availablePlans' => $availablePlans,
            // 'students' => $students,
            // 'groups' => $groups,
        ]);
    }

    /**
     * Assistant dashboard with limited information.
     */
    private function assistantDashboard(User $user): Response
    {
        // Get the main teacher
        $teacher = $user->teacher;

        if (!$teacher) {
            return Inertia::render('Dashboard', [
                'error' => 'No teacher found for this assistant',
                'subscriptionLimits' => [
                    'max_students' => 0,
                    'has_active_subscription' => false,
                ],
                'currentStudentCount' => 0,
                'canAddStudents' => false,
                'availablePlans' => [],
                'isAssistant' => true,
                'teacherName' => '',
            ]);
        }

        $subscriptionLimits = $teacher->getSubscriptionLimits();
        $currentStudentCount = $teacher->getStudentCount();

        // Get teacher's students and groups for the assistant
        $students = Student::where('center_id', $user->center_id)
            ->where('user_id', $teacher->id)
            ->with('user')
            ->get();

        $groups = Group::where('center_id', $user->center_id)
            ->where('user_id', $teacher->id)
            ->with('user')
            ->get();

        return Inertia::render('Dashboard', [
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => false, // Assistants can't add students directly
            'availablePlans' => [], // Assistants don't need to see upgrade options
            'isAssistant' => true,
            'teacherName' => $teacher->name,
            'students' => $students,
            'groups' => $groups,
        ]);
    }

    /**
     * Display teacher's calendar view
     */
    public function calendar(): Response
    {
        $user = Auth::user();

        // Get all groups with schedules and special sessions
        $groups = Group::where('user_id', $user->id)
            ->with(['schedules', 'specialSessions'])
            ->get();
            
        return Inertia::render('Dashboard/Calendar', [
            'groups' => $groups,
        ]);
    }

    /**
     * Get all calendar events for the teacher
     */
    public function getCalendarEvents(Request $request)
    {
        $user = Auth::user();
        $start = $request->input('start');
        $end = $request->input('end');

        $events = [];

        // Get all teacher's groups
        $groups = Group::where('user_id', $user->id)->with(['schedules', 'specialSessions'])->get();

        foreach ($groups as $group) {
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
                                'title' => $group->name,
                                'start' => $startDate->format('Y-m-d') . 'T' . $schedule->start_time,
                                'end' => $startDate->format('Y-m-d') . 'T' . $schedule->end_time,
                                'backgroundColor' => '#3b82f6',
                                'borderColor' => '#2563eb',
                                'extendedProps' => [
                                    'type' => 'recurring',
                                    'groupId' => $group->id,
                                    'groupName' => $group->name,
                                    'sessionType' => 'جلسة منتظمة',
                                ],
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
                    'title' => $group->name . ' - خاص',
                    'start' => $session->date->format('Y-m-d') . 'T' . $session->start_time,
                    'end' => $session->date->format('Y-m-d') . 'T' . $session->end_time,
                    'backgroundColor' => '#10b981',
                    'borderColor' => '#059669',
                    'extendedProps' => [
                        'description' => $session->description,
                        'type' => 'special',
                        'groupId' => $group->id,
                        'groupName' => $group->name,
                        'sessionType' => 'جلسة خاصة',
                        'sessionId' => $session->id,
                    ],
                    'editable' => false,
                ];
            }
        }

        return response()->json($events);
    }

    /**
     * Get today's sessions for the teacher
     */
    public function getTodaySessions()
    {
        $user = Auth::user();
        $today = now()->format('Y-m-d');
        $dayOfWeek = (int) now()->format('w');

        $sessions = [];

        // Get all teacher's groups
        $groups = Group::where('user_id', $user->id)->with(['schedules', 'specialSessions'])->get();

        foreach ($groups as $group) {
            // Add today's recurring sessions
            foreach ($group->schedules as $schedule) {
                if ($schedule->day_of_week == $dayOfWeek) {
                    $sessions[] = [
                        'group_name' => $group->name,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'type' => 'recurring',
                        'description' => 'جلسة منتظمة',
                        'group_id' => $group->id,
                    ];
                }
            }

            // Add today's special sessions
            $todaySpecialSessions = $group->specialSessions()
                ->where('date', $today)
                ->get();

            foreach ($todaySpecialSessions as $session) {
                $sessions[] = [
                    'group_name' => $group->name,
                    'start_time' => $session->start_time,
                    'end_time' => $session->end_time,
                    'type' => 'special',
                    'description' => $session->description ?: 'جلسة خاصة',
                    'group_id' => $group->id,
                ];
            }
        }

        // Sort sessions by start time
        usort($sessions, function ($a, $b) {
            return strcmp($a['start_time'], $b['start_time']);
        });

        return response()->json($sessions);
    }

    /**
     * Reset all data for a new term
     */
    public function resetTerm(Request $request)
    {
        $request->validate([
            'confirmation' => 'required|string|in:CONFIRM RESET',
        ]);

        $user = Auth::user();

        // Don't allow admin users to reset data
        if ($user->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'المديرون لا يمكنهم إعادة تعيين البيانات.',
            ], 403);
        }

        try {
            DB::transaction(function () use ($user) {
                // Get all groups belonging to the user
                $groupIds = Group::where('user_id', $user->id)->pluck('id')->toArray();

                if (empty($groupIds)) {
                    // No groups to delete, but still return success
                    return;
                }

                // Get all students belonging to the user
                $studentIds = Student::where('user_id', $user->id)->pluck('id')->toArray();

                // Delete in proper order to avoid foreign key constraints

                // 1. Delete group special sessions
                if (!empty($groupIds)) {
                    GroupSpecialSession::whereIn('group_id', $groupIds)->delete();
                }

                // 2. Delete group schedules
                if (!empty($groupIds)) {
                    DB::table('group_schedules')->whereIn('group_id', $groupIds)->delete();
                }

                // 3. Delete attendances
                if (!empty($groupIds)) {
                    DB::table('attendances')->whereIn('group_id', $groupIds)->delete();
                }

                // // 4. Delete group_student pivot records
                // if (!empty($groupIds)) {
                //     DB::table('group_student')->whereIn('group_id', $groupIds)->delete();
                // }

                // 5. Delete payments for user's students
                if (!empty($studentIds)) {
                    DB::table('payments')->whereIn('student_id', $studentIds)->delete();
                }

                // 6. Delete students (this will also cascade to related records)
                if (!empty($studentIds)) {
                    Student::whereIn('id', $studentIds)->delete();
                }

                // 7. Finally delete groups
                if (!empty($groupIds)) {
                    Group::whereIn('id', $groupIds)->delete();
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'تم إعادة تعيين جميع البيانات بنجاح. يمكنك الآن البدء في فصل دراسي جديد!',
            ]);

        } catch (\Exception $e) {
            Log::error('Term reset failed for user ' . $user->id . ': ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إعادة تعيين البيانات. يرجى المحاولة مرة أخرى.',
            ], 500);
        }
    }

    /**
     * Get comprehensive reports for the teacher
     */
    public function getReports()
    {
        $user = Auth::user();

        // If it's an assistant, get data for their teacher
        if ($user->type === 'assistant') {
            $teacher = $user->teacher;
            if (!$teacher) {
                return response()->json(['error' => 'No teacher found for this assistant'], 404);
            }
            $user = $teacher;
        }

        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Get group counts and student counts efficiently
        $groups = Group::where('user_id', $user->id)
            ->withCount('assignedStudents')
            ->withCount('schedules')
            ->get();
        
          

        $totalGroups = $groups->count();
        $totalStudentsInGroups = $groups->sum('assigned_students_count');
        $averageStudentsPerGroup = $totalGroups > 0 ? round($totalStudentsInGroups / $totalGroups, 1) : 0;

        // total students in no group
        $totalStudentsWithoutGroup = Student::where('user_id', $user->id)
            ->whereNull('group_id')
            ->count();

        // Financial Reports
        $totalExpectedMonthlyIncome = $groups->where('payment_type', 'monthly')->sum(function ($group) {
            return $group->assigned_students_count * $group->student_price;
        });

        $totalExpectedPerSessionIncome = $groups->where('payment_type', 'per_session')->sum(function ($group) {
            return $group->assigned_students_count * $group->student_price * $group->schedules_count * 4; // 4 weaks = 1 month
        });

        $totalIncome = $totalExpectedMonthlyIncome + $totalExpectedPerSessionIncome;

        // Get actual collected payments
        $totalCollectedPayments = DB::table('payments')
            ->join('students', 'payments.student_id', '=', 'students.id')
            ->where('students.user_id', $user->id)
            ->where('students.group_id', '!=', null)
            ->where('payments.is_paid', true)
            ->sum('payments.amount');

        // Get pending payments (for current month)
        $paidStudentsThisMonth = DB::table('payments')
            ->join('students', 'payments.student_id', '=', 'students.id')
            ->where('students.user_id', $user->id)
            // ->where('payments.payment_type', 'per_session')
            ->whereYear('payments.related_date', $currentYear)
            ->whereMonth('payments.related_date', $currentMonth)
            ->where('payments.is_paid', true)
            ->count();

            // dd($paidStudentsThisMonth);


        $pendingPayments = $totalIncome - $totalCollectedPayments;

        // Collection rate
        $collectionRate = $totalStudentsInGroups > 0 ? round(($totalCollectedPayments / $totalIncome) * 100, 1) : 0;

        // Average student price
        // $averageStudentPrice = $groups->avg('student_price') ?: 0;

        // Recent payments (last 10)
        $recentPayments = DB::table('payments')
            ->join('students', 'payments.student_id', '=', 'students.id')
            ->join('groups', 'payments.group_id', '=', 'groups.id')
            ->where('students.user_id', $user->id)
            ->where('payments.is_paid', true)
            ->orderBy('payments.paid_at', 'desc')
            ->select(
                'students.name as student_name',
                'groups.name as group_name',
                'payments.amount',
                'payments.paid_at'
            )
            ->limit(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'student_name' => $payment->student_name,
                    'group_name' => $payment->group_name,
                    'amount' => $payment->amount,
                    'paid_date' => \Carbon\Carbon::parse($payment->paid_at)->format('Y-m-d'),
                ];
            });

        // Attendance Reports
        // $totalSessionsThisMonth = DB::table('attendances')
        //     ->join('groups', 'attendances.group_id', '=', 'groups.id')
        //     ->where('groups.user_id', $user->id)
        //     ->whereMonth('attendances.date', $currentMonth)
        //     ->whereYear('attendances.date', $currentYear)
        //     ->distinct(['attendances.date', 'attendances.group_id'])
        //     ->count();

        // $totalAttendancesThisMonth = DB::table('attendances')
        //     ->join('groups', 'attendances.group_id', '=', 'groups.id')
        //     ->where('groups.user_id', $user->id)
        //     ->where('attendances.is_present', true)
        //     ->whereMonth('attendances.date', $currentMonth)
        //     ->whereYear('attendances.date', $currentYear)
        //     ->count();

        // $totalPossibleAttendances = DB::table('attendances')
        //     ->join('groups', 'attendances.group_id', '=', 'groups.id')
        //     ->where('groups.user_id', $user->id)
        //     ->whereMonth('attendances.date', $currentMonth)
        //     ->whereYear('attendances.date', $currentYear)
        //     ->count();

        // $overallAttendanceRate = $totalPossibleAttendances > 0 ?
        //     round(($totalAttendancesThisMonth / $totalPossibleAttendances) * 100, 1) : 0;

        // $averageAttendancePerSession = $totalSessionsThisMonth > 0 ?
        //     round($totalAttendancesThisMonth / $totalSessionsThisMonth, 1) : 0;

        // Top performing groups (by attendance rate and monthly income)
        // $attendanceByGroup = DB::table('attendances')
        //     ->select('group_id',
        //         DB::raw('COUNT(*) as total'),
        //         DB::raw('SUM(CASE WHEN is_present = 1 THEN 1 ELSE 0 END) as present')
        //     )
        //     ->whereIn('group_id', $groups->pluck('id'))
        //     ->whereMonth('date', $currentMonth)
        //     ->whereYear('date', $currentYear)
        //     ->groupBy('group_id')
        //     ->get()
        //     ->keyBy('group_id');

        // $topGroups = $groups->map(function ($group) use ($attendanceByGroup) {
        //     $att = $attendanceByGroup[$group->id] ?? null;
        //     $totalAttendances = $att ? $att->total : 0;
        //     $presentAttendances = $att ? $att->present : 0;
        //     $attendanceRate = $totalAttendances > 0 ? round(($presentAttendances / $totalAttendances) * 100, 1) : 0;
        //     $monthlyIncome = $group->payment_type === 'monthly' ?
        //         $group->assigned_students_count * $group->student_price : 0;
        //     return [
        //         'id' => $group->id,
        //         'name' => $group->name,
        //         'students_count' => $group->assigned_students_count,
        //         'attendance_rate' => $attendanceRate,
        //         'monthly_income' => $monthlyIncome,
        //     ];
        // })->sortByDesc('attendance_rate')->take(3)->values();

        return response()->json([
            'financial' => [
                'total_expected_monthly_income' => $totalExpectedMonthlyIncome,
                'total_expected_persessions_income'=>$totalExpectedPerSessionIncome,
                'total_income' => $totalIncome,
                'total_collected_payments' => $totalCollectedPayments,
                'pending_payments' => $pendingPayments,
                'collection_rate' => $collectionRate,
                // 'average_student_price' => $averageStudentPrice,
                'recent_payments' => $recentPayments,
            ],
            'groups' => [
                'total_groups' => $totalGroups,
                'total_students_in_groups' => $totalStudentsInGroups,
                'total_students_without_group' => $totalStudentsWithoutGroup,
                'average_students_per_group' => $averageStudentsPerGroup,
                // 'top_groups' => $topGroups,
            ],
            // 'attendance' => [
            //     'total_sessions_this_month' => $totalSessionsThisMonth,
            //     'total_attendances_this_month' => $totalAttendancesThisMonth,
            //     'overall_attendance_rate' => $overallAttendanceRate,
            //     'average_attendance_per_session' => $averageAttendancePerSession,
            // ],
        ]);
    }

    /**
     * Get comprehensive admin reports for system overview
     */
    private function getAdminReports(): array
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Financial Overview
        $totalRevenue = DB::table('subscriptions')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.is_active', true)
            ->sum('plans.price');

        $monthlyRevenue = DB::table('subscriptions')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.is_active', true)
            ->whereMonth('subscriptions.created_at', $currentMonth)
            ->whereYear('subscriptions.created_at', $currentYear)
            ->sum('plans.price');

        // Growth metrics
        $lastMonthTeachers = User::where('is_admin', false)
            ->where('type', self::TEACHER)
            ->where('is_approved', true)
            ->whereMonth('created_at', $currentMonth - 1)
            ->whereYear('created_at', $currentYear)
            ->count();

        $thisMonthTeachers = User::where('is_admin', false)
            ->where('type', self::TEACHER)
            ->where('is_approved', true)
            ->whereMonth('created_at', $currentMonth)
            ->whereYear('created_at', $currentYear)
            ->count();

        $teacherGrowthRate = $lastMonthTeachers > 0 ?
            round((($thisMonthTeachers - $lastMonthTeachers) / $lastMonthTeachers) * 100, 1) : 0;

        // System Activity
        $totalGroups = DB::table('groups')->count();
        $totalSessions = DB::table('attendances')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->distinct('date', 'group_id')
            ->count();

        $totalAttendances = DB::table('attendances')
            ->where('is_present', true)
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->count();

        // Top performing teachers
        $topTeachers = User::where('is_admin', false)
            ->where('type', self::TEACHER)
            ->where('is_approved', true)
            ->withCount('students')
            ->with(['students', 'groups'])
            ->get()
            ->map(function ($teacher) use ($currentMonth, $currentYear) {
                $teacherGroups = $teacher->groups->pluck('id');

                $attendances = DB::table('attendances')
                    ->whereIn('group_id', $teacherGroups)
                    ->whereMonth('date', $currentMonth)
                    ->whereYear('date', $currentYear)
                    ->get();

                $totalSessions = $attendances->groupBy(['date', 'group_id'])->count();
                $totalPresent = $attendances->where('is_present', true)->count();
                $attendanceRate = $attendances->count() > 0 ?
                    round(($totalPresent / $attendances->count()) * 100, 1) : 0;

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'students_count' => $teacher->students_count,
                    'groups_count' => $teacher->groups->count(),
                    'sessions_this_month' => $totalSessions,
                    'attendance_rate' => $attendanceRate,
                ];
            })
            ->sortByDesc('students_count')
            ->take(5)
            ->values();

        // Plan distribution
        $planDistribution = Plan::withCount(['subscriptions' => function ($query) {
            $query->where('is_active', true);
        }])
            ->get()
            ->map(function ($plan) {
                return [
                    'name' => $plan->name,
                    'subscribers' => $plan->subscriptions_count,
                    'percentage' => 0, // Will be calculated below
                ];
            });

        $totalActiveSubscriptions = $planDistribution->sum('subscribers');
        $planDistribution = $planDistribution->map(function ($plan) use ($totalActiveSubscriptions) {
            $plan['percentage'] = $totalActiveSubscriptions > 0 ?
                round(($plan['subscribers'] / $totalActiveSubscriptions) * 100, 1) : 0;

            return $plan;
        });

        // Recent activity summary
        $recentPayments = DB::table('payments')
            ->join('students', 'payments.student_id', '=', 'students.id')
            ->join('users', 'students.user_id', '=', 'users.id')
            ->where('payments.is_paid', true)
            ->orderBy('payments.paid_at', 'desc')
            ->select(
                'students.name as student_name',
                'users.name as teacher_name',
                'payments.amount',
                'payments.paid_at'
            )
            ->limit(10)
            ->get()
            ->map(function ($payment) {
                return [
                    'student_name' => $payment->student_name,
                    'teacher_name' => $payment->teacher_name,
                    'amount' => $payment->amount,
                    'paid_date' => \Carbon\Carbon::parse($payment->paid_at)->format('Y-m-d'),
                ];
            });

        // System utilization
        $systemCapacity = DB::table('subscriptions')
            ->join('plans', 'subscriptions.plan_id', '=', 'plans.id')
            ->where('subscriptions.is_active', true)
            ->sum('plans.max_students');

        $usedCapacity = Student::count();
        $utilizationRate = $systemCapacity > 0 ?
            round(($usedCapacity / $systemCapacity) * 100, 1) : 0;

        // Registration trends (last 6 months)
        $registrationTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $count = User::where('is_admin', false)
                ->where('type', self::TEACHER)
                ->whereMonth('created_at', $month->month)
                ->whereYear('created_at', $month->year)
                ->count();

            $registrationTrends[] = [
                'month' => $month->format('M Y'),
                'count' => $count,
            ];
        }

        return [
            'financial' => [
                'total_revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'growth_rate' => $teacherGrowthRate,
                'recent_payments' => $recentPayments,
            ],
            'system' => [
                'total_groups' => $totalGroups,
                'total_sessions_this_month' => $totalSessions,
                'total_attendances_this_month' => $totalAttendances,
                'system_capacity' => $systemCapacity,
                'used_capacity' => $usedCapacity,
                'utilization_rate' => $utilizationRate,
            ],
            'teachers' => [
                'top_performers' => $topTeachers,
                'growth_rate' => $teacherGrowthRate,
                'registration_trends' => $registrationTrends,
            ],
            'plans' => [
                'distribution' => $planDistribution,
                'total_active_subscriptions' => $totalActiveSubscriptions,
            ],
        ];
    }
}
