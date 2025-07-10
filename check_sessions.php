<?php

use App\Models\Group;
use App\Models\GroupSpecialSession;

echo "=== Special Sessions Check ===\n";

// Check special sessions count
$sessionsCount = GroupSpecialSession::count();
echo "Total special sessions: {$sessionsCount}\n\n";

// Display all special sessions
$sessions = GroupSpecialSession::with('group')->get();

if ($sessions->count() > 0) {
    echo "Special Sessions Details:\n";
    echo str_repeat("-", 50) . "\n";

    foreach ($sessions as $session) {
        echo "ID: {$session->id}\n";
        echo "Group: {$session->group->name}\n";
        echo "Date: {$session->date}\n";
        echo "Time: {$session->start_time} - {$session->end_time}\n";
        echo "Description: " . ($session->description ?: 'No description') . "\n";
        echo str_repeat("-", 30) . "\n";
    }
} else {
    echo "No special sessions found.\n";
}

// Check groups count
$groupsCount = Group::count();
echo "\nTotal groups: {$groupsCount}\n";

// Check first group's sessions
$firstGroup = Group::with(['schedules', 'specialSessions'])->first();
if ($firstGroup) {
    echo "First group: {$firstGroup->name}\n";
    echo "Regular schedules: {$firstGroup->schedules->count()}\n";
    echo "Special sessions: {$firstGroup->specialSessions->count()}\n";
}
