<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class RunTestSuite extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:suite {--type=all : The type of tests to run (all, unit, feature, integration)} {--coverage : Generate coverage report}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run comprehensive test suite for Teachers SaaS application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $type = $this->option('type');
        $coverage = $this->option('coverage');

        $this->info("Running {$type} tests for Teachers SaaS application...");

        $command = $this->buildTestCommand($type, $coverage);

        $this->info("Executing: {$command}");

        $result = Process::run($command);

        if ($result->successful()) {
            $this->info('✅ All tests passed!');
            $this->line($result->output());
            
            if ($coverage) {
                $this->info('📊 Coverage report generated in tests/coverage/');
            }
        } else {
            $this->error('❌ Tests failed!');
            $this->line($result->output());
            $this->line($result->errorOutput());
        }

        return $result->exitCode();
    }

    private function buildTestCommand(string $type, bool $coverage): string
    {
        $command = 'php artisan test';

        switch ($type) {
            case 'unit':
                $command .= ' tests/Unit';
                break;
            case 'feature':
                $command .= ' tests/Feature';
                break;
            case 'integration':
                $command .= ' tests/Integration';
                break;
            case 'all':
            default:
                // Run all tests
                break;
        }

        if ($coverage) {
            $command .= ' --coverage --coverage-html=tests/coverage';
        }

        return $command;
    }
}
