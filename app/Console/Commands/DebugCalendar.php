<?php

namespace App\Console\Commands;

use App\Models\Group;
use App\Models\User;
use Illuminate\Console\Command;

class DebugCalendar extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:calendar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug calendar events';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Debugging calendar events...');

        // Get first user (teacher)
        $user = User::where('is_admin', false)->first();
        if (!$user) {
            $this->error('No teachers found');

            return;
        }

        $this->info("Testing with user: {$user->name}");

        // Get user's groups
        $groups = Group::where('user_id', $user->id)->with(['schedules', 'specialSessions'])->get();
        $this->info("User has {$groups->count()} groups");

        foreach ($groups as $group) {
            $this->info("Group: {$group->name}");
            $this->info("  - Regular schedules: {$group->schedules->count()}");
            $this->info("  - Special sessions: {$group->specialSessions->count()}");

            foreach ($group->specialSessions as $session) {
                $this->info("    * {$session->date} {$session->start_time}-{$session->end_time}: {$session->description}");
            }
        }

        // Test dashboard calendar events
        $start = '2025-07-01';
        $end = '2025-07-31';

        $events = [];

        foreach ($groups as $group) {
            // Add special session events
            $specialSessions = $group->specialSessions()
                ->where('date', '>=', $start)
                ->where('date', '<=', $end)
                ->get();

            $this->info("Group {$group->name} has {$specialSessions->count()} special sessions in date range");

            foreach ($specialSessions as $session) {
                $events[] = [
                    'id' => 'special_' . $session->id,
                    'title' => $group->name . ' - خاص',
                    'start' => $session->date . 'T' . $session->start_time,
                    'end' => $session->date . 'T' . $session->end_time,
                    'type' => 'special',
                ];
            }
        }

        $this->info("Total events generated: " . count($events));
        $this->info("Special events:");
        foreach ($events as $event) {
            if ($event['type'] === 'special') {
                $this->info("  - {$event['title']}: {$event['start']} to {$event['end']}");
            }
        }
    }
}
