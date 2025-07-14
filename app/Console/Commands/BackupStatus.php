<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BackupStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check the status of recent backups';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $disk = Storage::disk('backup');
        $appName = config('backup.backup.name', 'teachers-app');
        
        $this->info("📊 Backup Status for {$appName}");
        $this->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        try {
            // Check if backup directory exists
            if (!$disk->exists($appName)) {
                $this->error('❌ No backups found!');
                return Command::FAILURE;
            }
            
            // Get all backup files
            $files = $disk->files($appName);
            $backups = collect($files)
                ->filter(fn($file) => str_ends_with($file, '.zip'))
                ->map(function ($file) use ($disk) {
                    return [
                        'file' => basename($file),
                        'path' => $file,
                        'size' => $this->formatBytes($disk->size($file)),
                        'created' => Carbon::createFromTimestamp($disk->lastModified($file)),
                    ];
                })
                ->sortByDesc('created')
                ->take(10);
            
            if ($backups->isEmpty()) {
                $this->error('❌ No backup files found!');
                return Command::FAILURE;
            }
            
            $this->info("✅ Found {$backups->count()} recent backups");
            $this->newLine();
            
            // Display backup table
            $this->table(
                ['Backup File', 'Size', 'Created', 'Age'],
                $backups->map(function ($backup) {
                    return [
                        $backup['file'],
                        $backup['size'],
                        $backup['created']->format('Y-m-d H:i:s'),
                        $backup['created']->diffForHumans(),
                    ];
                })->toArray()
            );
            
            // Check if last backup is recent (within 25 hours)
            $lastBackup = $backups->first();
            $hoursAgo = $lastBackup['created']->diffInHours(now());
            
            if ($hoursAgo > 25) {
                $this->warn("⚠️  Last backup is {$hoursAgo} hours old - consider running a backup soon");
            } else {
                $this->info("✅ Last backup is recent ({$lastBackup['created']->diffForHumans()})");
            }
            
            // Calculate total storage used
            $totalSize = $backups->sum(fn($backup) => Storage::disk('backup')->size($backup['path']));
            $this->info("💾 Total backup storage used: " . $this->formatBytes($totalSize));
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('❌ Error checking backup status: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
    
    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
