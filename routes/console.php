<?php

use App\Models\Subscription;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automatic database backups
Schedule::command('backup:run --only-db')
    ->dailyAt('03:00')
    ->name('database-backup')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/backup.log'));

// Schedule automatic backup cleanup (runs after backup)
Schedule::command('backup:clean')
    ->dailyAt('03:30')
    ->name('backup-cleanup')
    ->withoutOverlapping()
    ->appendOutputTo(storage_path('logs/backup.log'));

// Schedule daily check for expired subscriptions
Schedule::call(function () {
    Subscription::where('end_date', '<', now()->toDateString())
        ->where('is_active', true)
        ->update(['is_active' => false]);
})->daily()->name('deactivate-expired-subscriptions');
