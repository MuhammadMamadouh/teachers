<?php

namespace App\Console\Commands;

use App\Models\Group;
use Illuminate\Console\Command;

class AddTestSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'add:test-sessions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add test special sessions for demonstration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $groups = Group::all();
        
        if ($groups->count() === 0) {
            $this->error('No groups found');
            return;
        }

        foreach ($groups as $group) {
            // Add a few test special sessions
            $testSessions = [
                [
                    'date' => '2025-07-08',
                    'start_time' => '10:00',
                    'end_time' => '11:30',
                    'description' => 'جلسة مراجعة عامة'
                ],
                [
                    'date' => '2025-07-10',
                    'start_time' => '14:00',
                    'end_time' => '15:00',
                    'description' => 'امتحان تجريبي'
                ],
                [
                    'date' => '2025-07-15',
                    'start_time' => '09:00',
                    'end_time' => '11:00',
                    'description' => 'ورشة تطبيقية'
                ]
            ];

            foreach ($testSessions as $sessionData) {
                // Check if session already exists
                $exists = $group->specialSessions()
                    ->where('date', $sessionData['date'])
                    ->where('start_time', $sessionData['start_time'])
                    ->exists();

                if (!$exists) {
                    $group->specialSessions()->create($sessionData);
                    $this->info("Added special session for {$group->name} on {$sessionData['date']}");
                }
            }
        }

        $this->info('Test sessions added successfully!');
    }
}
