<?php

namespace App\Http\Controllers\CenterOwner;

use App\Http\Controllers\Controller;
use App\Models\Center;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\Subscription;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class CenterOwnerDashboardController extends Controller
{
    /**
     * Show the center owner's main dashboard.
     */
    public function index()
    {
        $user = Auth::user();
        
        // Ensure user is a center owner
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        if (!$center) {
            return redirect()->route('center.setup');
        }

        // Get comprehensive dashboard statistics
        $statistics = $this->getDashboardStatistics($center);
        
        // Get recent activity
        $recentActivity = $this->getRecentActivity($center);
        
        // Get financial overview
        $financialOverview = $this->getFinancialOverview($center);
        
        // Get performance metrics
        $performanceMetrics = $this->getPerformanceMetrics($center);

        return Inertia::render('CenterOwner/Dashboard', [
            'center' => $center,
            'statistics' => $statistics,
            'recentActivity' => $recentActivity,
            'financialOverview' => $financialOverview,
            'performanceMetrics' => $performanceMetrics,
        ]);
    }

    /**
     * Show center overview page.
     */
    public function overview()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        $statistics = $this->getDashboardStatistics($center);
        
        // Get detailed breakdown by teacher
        $teacherStats = $this->getTeacherStatistics($center);
        
        // Get monthly trends
        $monthlyTrends = $this->getMonthlyTrends($center);

        return Inertia::render('CenterOwner/Overview', [
            'center' => $center,
            'statistics' => $statistics,
            'teacherStats' => $teacherStats,
            'monthlyTrends' => $monthlyTrends,
        ]);
    }

    /**
     * Show teachers management page.
     */
    public function teachers()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        
        // Get all teachers with their statistics
        $teachers = $center->teachers()
            ->with(['students', 'groups', 'roles'])
            ->withCount(['students', 'groups'])
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'phone' => $teacher->phone,
                    'subject' => $teacher->subject,
                    'students_count' => $teacher->students_count,
                    'groups_count' => $teacher->groups_count,
                    'is_active' => $teacher->is_active,
                    'is_approved' => $teacher->is_approved,
                    'created_at' => $teacher->created_at,
                    'last_login' => $teacher->last_login_at ?? null,
                    'total_revenue' => $this->getTeacherRevenue($teacher),
                    'attendance_rate' => $this->getTeacherAttendanceRate($teacher),
                ];
            });

        return Inertia::render('CenterOwner/Teachers', [
            'center' => $center,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Show students management page.
     */
    public function students()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        
        // Get all students with their details
        $students = $center->students()
            ->with(['user', 'group', 'payments'])
            ->withCount('payments')
            ->paginate(20);

        // Transform students data to include additional metrics
        $students->getCollection()->transform(function ($student) {
            $totalPaid = $student->payments()->where('is_paid', true)->sum('amount');
            $totalDue = $student->payments()->where('is_paid', false)->sum('amount');
            
            return [
                'id' => $student->id,
                'name' => $student->name,
                'phone' => $student->phone,
                'guardian_phone' => $student->guardian_phone,
                'teacher' => $student->user ? [
                    'id' => $student->user->id,
                    'name' => $student->user->name,
                ] : null,
                'group' => $student->group ? [
                    'id' => $student->group->id,
                    'name' => $student->group->name,
                    'subject' => $student->group->subject,
                ] : null,
                'total_paid' => $totalPaid,
                'total_due' => $totalDue,
                'payments_count' => $student->payments_count,
                'academic_year' => $student->academic_year,
                'created_at' => $student->created_at,
                'attendance_rate' => $this->getStudentAttendanceRate($student),
            ];
        });

        return Inertia::render('CenterOwner/Students', [
            'center' => $center,
            'students' => $students,
            'summary' => [
                'total_students' => $center->students()->count(),
                'active_students' => $center->students()->whereHas('group')->count(),
                'total_revenue' => $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
                    ->where('payments.is_paid', true)->sum('payments.amount'),
                'pending_payments' => $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
                    ->where('payments.is_paid', false)->sum('payments.amount'),
            ],
        ]);
    }

    /**
     * Show groups management page.
     */
    public function groups()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        
        // Get all groups with their details
        $groups = $center->groups()
            ->with(['user', 'students'])
            ->withCount('students')
            ->get()
            ->map(function ($group) {
                $totalRevenue = $group->students()->join('payments', 'students.id', '=', 'payments.student_id')
                    ->where('payments.is_paid', true)->sum('payments.amount');
                
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'subject' => $group->subject,
                    'level' => $group->level,
                    'teacher' => $group->user ? [
                        'id' => $group->user->id,
                        'name' => $group->user->name,
                    ] : null,
                    'students_count' => $group->students_count,
                    'max_students' => $group->max_students,
                    'student_price' => $group->student_price,
                    'payment_type' => $group->payment_type,
                    'total_revenue' => $totalRevenue,
                    'start_date' => $group->start_date,
                    'is_active' => $group->is_active,
                    'created_at' => $group->created_at,
                ];
            });

        return Inertia::render('CenterOwner/Groups', [
            'center' => $center,
            'groups' => $groups,
            'summary' => [
                'total_groups' => $groups->count(),
                'active_groups' => $groups->where('is_active', true)->count(),
                'total_capacity' => $groups->sum('max_students'),
                'current_enrollment' => $groups->sum('students_count'),
                'utilization_rate' => $groups->sum('max_students') > 0 
                    ? round(($groups->sum('students_count') / $groups->sum('max_students')) * 100, 1) 
                    : 0,
            ],
        ]);
    }

    /**
     * Show reports page.
     */
    public function reports()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        
        // Generate comprehensive reports
        $reports = [
            'enrollment' => $this->getEnrollmentReport($center),
            'attendance' => $this->getAttendanceReport($center),
            'performance' => $this->getPerformanceReport($center),
            'teacher_performance' => $this->getTeacherPerformanceReport($center),
            'growth' => $this->getGrowthReport($center),
        ];

        return Inertia::render('CenterOwner/Reports', [
            'center' => $center,
            'reports' => $reports,
        ]);
    }

    /**
     * Show financial reports page.
     */
    public function financial()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        
        // Generate financial reports
        $financialReports = [
            'revenue' => $this->getRevenueReport($center),
            'payments' => $this->getPaymentsReport($center),
            'outstanding' => $this->getOutstandingPaymentsReport($center),
            'teacher_earnings' => $this->getTeacherEarningsReport($center),
            'projections' => $this->getRevenueProjections($center),
        ];

        return Inertia::render('CenterOwner/Financial', [
            'center' => $center,
            'financialReports' => $financialReports,
        ]);
    }

    /**
     * Show subscription management page.
     */
    public function subscription()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        $subscription = $center->activeSubscription;
        $availablePlans = Plan::where('is_active', true)->orderBy('max_students')->get();
        
        // Get subscription usage statistics
        $usage = [
            'current_teachers' => $center->teachers()->count(),
            'current_students' => $center->students()->count(),
            'current_groups' => $center->groups()->count(),
            'max_teachers' => $subscription ? $subscription->plan->max_teachers : 0,
            'max_students' => $subscription ? $subscription->plan->max_students : 0,
            'max_groups' => $subscription ? $subscription->plan->max_groups : 0,
        ];

        return Inertia::render('CenterOwner/Subscription', [
            'center' => $center,
            'subscription' => $subscription,
            'availablePlans' => $availablePlans,
            'usage' => $usage,
        ]);
    }

    /**
     * Show settings page.
     */
    public function settings()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;

        return Inertia::render('CenterOwner/Settings', [
            'center' => $center,
        ]);
    }

    /**
     * Get dashboard statistics.
     */
    private function getDashboardStatistics(Center $center)
    {
        return [
            'total_teachers' => $center->teachers()->count(),
            'total_students' => $center->students()->count(),
            'total_groups' => $center->groups()->count(),
            'active_groups' => $center->groups()->where('is_active', true)->count(),
            'total_revenue' => $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
                ->where('payments.is_paid', true)->sum('payments.amount'),
            'pending_payments' => $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
                ->where('payments.is_paid', false)->sum('payments.amount'),
            'this_month_revenue' => $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
                ->where('payments.is_paid', true)
                ->whereMonth('payments.paid_at', Carbon::now()->month)
                ->whereYear('payments.paid_at', Carbon::now()->year)
                ->sum('payments.amount'),
            'new_students_this_month' => $center->students()
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
        ];
    }

    /**
     * Get recent activity.
     */
    private function getRecentActivity(Center $center)
    {
        $recentStudents = $center->students()
            ->with(['user:id,name', 'group:id,name'])
            ->latest()
            ->limit(5)
            ->get(['id', 'name', 'user_id', 'group_id', 'created_at']);

        $recentPayments = Payment::whereHas('student', function ($query) use ($center) {
                $query->where('center_id', $center->id);
            })
            ->with(['student:id,name'])
            ->where('is_paid', true)
            ->whereNotNull('paid_at')
            ->latest('paid_at')
            ->limit(5)
            ->get(['id', 'student_id', 'amount', 'paid_at']);

        return [
            'recent_students' => $recentStudents,
            'recent_payments' => $recentPayments,
        ];
    }

    /**
     * Get financial overview.
     */
    private function getFinancialOverview(Center $center)
    {
        $currentMonth = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();

        $currentMonthRevenue = $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
            ->where('payments.is_paid', true)
            ->whereMonth('payments.paid_at', $currentMonth->month)
            ->whereYear('payments.paid_at', $currentMonth->year)
            ->sum('payments.amount');

        $lastMonthRevenue = $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
            ->where('payments.is_paid', true)
            ->whereMonth('payments.paid_at', $lastMonth->month)
            ->whereYear('payments.paid_at', $lastMonth->year)
            ->sum('payments.amount');

        $revenueGrowth = $lastMonthRevenue > 0 
            ? round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        return [
            'current_month_revenue' => $currentMonthRevenue,
            'last_month_revenue' => $lastMonthRevenue,
            'revenue_growth' => $revenueGrowth,
            'outstanding_payments' => $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
                ->where('payments.is_paid', false)
                ->sum('payments.amount'),
        ];
    }

    /**
     * Get performance metrics.
     */
    private function getPerformanceMetrics(Center $center)
    {
        $totalCapacity = $center->groups()->sum('max_students');
        $currentEnrollment = $center->students()->count();
        $utilizationRate = $totalCapacity > 0 ? round(($currentEnrollment / $totalCapacity) * 100, 1) : 0;

        return [
            'utilization_rate' => $utilizationRate,
            'average_group_size' => $center->groups()->count() > 0 
                ? round($center->students()->count() / $center->groups()->count(), 1) 
                : 0,
            'teacher_efficiency' => $this->calculateTeacherEfficiency($center),
            'student_retention' => $this->calculateStudentRetention($center),
        ];
    }

    /**
     * Helper methods for calculations
     */
    private function getTeacherRevenue(User $teacher)
    {
        return $teacher->students()->join('payments', 'students.id', '=', 'payments.student_id')
            ->where('payments.is_paid', true)->sum('payments.amount');
    }

    private function getTeacherAttendanceRate(User $teacher)
    {
        // Implementation depends on your attendance tracking system
        return 85; // Placeholder
    }

    private function getStudentAttendanceRate(Student $student)
    {
        // Implementation depends on your attendance tracking system
        return 90; // Placeholder
    }

    private function calculateTeacherEfficiency(Center $center)
    {
        // Calculate based on students per teacher ratio
        $totalTeachers = $center->teachers()->count();
        $totalStudents = $center->students()->count();
        
        return $totalTeachers > 0 ? round($totalStudents / $totalTeachers, 1) : 0;
    }

    private function calculateStudentRetention(Center $center)
    {
        // Calculate student retention rate (placeholder implementation)
        return 95; // Placeholder - implement based on your business logic
    }

    // Additional report methods would be implemented here
    private function getTeacherStatistics(Center $center) { return []; }
    private function getMonthlyTrends(Center $center) { return []; }
    private function getEnrollmentReport(Center $center) { return []; }
    private function getAttendanceReport(Center $center) { return []; }
    private function getPerformanceReport(Center $center) { return []; }
    private function getTeacherPerformanceReport(Center $center) { return []; }
    private function getGrowthReport(Center $center) { return []; }
    private function getRevenueReport(Center $center) { return []; }
    private function getPaymentsReport(Center $center) { return []; }
    private function getOutstandingPaymentsReport(Center $center) { return []; }
    private function getTeacherEarningsReport(Center $center) { return []; }
    private function getRevenueProjections(Center $center) { return []; }
}
