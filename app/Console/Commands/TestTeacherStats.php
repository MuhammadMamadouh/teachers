<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\Payment;
use App\Models\Center;

class TestTeacherStats extends Command
{
    protected $signature = 'test:teacher-stats';
    protected $description = 'Test teacher statistics';

    public function handle()
    {
        $this->info('Testing teacher statistics...');
        
        // Find a teacher with center
        $teacher = User::where('type', 'teacher')
            ->whereNotNull('center_id')
            ->first();
            
        if (!$teacher) {
            $this->error('No teacher with center found');
            return;
        }
        
        $this->info("Teacher: {$teacher->name}");
        $this->info("Students count: " . $teacher->students()->count());
        $this->info("Groups count: " . $teacher->groups()->count());
        
        // Check if teacher has students
        $students = $teacher->students;
        if ($students->count() > 0) {
            $this->info("First student: " . $students->first()->name);
        }
        
        // Check if teacher has groups
        $groups = $teacher->groups;
        if ($groups->count() > 0) {
            $this->info("First group: " . $groups->first()->name);
        }
        
        // Test the revenue calculation
        $studentRevenue = Payment::whereHas('student', function($query) use ($teacher) {
            $query->where('user_id', $teacher->id);
        })->where('is_paid', true)->sum('amount');
        
        $groupRevenue = Payment::whereHas('group', function($query) use ($teacher) {
            $query->where('user_id', $teacher->id);
        })->where('is_paid', true)->sum('amount');
        
        $this->info("Student revenue: {$studentRevenue}");
        $this->info("Group revenue: {$groupRevenue}");
        $this->info("Total revenue: " . ($studentRevenue + $groupRevenue));
    }
}
