<?php

use App\Models\Subscription;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automatic database backups using our custom command
Schedule::command('backup:daily')
    ->dailyAt('03:00')
    ->name('daily-backup')
    ->withoutOverlapping()
    ->onOneServer() // Prevent running on multiple servers
    ->appendOutputTo(storage_path('logs/backup.log'));

// Schedule daily check for expired subscriptions
Schedule::call(function () {
    Subscription::where('end_date', '<', now()->toDateString())
        ->where('is_active', true)
        ->update(['is_active' => false]);
})->daily()->name('deactivate-expired-subscriptions');
