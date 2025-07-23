<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Center;
use App\Models\User;
use App\Models\Student;
use App\Models\Group;
use App\Models\Subscription;
use App\Models\Plan;

class CenterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create individual teacher centers
        $this->createIndividualCenters();
        
        // Create organization centers
        $this->createOrganizationCenters();
    }

    /**
     * Create individual teacher centers (single teacher as owner and teacher).
     */
    private function createIndividualCenters(): void
    {
        for ($i = 0; $i < 3; $i++) {
            $center = Center::factory()->individual()->create();
            
            // Create owner/teacher
            $owner = User::factory()->teacher()->create([
                'center_id' => $center->id,
                'is_admin' => true,
                'email' => 'teacher' . ($i + 1) . '@example.com',
            ]);

            // Assign admin role
            $owner->assignRole('admin');
            $owner->assignRole('teacher');

            // Update center with owner
            $center->update(['owner_id' => $owner->id]);

            // Create subscription for the center
            $plan = Plan::first();
            if ($plan) {
                Subscription::factory()->active()->create([
                    'user_id' => $owner->id,
                    'center_id' => $center->id,
                    'plan_id' => $plan->id,
                    'max_students' => $plan->max_students,
                ]);
            }

            // Create students for this center
            $students = Student::factory()->count(rand(3, 8))->create([
                'user_id' => $owner->id,
                'center_id' => $center->id,
            ]);

            // Create groups for this center
            $groups = Group::factory()->count(rand(1, 3))->create([
                'user_id' => $owner->id,
                'center_id' => $center->id,
            ]);

            // Assign students to groups
            foreach ($students as $student) {
                $randomGroup = $groups->random();
                $student->update(['group_id' => $randomGroup->id]);
            }
        }
    }

    /**
     * Create organization centers (multiple teachers and assistants).
     */
    private function createOrganizationCenters(): void
    {
        for ($i = 0; $i < 2; $i++) {
            $center = Center::factory()->organization()->create();
            
            // Create owner/admin (non-teaching admin)
            $owner = User::factory()->admin()->create([
                'center_id' => $center->id,
                'is_admin' => true,
                'type' => 'teacher', // Admin can also be a teacher
                'email' => 'admin' . ($i + 1) . '@example.com',
            ]);

            // Assign admin role
            $owner->assignRole('admin');

            // Update center with owner
            $center->update(['owner_id' => $owner->id]);

            // Create subscription for the center
            $plan = Plan::first();
            if ($plan) {
                Subscription::factory()->active()->create([
                    'user_id' => $owner->id,
                    'center_id' => $center->id,
                    'plan_id' => $plan->id,
                    'max_students' => $plan->max_students,
                ]);
            }

            // Create teachers for this center
            $teachers = User::factory()->teacher()->count(rand(2, 3))->create([
                'center_id' => $center->id,
                'is_admin' => false,
            ]);

            foreach ($teachers as $teacher) {
                $teacher->assignRole('teacher');
            }

            // Create assistants for this center
            $assistants = User::factory()->assistant()->count(rand(1, 2))->create([
                'center_id' => $center->id,
                'teacher_id' => $teachers->first()->id, // Just assign to first teacher
            ]);

            foreach ($assistants as $assistant) {
                $assistant->assignRole('assistant');
            }

            // Create students for this center
            $allTeachers = $teachers->push($owner);
            $students = collect();
            
            foreach ($allTeachers as $teacher) {
                $teacherStudents = Student::factory()->count(rand(2, 5))->create([
                    'user_id' => $teacher->id,
                    'center_id' => $center->id,
                ]);
                $students = $students->concat($teacherStudents);
            }

            // Create groups for this center
            $groups = collect();
            foreach ($allTeachers as $teacher) {
                $teacherGroups = Group::factory()->count(rand(1, 2))->create([
                    'user_id' => $teacher->id,
                    'center_id' => $center->id,
                ]);
                $groups = $groups->concat($teacherGroups);
            }

            // Assign students to groups
            foreach ($students as $student) {
                $randomGroup = $groups->random();
                $student->update(['group_id' => $randomGroup->id]);
            }
        }
    }
}
