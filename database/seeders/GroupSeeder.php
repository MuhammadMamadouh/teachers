<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Payment;
use App\Models\Student;
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

        // Create some sample students and assign them to groups
        $createdGroups = Group::where('user_id', $user->id)->get();
        
        // Create sample students
        $sampleStudents = [
            ['name' => 'أحمد علي', 'phone' => '0501234567', 'guardian_name' => 'علي أحمد', 'guardian_phone' => '0509876543'],
            ['name' => 'فاطمة محمد', 'phone' => '0502345678', 'guardian_name' => 'محمد فاطمة', 'guardian_phone' => '0508765432'],
            ['name' => 'عبدالله سعد', 'phone' => '0503456789', 'guardian_name' => 'سعد عبدالله', 'guardian_phone' => '0507654321'],
            ['name' => 'نورا خالد', 'phone' => '0504567890', 'guardian_name' => 'خالد نورا', 'guardian_phone' => '0506543210'],
            ['name' => 'يوسف عمر', 'phone' => '0505678901', 'guardian_name' => 'عمر يوسف', 'guardian_phone' => '0505432109'],
        ];

        foreach ($sampleStudents as $studentData) {
            $student = Student::create(array_merge($studentData, ['user_id' => $user->id]));
            
            // Assign each student to a random group
            if ($createdGroups->isNotEmpty()) {
                $randomGroup = $createdGroups->random();
                $randomGroup->students()->attach($student->id);
                
                // Create sample payment records for the last 3 months
                for ($monthsBack = 0; $monthsBack < 3; $monthsBack++) {
                    $date = now()->subMonths($monthsBack);
                    $isPaid = $monthsBack < 2; // Make recent payments paid
                    
                    Payment::create([
                        'student_id' => $student->id,
                        'group_id' => $randomGroup->id,
                        'month' => $date->month,
                        'year' => $date->year,
                        'is_paid' => $isPaid,
                        'amount' => $isPaid ? 200.00 : null,
                        'paid_date' => $isPaid ? $date->startOfMonth()->addDays(rand(1, 10)) : null,
                        'notes' => $isPaid ? 'تم الدفع نقداً' : null,
                    ]);
                }
            }
        }
    }
}
