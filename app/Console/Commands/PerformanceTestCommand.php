<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Database\Seeders\SmallTestSeeder;
use Database\Seeders\PerformanceTestSeeder;
use Database\Seeders\DataVerificationSeeder;
use Database\Seeders\ClearPerformanceDataSeeder;

class PerformanceTestCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'performance:test 
                            {action : The action to perform (small|large|verify|clear)}
                            {--force : Force the action without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage performance test data for the teacher SaaS platform';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        $force = $this->option('force');

        match ($action) {
            'small' => $this->runSmallTest($force),
            'large' => $this->runLargeTest($force),
            'verify' => $this->verifyData(),
            'clear' => $this->clearData($force),
            default => $this->showHelp(),
        };

        return 0;
    }

    private function runSmallTest(bool $force): void
    {
        $this->info('🧪 Running Small Performance Test');
        $this->info('This will create 10 teachers with complete data sets.');
        
        if (!$force && !$this->confirm('Do you want to continue?')) {
            $this->info('Operation cancelled.');
            return;
        }

        $this->call('db:seed', ['--class' => SmallTestSeeder::class]);
        $this->newLine();
        $this->info('✅ Small test completed! Run "php artisan performance:test verify" to check the data.');
    }

    private function runLargeTest(bool $force): void
    {
        $this->warn('⚠️  Running Large Performance Test');
        $this->warn('This will create 1000 teachers with millions of records.');
        $this->warn('This may take 30-60 minutes and require significant system resources.');
        
        if (!$force && !$this->confirm('Are you sure you want to continue?')) {
            $this->info('Operation cancelled.');
            return;
        }

        $startTime = now();
        $this->call('db:seed', ['--class' => PerformanceTestSeeder::class]);
        $endTime = now();
        
        $duration = $endTime->diffInMinutes($startTime);
        $this->newLine();
        $this->info("✅ Large test completed in {$duration} minutes!");
        $this->info('Run "php artisan performance:test verify" to check the data.');
    }

    private function verifyData(): void
    {
        $this->info('🔍 Verifying seeded data...');
        $this->call('db:seed', ['--class' => DataVerificationSeeder::class]);
    }

    private function clearData(bool $force): void
    {
        $this->warn('🗑️  Clearing Performance Test Data');
        $this->warn('This will remove all test data but preserve admin users and plans.');
        
        if (!$force && !$this->confirm('Are you sure you want to clear all test data?')) {
            $this->info('Operation cancelled.');
            return;
        }

        $this->call('db:seed', ['--class' => ClearPerformanceDataSeeder::class]);
    }

    private function showHelp(): void
    {
        $this->error('Invalid action. Available actions:');
        $this->line('');
        $this->line('  <info>small</info>   - Run small performance test (10 teachers)');
        $this->line('  <info>large</info>   - Run large performance test (1000 teachers)');
        $this->line('  <info>verify</info>  - Verify existing data integrity');
        $this->line('  <info>clear</info>   - Clear all performance test data');
        $this->line('');
        $this->line('Usage examples:');
        $this->line('  <comment>php artisan performance:test small</comment>');
        $this->line('  <comment>php artisan performance:test large --force</comment>');
        $this->line('  <comment>php artisan performance:test verify</comment>');
        $this->line('  <comment>php artisan performance:test clear</comment>');
    }
}
