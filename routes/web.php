<?php

use App\Http\Controllers\Admin\AdminPlanController;
use App\Http\Controllers\Admin\AdminTeacherController;
use App\Http\Controllers\Admin\AdminFeedbackController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PendingApprovalController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Health check endpoint for monitoring and Docker
Route::get('/health', function () {
    $checks = [
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
        'version' => config('app.version', '1.0.0'),
    ];

    try {
        // Database connectivity check
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $checks['database'] = 'connected';
    } catch (\Exception $e) {
        $checks['database'] = 'disconnected';
        $checks['status'] = 'error';
    }

    try {
        // Redis connectivity check (if configured)
        if (config('database.redis.default.host')) {
            \Illuminate\Support\Facades\Redis::ping();
            $checks['redis'] = 'connected';
        }
    } catch (\Exception $e) {
        $checks['redis'] = 'disconnected';
    }

    $httpStatus = $checks['status'] === 'ok' ? 200 : 503;
    
    return response()->json($checks, $httpStatus);
});

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'plans' => \App\Models\Plan::orderBy('price')->get()->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'price' => $plan->price,
                'max_students' => $plan->max_students,
                'max_assistants' => $plan->max_assistants,
                'duration_days' => $plan->duration_days,
                'is_trial' => $plan->is_trial,
                'is_default' => $plan->is_default,
            ];
        }), 
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'onboarding', 'approved', 'subscription'])
    ->name('dashboard');

// Subscription management routes
Route::middleware(['auth'])->group(function () {
    Route::get('/subscription/expired', [SubscriptionController::class, 'expired'])->name('subscription.expired');
    Route::get('/subscription/plans', [SubscriptionController::class, 'plans'])->name('subscription.plans');
    Route::get('/subscription/status', [SubscriptionController::class, 'status'])->name('subscription.status');
    Route::post('/subscription/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe');
    
    // Onboarding routes
    Route::get('/onboarding', [\App\Http\Controllers\Auth\OnboardingController::class, 'show'])->name('onboarding.show');
    Route::post('/onboarding/complete', [\App\Http\Controllers\Auth\OnboardingController::class, 'complete'])->name('onboarding.complete');
});

// Dashboard calendar routes (for approved teachers)
Route::middleware(['auth', 'verified', 'onboarding', 'approved', 'not-admin', 'subscription'])->group(function () {
    Route::get('/dashboard/calendar', [DashboardController::class, 'calendar'])->name('dashboard.calendar');
    Route::get('/dashboard/calendar-events', [DashboardController::class, 'getCalendarEvents'])->name('dashboard.calendar-events');
    Route::get('/dashboard/today-sessions', [DashboardController::class, 'getTodaySessions'])->name('dashboard.today-sessions');
    Route::get('/dashboard/reports', [DashboardController::class, 'getReports'])->name('dashboard.reports');
    Route::post('/dashboard/reset-term', [DashboardController::class, 'resetTerm'])->name('dashboard.reset-term');
});

// Pending approval page - accessible by unapproved users
Route::get('/pending-approval', [PendingApprovalController::class, 'index'])
    ->middleware('auth')
    ->name('pending-approval');

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'index'])->name('admin.users');
    Route::post('/users/{user}/approve', [AdminController::class, 'approveUser'])->name('admin.users.approve');
    Route::delete('/users/{user}/reject', [AdminController::class, 'rejectUser'])->name('admin.users.reject');
    
    // Admin teacher management
    Route::resource('teachers', AdminTeacherController::class, ['as' => 'admin']);
    Route::post('/teachers/{teacher}/activate', [AdminTeacherController::class, 'activate'])->name('admin.teachers.activate');
    Route::post('/teachers/{teacher}/deactivate', [AdminTeacherController::class, 'deactivate'])->name('admin.teachers.deactivate');
    Route::post('/teachers/bulk-action', [AdminTeacherController::class, 'bulkAction'])->name('admin.teachers.bulk-action');
    
    // Admin plan management
    Route::resource('plans', AdminPlanController::class, ['as' => 'admin']);
    Route::post('/plans/{plan}/set-default', [AdminPlanController::class, 'setDefault'])->name('admin.plans.set-default');
    
    // Plan upgrade request management
    Route::get('/plan-upgrade-requests', [App\Http\Controllers\Admin\PlanUpgradeRequestController::class, 'index'])->name('admin.plan-upgrade-requests.index');
    Route::get('/plan-upgrade-requests/{planUpgradeRequest}', [App\Http\Controllers\Admin\PlanUpgradeRequestController::class, 'show'])->name('admin.plan-upgrade-requests.show');
    Route::post('/plan-upgrade-requests/{planUpgradeRequest}/approve', [App\Http\Controllers\Admin\PlanUpgradeRequestController::class, 'approve'])->name('admin.plan-upgrade-requests.approve');
    Route::post('/plan-upgrade-requests/{planUpgradeRequest}/reject', [App\Http\Controllers\Admin\PlanUpgradeRequestController::class, 'reject'])->name('admin.plan-upgrade-requests.reject');
    
    // Reports
    Route::get('/reports/governorates', [ReportsController::class, 'governorates'])->name('admin.reports.governorates');
    
    // Admin feedback management
    Route::get('/feedback', [AdminFeedbackController::class, 'index'])->name('admin.feedback.index');
    Route::get('/feedback/{feedback}', [AdminFeedbackController::class, 'show'])->name('admin.feedback.show');
    Route::patch('/feedback/{feedback}/status', [AdminFeedbackController::class, 'updateStatus'])->name('admin.feedback.update-status');
    Route::patch('/feedback/{feedback}/reply', [AdminFeedbackController::class, 'reply'])->name('admin.feedback.reply');
    Route::delete('/feedback/{feedback}', [AdminFeedbackController::class, 'destroy'])->name('admin.feedback.destroy');
    Route::patch('/feedback/bulk-status', [AdminFeedbackController::class, 'bulkUpdateStatus'])->name('admin.feedback.bulk-status');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Assistant management routes (only for teachers)
    Route::middleware(['manage-assistants'])->group(function () {
        Route::get('/assistants', [App\Http\Controllers\AssistantController::class, 'index'])->name('assistants.index');
        Route::post('/assistants', [App\Http\Controllers\AssistantController::class, 'store'])
            ->middleware('assistant-limit')
            ->name('assistants.store');
        
        Route::middleware('assistant-ownership')->group(function () {
            Route::get('/assistants/{assistant}/edit', [App\Http\Controllers\AssistantController::class, 'edit'])->name('assistants.edit');
            Route::put('/assistants/{assistant}', [App\Http\Controllers\AssistantController::class, 'update'])->name('assistants.update');
            Route::delete('/assistants/{assistant}', [App\Http\Controllers\AssistantController::class, 'destroy'])->name('assistants.destroy');
            Route::post('/assistants/{assistant}/resend-invitation', [App\Http\Controllers\AssistantController::class, 'resendInvitation'])->name('assistants.resend-invitation');
        });
    });
    
    // Student management routes (only for approved non-admin users)
    Route::middleware(['onboarding', 'approved', 'not-admin', 'scope-by-teacher', 'subscription'])->group(function () {
        Route::resource('students', StudentController::class);
        Route::resource('groups', GroupController::class);
        
        // Group student assignment routes
        Route::post('/groups/{group}/assign-students', [GroupController::class, 'assignStudents'])->name('groups.assign-students');
        Route::delete('/groups/{group}/students/{student}', [GroupController::class, 'removeStudent'])->name('groups.remove-student');
        
        // Group calendar and special sessions routes
        Route::get('/groups/{group}/calendar', [GroupController::class, 'calendar'])->name('groups.calendar');
        Route::get('/groups/{group}/calendar-events', [GroupController::class, 'getCalendarEvents'])->name('groups.calendar-events');
        Route::post('/groups/{group}/special-sessions', [GroupController::class, 'storeSpecialSession'])->name('groups.special-sessions.store');
        Route::put('/groups/{group}/special-sessions/{specialSession}', [GroupController::class, 'updateSpecialSession'])->name('groups.special-sessions.update');
        Route::delete('/groups/{group}/special-sessions/{specialSession}', [GroupController::class, 'destroySpecialSession'])->name('groups.special-sessions.destroy');
        
        // Attendance routes
        Route::get('/attendance', [AttendanceController::class, 'index'])->name('attendance.index');
        Route::post('/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
        Route::get('/attendance/summary/{group}', [AttendanceController::class, 'summary'])->name('attendance.summary');
        Route::get('/attendance/last-month-report', [AttendanceController::class, 'lastMonthReport'])->name('attendance.last-month-report');
        Route::get('/attendance/monthly-report', [AttendanceController::class, 'monthlyReport'])->name('attendance.monthly-report');
        
        // Payment routes
        Route::get('/payments', [\App\Http\Controllers\PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/show', [\App\Http\Controllers\PaymentController::class, 'show'])->name('payments.show');
        Route::post('/payments/generate-monthly', [\App\Http\Controllers\PaymentController::class, 'generateMonthlyPayments'])->name('payments.generate-monthly');
        Route::patch('/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'updatePayment'])->name('payments.update');
        Route::post('/payments/bulk-update', [\App\Http\Controllers\PaymentController::class, 'bulkUpdate'])->name('payments.bulk-update');
        Route::delete('/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'destroy'])->name('payments.destroy');
        
        // Plan management routes
        Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
        Route::post('/plans/upgrade', [PlanController::class, 'upgrade'])->name('plans.upgrade');
        
        // Feedback routes (for teachers to submit feedback)
        Route::get('/feedback', [FeedbackController::class, 'index'])->name('feedback.index');
        Route::post('/feedback', [FeedbackController::class, 'store'])->name('feedback.store');
        Route::get('/feedback/{feedback}', [FeedbackController::class, 'show'])->name('feedback.show');
    });
});

require __DIR__.'/auth.php';
