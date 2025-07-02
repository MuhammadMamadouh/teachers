<?php

use App\Http\Controllers\Admin\AdminPlanController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\PendingApprovalController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'approved'])
    ->name('dashboard');

// Dashboard calendar routes (for approved teachers)
Route::middleware(['auth', 'verified', 'approved', 'not-admin'])->group(function () {
    Route::get('/dashboard/calendar', [DashboardController::class, 'calendar'])->name('dashboard.calendar');
    Route::get('/dashboard/calendar-events', [DashboardController::class, 'getCalendarEvents'])->name('dashboard.calendar-events');
    Route::get('/dashboard/today-sessions', [DashboardController::class, 'getTodaySessions'])->name('dashboard.today-sessions');
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
    
    // Admin plan management
    Route::resource('plans', AdminPlanController::class, ['as' => 'admin']);
    Route::post('/plans/{plan}/set-default', [AdminPlanController::class, 'setDefault'])->name('admin.plans.set-default');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Student management routes (only for approved non-admin users)
    Route::middleware(['approved', 'not-admin'])->group(function () {
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
        
        // Payment routes
        Route::get('/payments', [\App\Http\Controllers\PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/show', [\App\Http\Controllers\PaymentController::class, 'show'])->name('payments.show');
        Route::post('/payments', [\App\Http\Controllers\PaymentController::class, 'store'])->name('payments.store');
        Route::post('/payments/bulk-update', [\App\Http\Controllers\PaymentController::class, 'bulkUpdate'])->name('payments.bulk-update');
        Route::delete('/payments/{payment}', [\App\Http\Controllers\PaymentController::class, 'destroy'])->name('payments.destroy');
        
        // Plan management routes
        Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
        Route::post('/plans/upgrade', [PlanController::class, 'upgrade'])->name('plans.upgrade');
    });
});

require __DIR__.'/auth.php';
