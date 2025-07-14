<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class DailyBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run daily backup of database and important files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Starting daily backup process...');
        
        try {
            // First try using the spatie backup package
            $this->info('📦 Attempting backup using Spatie Laravel Backup...');
            $exitCode = Artisan::call('backup:run', [
                '--only-db' => true,
                '--disable-notifications' => false,
            ]);
            
            if ($exitCode === 0) {
                $this->info('✅ Spatie backup completed successfully');
                Log::info('Daily backup completed successfully using Spatie');
                
                // Clean up old backups
                Artisan::call('backup:clean');
                $this->info('🧹 Old backups cleaned up');
                
                return Command::SUCCESS;
            } else {
                $this->warn('⚠️  Spatie backup failed, trying fallback method...');
                Log::warning('Spatie backup failed, using fallback method');
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Spatie backup error: ' . $e->getMessage());
            $this->warn('🔄 Falling back to custom backup method...');
            Log::error('Spatie backup failed: ' . $e->getMessage());
        }
        
        // Fallback to custom backup method
        try {
            $this->info('🔧 Using custom backup method...');
            $exitCode = Artisan::call('backup:database');
            
            if ($exitCode === 0) {
                $this->info('✅ Custom backup completed successfully');
                Log::info('Daily backup completed successfully using custom method');
                return Command::SUCCESS;
            } else {
                $this->error('❌ Custom backup also failed');
                Log::error('Both backup methods failed');
                return Command::FAILURE;
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Custom backup error: ' . $e->getMessage());
            Log::error('Custom backup failed: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
