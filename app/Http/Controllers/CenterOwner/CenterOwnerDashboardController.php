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
        
        // Get dashboard statistics
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
     * Show overview page.
     */
    public function overview()
    {
        $user = Auth::user();
        
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }

        $center = $user->center;
        
        // Get comprehensive statistics
        $statistics = $this->getDashboardStatistics($center);
        
        // Get teacher performance stats
        $teacherStats = $this->getTeacherPerformanceStats($center);
        
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
            ->with(['user:id,name,subject', 'students'])
            ->withCount('students')
            ->orderBy('name')
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
        
        // Get subscription with plan details
        $subscription = $center->activeSubscription()->with('plan')->first();
        
        // Get available plans
        $plans = Plan::orderBy('max_students')->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'description' => $plan->target_audience ?? 'خطة اشتراك متقدمة',
                'price' => $plan->price,
                'max_students' => $plan->max_students,
                'max_teachers' => $plan->max_teachers ?? 0,
                'max_groups' => $plan->max_students ?? 0, // Use max_students as groups limit
                'max_assistants' => $plan->max_assistants ?? 0,
                'features' => $plan->features ?? [
                    'إدارة الطلاب والمجموعات',
                    'تتبع الحضور والغياب',
                    'إدارة المدفوعات',
                    'التقارير والإحصائيات'
                ],
                'is_recommended' => $plan->is_featured ?? false,
            ];
        });
        
        // Process subscription data
        if ($subscription) {
            $subscription->days_remaining = $subscription->getDaysRemainingAttribute();
            $subscription->expires_at = $subscription->end_date;
            
            // Determine subscription status
            if (!$subscription->is_active) {
                $subscription->status = 'expired';
            } elseif ($subscription->isExpired()) {
                $subscription->status = 'expired';
                // Mark subscription as expired
                $subscription->update(['is_active' => false]);
            } elseif ($subscription->days_remaining <= 7 && $subscription->days_remaining > 0) {
                $subscription->status = 'expiring_soon';
            } else {
                $subscription->status = 'active';
            }
        }

        return Inertia::render('CenterOwner/Subscription', [
            'center' => $center->load('owner'),
            'subscription' => $subscription,
            'plans' => $plans,
            'usage' => [
                'teachers' => $center->teachers()->count(),
                'students' => $center->students()->count(),
                'groups' => $center->groups()->count(),
                'assistants' => $center->assistants()->count(),
                'max_teachers' => $subscription && $subscription->plan ? $subscription->plan->max_teachers : 0,
                'max_students' => $subscription && $subscription->plan ? $subscription->plan->max_students : 0,
                'max_groups' => $subscription && $subscription->plan ? $subscription->plan->max_students : 0,
                'max_assistants' => $subscription && $subscription->plan ? $subscription->plan->max_assistants : 0,
            ],
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

        $center->load('owner');

        // dd($center->toArray());

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
            'total_assistants' => $center->assistants()->count(),
            'active_groups' => $center->groups()->where('is_active', true)->count(),
            'active_students' => $center->students()->count(),
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
     * Calculate teacher efficiency.
     */
    private function calculateTeacherEfficiency(Center $center)
    {
        $totalTeachers = $center->teachers()->count();
        $totalStudents = $center->students()->count();
        
        return $totalTeachers > 0 ? round($totalStudents / $totalTeachers, 1) : 0;
    }

    /**
     * Calculate student retention.
     */
    private function calculateStudentRetention(Center $center)
    {
        // Placeholder implementation - calculate based on business logic
        return 95;
    }

    /**
     * Get chart data for overview.
     */
    private function getChartData(Center $center)
    {
        return [
            'revenue_chart' => $this->getRevenueChartData($center),
            'enrollment_chart' => $this->getEnrollmentChartData($center),
            'attendance_chart' => $this->getAttendanceChartData($center),
        ];
    }

    /**
     * Get trend data.
     */
    private function getTrendData(Center $center)
    {
        return [
            'student_growth' => $this->calculateStudentGrowth($center),
            'revenue_growth' => $this->getFinancialOverview($center)['revenue_growth'],
            'attendance_trend' => $this->getAttendanceTrend($center),
        ];
    }

    /**
     * Get alerts for dashboard.
     */
    private function getAlerts(Center $center)
    {
        $alerts = [];
        
        // Check for overdue payments
        $overduePayments = $center->students()
            ->join('payments', 'students.id', '=', 'payments.student_id')
            ->where('payments.is_paid', false)
            ->where('payments.paid_at', '<', Carbon::now())
            ->count();
        
        if ($overduePayments > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "يوجد {$overduePayments} دفعة متأخرة",
                'action' => 'متابعة المدفوعات المستحقة',
            ];
        }
        
        return $alerts;
    }

    // Report generation methods
    private function getEnrollmentReport(Center $center)
    {
        return [
            'total_enrolled' => $center->students()->count(),
            'monthly_enrollment' => $center->students()
                ->selectRaw('MONTH(created_at) as month, COUNT(*) as count')
                ->whereYear('created_at', Carbon::now()->year)
                ->groupBy('month')
                ->get(),
        ];
    }

    private function getAttendanceReport(Center $center)
    {
        return [
            'overall_rate' => $this->calculateOverallAttendanceRate($center),
            'by_group' => $this->getGroupAttendanceRates($center),
        ];
    }

    private function getPerformanceReport(Center $center)
    {
        return [
            'metrics' => $this->getPerformanceMetrics($center),
            'teacher_stats' => $this->getTeacherStats($center),
        ];
    }

    private function getTeacherPerformanceReport(Center $center)
    {
        return $center->teachers()
            ->with(['students.payments'])
            ->get()
            ->map(function ($teacher) {
                return [
                    'name' => $teacher->name,
                    'subject' => $teacher->subject,
                    'students_count' => $teacher->students->count(),
                    'total_revenue' => $teacher->students->sum(function ($student) {
                        return $student->payments->where('is_paid', true)->sum('amount');
                    }),
                ];
            });
    }

    private function getGrowthReport(Center $center)
    {
        $months = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = [
                'month' => $date->format('M Y'),
                'students' => $center->students()
                    ->whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
                'revenue' => $center->students()
                    ->join('payments', 'students.id', '=', 'payments.student_id')
                    ->where('payments.is_paid', true)
                    ->whereMonth('payments.paid_at', $date->month)
                    ->whereYear('payments.paid_at', $date->year)
                    ->sum('payments.amount'),
            ];
        }
        
        return $months;
    }

    private function getRevenueReport(Center $center)
    {
        return [
            'total_revenue' => $center->students()
                ->join('payments', 'students.id', '=', 'payments.student_id')
                ->where('payments.is_paid', true)
                ->sum('payments.amount'),
            'monthly_breakdown' => $this->getGrowthReport($center),
        ];
    }

    private function getPaymentsReport(Center $center)
    {
        return [
            'total_collected' => $center->students()
                ->join('payments', 'students.id', '=', 'payments.student_id')
                ->where('payments.is_paid', true)
                ->sum('payments.amount'),
            'total_pending' => $center->students()
                ->join('payments', 'students.id', '=', 'payments.student_id')
                ->where('payments.is_paid', false)
                ->sum('payments.amount'),
        ];
    }

    private function getOutstandingPaymentsReport(Center $center)
    {
        return $center->students()
            ->join('payments', 'students.id', '=', 'payments.student_id')
            ->where('payments.is_paid', false)
            ->get(['students.name', 'payments.amount', 'payments.paid_at'])
            ->groupBy('name')
            ->map(function ($payments, $studentName) {
                return [
                    'student_name' => $studentName,
                    'total_outstanding' => $payments->sum('amount'),
                    'overdue_count' => $payments->where('paid_at', '<', Carbon::now())->count(),
                ];
            });
    }

    private function getTeacherEarningsReport(Center $center)
    {
        return $center->teachers()
            ->with(['students.payments'])
            ->get()
            ->map(function ($teacher) {
                $totalEarnings = $teacher->students->sum(function ($student) {
                    return $student->payments->where('is_paid', true)->sum('amount');
                });
                
                return [
                    'name' => $teacher->name,
                    'subject' => $teacher->subject,
                    'total_earnings' => $totalEarnings,
                    'commission' => $totalEarnings * 0.7, // 70% commission
                ];
            });
    }

    private function getRevenueProjections(Center $center)
    {
        // Placeholder for revenue projections
        return [
            'next_month_projection' => $this->getFinancialOverview($center)['current_month_revenue'] * 1.1,
            'quarterly_projection' => $this->getFinancialOverview($center)['current_month_revenue'] * 3.2,
        ];
    }

    // Additional helper methods
    private function getRevenueChartData(Center $center)
    {
        return $this->getGrowthReport($center);
    }

    private function getEnrollmentChartData(Center $center)
    {
        return $this->getEnrollmentReport($center)['monthly_enrollment'];
    }

    private function getAttendanceChartData(Center $center)
    {
        return $this->getGroupAttendanceRates($center);
    }

    private function calculateStudentGrowth(Center $center)
    {
        $thisMonth = Carbon::now();
        $lastMonth = Carbon::now()->subMonth();
        
        $thisMonthStudents = $center->students()
            ->whereMonth('created_at', $thisMonth->month)
            ->whereYear('created_at', $thisMonth->year)
            ->count();
        
        $lastMonthStudents = $center->students()
            ->whereMonth('created_at', $lastMonth->month)
            ->whereYear('created_at', $lastMonth->year)
            ->count();
        
        return $lastMonthStudents > 0 
            ? round((($thisMonthStudents - $lastMonthStudents) / $lastMonthStudents) * 100, 1)
            : 0;
    }

    private function getAttendanceTrend(Center $center)
    {
        // Placeholder for attendance trend calculation
        return 85;
    }

    private function calculateOverallAttendanceRate(Center $center)
    {
        // Placeholder for overall attendance rate
        return 88;
    }

    private function getGroupAttendanceRates(Center $center)
    {
        return $center->groups()
            ->get()
            ->map(function ($group) {
                return [
                    'group_name' => $group->name,
                    'attendance_rate' => 90, // Placeholder
                ];
            });
    }

    private function getTeacherStats(Center $center)
    {
        return $center->teachers()
            ->with(['students'])
            ->get()
            ->map(function ($teacher) {
                return [
                    'name' => $teacher->name,
                    'student_count' => $teacher->students->count(),
                    'efficiency' => $teacher->students->count() > 0 ? 85 : 0, // Placeholder
                ];
            });
    }

    /**
     * Get teacher performance statistics for overview page.
     */
    private function getTeacherPerformanceStats(Center $center)
    {
        return $center->teachers()
            ->withCount(['students', 'groups'])
            ->get()
            ->map(function ($teacher) {
                // Calculate total revenue for this teacher
                $totalRevenue = Payment::whereHas('student', function ($query) use ($teacher) {
                    $query->where('user_id', $teacher->id);
                })
                ->where('is_paid', true)
                ->sum('amount');

                // Calculate attendance rate
                $attendanceRate = 0;
                if ($teacher->groups_count > 0) {
                    $totalAttendances = Attendance::whereHas('group', function ($query) use ($teacher) {
                        $query->where('user_id', $teacher->id);
                    })->count();
                    
                    $presentAttendances = Attendance::whereHas('group', function ($query) use ($teacher) {
                        $query->where('user_id', $teacher->id);
                    })->where('is_present', true)->count();
                    
                    $attendanceRate = $totalAttendances > 0 ? round(($presentAttendances / $totalAttendances) * 100, 1) : 0;
                }

                return [
                    'name' => $teacher->name,
                    'subject' => $teacher->subject,
                    'students_count' => $teacher->students_count,
                    'groups_count' => $teacher->groups_count,
                    'total_revenue' => $totalRevenue,
                    'attendance_rate' => $attendanceRate,
                ];
            });
    }

    /**
     * Get monthly trends data.
     */
    private function getMonthlyTrends(Center $center)
    {
        $trends = [];
        
        // Get data for the last 6 months
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            
            $studentsCount = $center->students()
                ->whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();
            
            $revenue = Payment::whereHas('student', function ($query) use ($center) {
                $query->where('center_id', $center->id);
            })
            ->where('is_paid', true)
            ->whereMonth('paid_at', $date->month)
            ->whereYear('paid_at', $date->year)
            ->sum('amount');
            
            // Calculate growth compared to previous month
            $growth = 0;
            if ($i < 5) {
                $prevMonthRevenue = Payment::whereHas('student', function ($query) use ($center) {
                    $query->where('center_id', $center->id);
                })
                ->where('is_paid', true)
                ->whereMonth('paid_at', $date->copy()->subMonth()->month)
                ->whereYear('paid_at', $date->copy()->subMonth()->year)
                ->sum('amount');
                
                if ($prevMonthRevenue > 0) {
                    $growth = round((($revenue - $prevMonthRevenue) / $prevMonthRevenue) * 100, 1);
                }
            }
            
            $trends[] = [
                'month' => $date->format('M Y'),
                'students' => $studentsCount,
                'revenue' => $revenue,
                'growth' => $growth,
            ];
        }
        
        return $trends;
    }
}
