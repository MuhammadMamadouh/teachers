<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestOverviewStats extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:overview-stats';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $center = \App\Models\Center::first();
        
        if (!$center) {
            $this->error('No center found');
            return;
        }
        
        $this->info('Testing center statistics for: ' . $center->name);
        $this->info('Teachers: ' . $center->teachers()->count());
        $this->info('Students: ' . $center->students()->count());
        $this->info('Groups: ' . $center->groups()->count());
        $this->info('Assistants: ' . $center->assistants()->count());
        
        // Test revenue calculation
        $revenue = $center->students()->join('payments', 'students.id', '=', 'payments.student_id')
            ->where('payments.is_paid', true)->sum('payments.amount');
        $this->info('Revenue: ' . $revenue);
        
        return 0;
    }
}
