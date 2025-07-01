<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\PendingApprovalController;
use App\Http\Controllers\ProfileController;
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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'approved'])->name('dashboard');

// Pending approval page - accessible by unapproved users
Route::get('/pending-approval', [PendingApprovalController::class, 'index'])
    ->middleware('auth')
    ->name('pending-approval');

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminController::class, 'index'])->name('admin.users');
    Route::post('/users/{user}/approve', [AdminController::class, 'approveUser'])->name('admin.users.approve');
    Route::delete('/users/{user}/reject', [AdminController::class, 'rejectUser'])->name('admin.users.reject');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
})->middleware('approved');

require __DIR__.'/auth.php';
