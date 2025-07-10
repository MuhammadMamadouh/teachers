<?php

namespace App\Console\Commands;

use App\Models\Group;
use Illuminate\Console\Command;

class TestSpecialSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:special-sessions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test special sessions functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $this->info('Testing special sessions functionality...');

            // Get first group
            $group = Group::first();
            if (!$group) {
                $this->error('No groups found in database');

                return;
            }

            $this->info("Testing with group: {$group->name}");

            // Create a special session
            $session = $group->specialSessions()->create([
                'date' => '2025-07-05',
                'start_time' => '14:00',
                'end_time' => '15:30',
                'description' => 'جلسة مراجعة خاصة',
            ]);

            $this->info("Special session created successfully with ID: {$session->id}");

            // Test relationship
            $relatedGroup = $session->group;
            $this->info("Related group: {$relatedGroup->name}");

            // Test collection
            $groupSessions = $group->specialSessions;
            $this->info("Group has {$groupSessions->count()} special session(s)");

            $this->info('All tests passed!');

        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
        }
    }
}
