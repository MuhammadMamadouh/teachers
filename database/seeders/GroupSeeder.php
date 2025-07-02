<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first non-admin user
        $user = User::where('is_admin', false)->first();
        
        if (!$user) {
            return;
        }

        // Create sample groups
        $groups = [
            [
                'name' => 'مجموعة الصباح',
                'description' => 'مجموعة طلاب الفترة الصباحية',
                'max_students' => 15,
                'is_active' => true,
                'schedules' => [
                    ['day_of_week' => 0, 'start_time' => '08:00', 'end_time' => '10:00'], // Sunday
                    ['day_of_week' => 2, 'start_time' => '08:00', 'end_time' => '10:00'], // Tuesday
                    ['day_of_week' => 4, 'start_time' => '08:00', 'end_time' => '10:00'], // Thursday
                ]
            ],
            [
                'name' => 'مجموعة المساء',
                'description' => 'مجموعة طلاب الفترة المسائية',
                'max_students' => 20,
                'is_active' => true,
                'schedules' => [
                    ['day_of_week' => 1, 'start_time' => '16:00', 'end_time' => '18:00'], // Monday
                    ['day_of_week' => 3, 'start_time' => '16:00', 'end_time' => '18:00'], // Wednesday
                ]
            ],
            [
                'name' => 'مجموعة نهاية الأسبوع',
                'description' => 'مجموعة خاصة لطلاب نهاية الأسبوع',
                'max_students' => 12,
                'is_active' => true,
                'schedules' => [
                    ['day_of_week' => 5, 'start_time' => '10:00', 'end_time' => '12:00'], // Friday
                    ['day_of_week' => 6, 'start_time' => '10:00', 'end_time' => '12:00'], // Saturday
                ]
            ],
        ];

        foreach ($groups as $groupData) {
            $schedules = $groupData['schedules'];
            unset($groupData['schedules']);
            
            $group = Group::create(array_merge($groupData, ['user_id' => $user->id]));
            
            foreach ($schedules as $schedule) {
                $group->schedules()->create($schedule);
            }
        }
    }
}
