<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class BackupStatusImproved extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'backup:status-all';

    /**
     * The console command description.
     */
    protected $description = 'Check the status of all database backups (Spatie and Custom)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking all backup systems...');
        $this->line('');
        
        // Check Spatie Laravel Backup
        $this->checkSpatieBackups();
        
        $this->line('');
        $this->line('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->line('');
        
        // Check Custom Backups
        $this->checkCustomBackups();
        
        $this->line('');
        $this->info('✅ Backup status check completed');
        
        return Command::SUCCESS;
    }

    private function checkSpatieBackups()
    {
        $this->info('📦 Spatie Laravel Backup Status:');
        
        try {
            $disk = Storage::disk('backup');
            $appName = config('backup.backup.name', 'teachers-app');
            
            // Check both possible directory names
            $directories = [$appName, 'Laravel'];
            $foundBackups = false;
            
            foreach ($directories as $dirName) {
                if ($disk->exists($dirName)) {
                    $foundBackups = true;
                    $this->info("   📁 Checking directory: {$dirName}");
                    
                    // Get all backup files
                    $files = $disk->files($dirName);
                    $backups = collect($files)
                        ->filter(fn($file) => str_ends_with($file, '.zip'))
                        ->map(function ($file) use ($disk) {
                            return [
                                'file' => basename($file),
                                'path' => $file,
                                'size' => $disk->size($file),
                                'modified' => Carbon::createFromTimestamp($disk->lastModified($file)),
                            ];
                        })
                        ->sortByDesc('modified');
                    
                    if ($backups->isEmpty()) {
                        $this->warn("      ❌ No backup files found in {$dirName}");
                        continue;
                    }
                    
                    $this->info("      📊 Total backups: " . $backups->count());
                    
                    // Show latest backup
                    $latest = $backups->first();
                    $this->info("      📅 Latest backup: {$latest['file']}");
                    $this->info("      🕐 Created: " . $latest['modified']->format('Y-m-d H:i:s') . " ({$latest['modified']->diffForHumans()})");
                    $this->info("      📦 Size: " . $this->formatBytes($latest['size']));
                    
                    // Check if backup is recent
                    if ($latest['modified']->diffInHours(Carbon::now()) > 48) {
                        $this->warn("      ⚠️  Warning: Latest backup is older than 48 hours");
                    } else {
                        $this->info("      ✅ Backup is recent");
                    }
                    
                    // Show total size
                    $totalSize = $backups->sum('size');
                    $this->info("      💾 Total backup size: " . $this->formatBytes($totalSize));
                    $this->line('');
                }
            }
            
            if (!$foundBackups) {
                $this->warn("   ❌ No Spatie backups found in any directory");
            }
            
        } catch (\Exception $e) {
            $this->error("   ❌ Error checking Spatie backups: " . $e->getMessage());
        }
    }

    private function checkCustomBackups()
    {
        $this->info('🔧 Custom Backup Status:');
        
        $directory = storage_path('app/database-backups');
        
        if (!File::exists($directory)) {
            $this->warn("   ❌ Directory does not exist: {$directory}");
            return;
        }

        $files = File::files($directory);
        
        if (empty($files)) {
            $this->warn("   ❌ No backup files found in: {$directory}");
            return;
        }

        $this->info("   📁 Directory: {$directory}");
        $this->info("   📊 Total backups: " . count($files));
        
        // Find the most recent backup
        $mostRecent = collect($files)->sortByDesc(function ($file) {
            return File::lastModified($file);
        })->first();

        if ($mostRecent) {
            $lastModified = Carbon::createFromTimestamp(File::lastModified($mostRecent));
            $size = $this->formatBytes(File::size($mostRecent));
            $filename = File::basename($mostRecent);
            
            $this->info("   📅 Latest backup: {$filename}");
            $this->info("   🕐 Created: {$lastModified->format('Y-m-d H:i:s')} ({$lastModified->diffForHumans()})");
            $this->info("   📦 Size: {$size}");
            
            // Check if backup is recent (within last 48 hours)
            if ($lastModified->diffInHours(Carbon::now()) > 48) {
                $this->warn("   ⚠️  Warning: Latest backup is older than 48 hours");
            } else {
                $this->info("   ✅ Backup is recent");
            }
        }
        
        // Show total size of all backups
        $totalSize = collect($files)->sum(function ($file) {
            return File::size($file);
        });
        
        $this->info("   💾 Total backup size: " . $this->formatBytes($totalSize));
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
