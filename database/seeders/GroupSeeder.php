<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Group;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
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

        // Get the current academic year
        $academicYear = AcademicYear::first();

        if (!$academicYear) {
            // Create a default academic year if none exists
            $academicYear = AcademicYear::create([
                'name_ar' => 'السنة الدراسية 2025-2026',
                'code' => '2025-2026',
            ]);
        }

        // Create sample groups with different payment types
        $groups = [
            [
                'name' => 'مجموعة الصباح - شهري',
                'description' => 'مجموعة طلاب الفترة الصباحية - دفع شهري',
                'max_students' => 15,
                'is_active' => true,
                'payment_type' => 'monthly',
                'student_price' => 200.00,
                'academic_year_id' => $academicYear->id,
                'schedules' => [
                    ['day_of_week' => 0, 'start_time' => '08:00', 'end_time' => '10:00'], // Sunday
                    ['day_of_week' => 2, 'start_time' => '08:00', 'end_time' => '10:00'], // Tuesday
                    ['day_of_week' => 4, 'start_time' => '08:00', 'end_time' => '10:00'], // Thursday
                ],
            ],
            [
                'name' => 'مجموعة المساء - بالجلسة',
                'description' => 'مجموعة طلاب الفترة المسائية - دفع بالجلسة',
                'max_students' => 20,
                'is_active' => true,
                'payment_type' => 'per_session',
                'student_price' => 50.00,
                'academic_year_id' => $academicYear->id,
                'schedules' => [
                    ['day_of_week' => 1, 'start_time' => '16:00', 'end_time' => '18:00'], // Monday
                    ['day_of_week' => 3, 'start_time' => '16:00', 'end_time' => '18:00'], // Wednesday
                ],
            ],
            [
                'name' => 'مجموعة نهاية الأسبوع - شهري',
                'description' => 'مجموعة خاصة لطلاب نهاية الأسبوع - دفع شهري',
                'max_students' => 12,
                'is_active' => true,
                'payment_type' => 'monthly',
                'student_price' => 150.00,
                'academic_year_id' => $academicYear->id,
                'schedules' => [
                    ['day_of_week' => 5, 'start_time' => '10:00', 'end_time' => '12:00'], // Friday
                    ['day_of_week' => 6, 'start_time' => '10:00', 'end_time' => '12:00'], // Saturday
                ],
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
            ['name' => 'أحمد علي', 'phone' => '0501234567', 'guardian_phone' => '0509876543'],
            ['name' => 'فاطمة محمد', 'phone' => '0502345678', 'guardian_phone' => '0508765432'],
            ['name' => 'عبدالله سعد', 'phone' => '0503456789', 'guardian_phone' => '0507654321'],
            ['name' => 'نورا خالد', 'phone' => '0504567890', 'guardian_phone' => '0506543210'],
            ['name' => 'يوسف عمر', 'phone' => '0505678901', 'guardian_phone' => '0505432109'],
        ];

        foreach ($sampleStudents as $studentData) {
            $student = Student::create(array_merge($studentData, [
                'user_id' => $user->id,
                'academic_year_id' => $academicYear->id,
            ]));

            // Assign each student to a random group
            if ($createdGroups->isNotEmpty()) {
                $randomGroup = $createdGroups->random();

                // Update student to belong to this group
                $student->update(['group_id' => $randomGroup->id]);

                // Create sample payment records based on payment type
                if ($randomGroup->payment_type === 'monthly') {
                    // Create monthly payments for the last 3 months
                    for ($monthsBack = 0; $monthsBack < 3; $monthsBack++) {
                        $date = now()->subMonths($monthsBack)->startOfMonth();
                        $isPaid = $monthsBack < 2; // Make recent payments paid

                        Payment::create([
                            'student_id' => $student->id,
                            'group_id' => $randomGroup->id,
                            'payment_type' => 'monthly',
                            'related_date' => $date,
                            'amount' => $randomGroup->student_price,
                            'is_paid' => $isPaid,
                            'paid_at' => $isPaid ? $date->addDays(rand(1, 10)) : null,
                            'notes' => $isPaid ? 'تم الدفع نقداً' : null,
                        ]);
                    }
                } else {
                    // Create per-session payments for some recent sessions
                    for ($daysBack = 1; $daysBack <= 10; $daysBack += 2) {
                        $date = now()->subDays($daysBack);
                        $isPaid = $daysBack <= 6; // Make recent sessions paid

                        Payment::create([
                            'student_id' => $student->id,
                            'group_id' => $randomGroup->id,
                            'payment_type' => 'per_session',
                            'related_date' => $date,
                            'amount' => $randomGroup->student_price,
                            'is_paid' => $isPaid,
                            'paid_at' => $isPaid ? $date->addHours(2) : null,
                            'notes' => $isPaid ? 'تم الدفع بعد الحصة' : null,
                        ]);
                    }
                }
            }
        }
    }
}
