<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Student;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        if ($user->is_admin) {
            return $this->adminDashboard();
        }
        
        return $this->teacherDashboard($user);
    }
    
    /**
     * Admin dashboard with system reports.
     */
    private function adminDashboard(): Response
    {
        // System statistics
        $totalUsers = User::where('is_admin', false)->count();
        $approvedUsers = User::where('is_admin', false)->where('is_approved', true)->count();
        $pendingUsers = User::where('is_admin', false)->where('is_approved', false)->count();
        $totalStudents = Student::count();
        
        // Plan statistics
        $planStats = Plan::withCount('subscriptions')
            ->get()
            ->map(function ($plan) {
                return [
                    'name' => $plan->name,
                    'max_students' => $plan->max_students,
                    'price' => $plan->price_per_month,
                    'subscribers' => $plan->subscriptions_count,
                    'is_default' => $plan->is_default,
                ];
            });
        
        // Recent activity
        $recentUsers = User::where('is_admin', false)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'is_approved', 'created_at']);
        
        // Usage statistics
        $usageStats = User::where('is_admin', false)
            ->where('is_approved', true)
            ->with(['students', 'activeSubscription.plan'])
            ->get()
            ->map(function ($user) {
                $subscription = $user->activeSubscription;
                $maxStudents = $subscription && $subscription->plan ? $subscription->plan->max_students : 0;
                return [
                    'student_count' => $user->students->count(),
                    'max_students' => $maxStudents,
                    'plan_name' => $subscription && $subscription->plan ? $subscription->plan->name : 'No Plan',
                ];
            });
        
        return Inertia::render('Admin/Dashboard', [
            'systemStats' => [
                'total_users' => $totalUsers,
                'approved_users' => $approvedUsers,
                'pending_users' => $pendingUsers,
                'total_students' => $totalStudents,
            ],
            'planStats' => $planStats,
            'recentUsers' => $recentUsers,
            'usageStats' => $usageStats,
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
        
        return Inertia::render('Dashboard', [
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => $user->canAddStudents(),
            'availablePlans' => $availablePlans,
        ]);
    }
}
