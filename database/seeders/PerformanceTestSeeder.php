<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\Group;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class PerformanceTestSeeder extends Seeder
{
    private const TEACHERS_COUNT = 1000;
    private const GROUPS_PER_TEACHER = 10;
    private const STUDENTS_PER_TEACHER = 500;
    private const ASSISTANTS_PER_TEACHER = 2;
    private const STUDENTS_PER_GROUP = 50;
    private const PAYMENT_MONTHS = 12;
    private const ATTENDANCE_MONTHS = 3;
    private const SESSIONS_PER_MONTH = 8;
    private const BATCH_SIZE = 500;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting performance test data seeding...');
        $this->command->info('This will create:');
        $this->command->info('- ' . self::TEACHERS_COUNT . ' teachers');
        $this->command->info('- ' . (self::TEACHERS_COUNT * self::ASSISTANTS_PER_TEACHER) . ' assistants');
        $this->command->info('- ' . (self::TEACHERS_COUNT * self::GROUPS_PER_TEACHER) . ' groups');
        $this->command->info('- ' . (self::TEACHERS_COUNT * self::STUDENTS_PER_TEACHER) . ' students');
        $this->command->info('- ' . (self::TEACHERS_COUNT * self::STUDENTS_PER_TEACHER * self::PAYMENT_MONTHS) . ' payment records');
        $this->command->info('- ' . (self::TEACHERS_COUNT * self::STUDENTS_PER_TEACHER * self::ATTENDANCE_MONTHS * self::SESSIONS_PER_MONTH) . ' attendance records');

        // Disable foreign key checks for faster inserts
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Truncate existing data
        // $this->truncateTables();

        // Seed in batches to manage memory
        for ($batch = 0; $batch < self::TEACHERS_COUNT / self::BATCH_SIZE; $batch++) {
            $this->command->info("Processing batch " . ($batch + 1) . "/" . ceil(self::TEACHERS_COUNT / self::BATCH_SIZE));
            $this->seedBatch($batch * self::BATCH_SIZE, min(self::BATCH_SIZE, self::TEACHERS_COUNT - $batch * self::BATCH_SIZE));

            // Force garbage collection to free memory
            gc_collect_cycles();
        }

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Performance test data seeding completed!');
    }

    private function truncateTables(): void
    {
        $this->command->info('Truncating existing data...');

        $tables = [
            'attendances',
            'payments',
            'students',
            'groups',
            'users',
        ];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }
    }

    private function seedBatch(int $startIndex, int $batchSize): void
    {
        $teacherIds = [];

        // Create teachers in batch
        $this->command->info("Creating {$batchSize} teachers...");
        $teachers = User::factory()
            ->count($batchSize)
            ->teacher()
            ->create()
            ->pluck('id')
            ->toArray();

        $teacherIds = array_merge($teacherIds, $teachers);

        // Create assistants for this batch
        $this->command->info("Creating assistants...");
        $assistantsData = [];
        foreach ($teachers as $teacherId) {
            for ($i = 0; $i < self::ASSISTANTS_PER_TEACHER; $i++) {
                $assistantsData[] = User::factory()
                    ->assistant()
                    ->make([
                        'teacher_id' => $teacherId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ])
                    ->toArray();
            }
        }

        // Insert assistants in chunks
        collect($assistantsData)->chunk(1000)->each(function ($chunk) {
            DB::table('users')->insert($chunk->toArray());
        });

        // Create groups and students for each teacher in this batch
        foreach ($teachers as $teacherId) {
            $this->seedTeacherData($teacherId);
        }
    }

    private function seedTeacherData(int $teacherId): void
    {
        // Create groups for this teacher
        $groups = Group::factory()
            ->count(self::GROUPS_PER_TEACHER)
            ->create(['user_id' => $teacherId]);

        // Create students for this teacher
        $students = Student::factory()
            ->count(self::STUDENTS_PER_TEACHER)
            ->create(['user_id' => $teacherId]);

        // Assign students to groups (50 students per group)
        $studentIds = $students->pluck('id')->toArray();
        $groupIds = $groups->pluck('id')->toArray();

        $studentIndex = 0;
        foreach ($groupIds as $groupId) {
            $groupStudents = array_slice($studentIds, $studentIndex, self::STUDENTS_PER_GROUP);

            // Update students to belong to this group
            Student::whereIn('id', $groupStudents)->update(['group_id' => $groupId]);

            $studentIndex += self::STUDENTS_PER_GROUP;
        }

        // Create payment records for all students
        $this->createPaymentRecords($studentIds, $groupIds);

        // Create attendance records for all students
        $this->createAttendanceRecords($studentIds, $groupIds);
    }

    private function createPaymentRecords(array $studentIds, array $groupIds): void
    {
        $paymentData = [];
        $currentDate = Carbon::now();

        foreach ($studentIds as $studentId) {
            $groupId = $groupIds[array_rand($groupIds)]; // Random group for payment

            for ($month = 0; $month < self::PAYMENT_MONTHS; $month++) {
                $paymentMonth = $currentDate->copy()->subMonths($month);

                $paymentData[] = [
                    'student_id' => $studentId,
                    'group_id' => $groupId,
                    'payment_type' => 'monthly',
                    'related_date' => $paymentMonth->startOfMonth()->toDateString(),
                    'is_paid' => fake()->boolean(85), // 85% paid
                    'amount' => fake()->randomElement([300, 350, 400, 450, 500]),
                    'paid_at' => fake()->boolean(85) ? $paymentMonth->toDateString() : null,
                    'notes' => fake()->boolean(10) ? 'ملاحظة' : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Insert payments in chunks
        collect($paymentData)->chunk(5000)->each(function ($chunk) {
            DB::table('payments')->insert($chunk->toArray());
        });
    }

    private function createAttendanceRecords(array $studentIds, array $groupIds): void
    {
        $attendanceData = [];
        $currentDate = Carbon::now();

        foreach ($studentIds as $studentId) {
            $groupId = $groupIds[array_rand($groupIds)]; // Random group for attendance

            for ($month = 0; $month < self::ATTENDANCE_MONTHS; $month++) {
                $monthStart = $currentDate->copy()->subMonths($month)->startOfMonth();

                for ($session = 0; $session < self::SESSIONS_PER_MONTH; $session++) {
                    $sessionDate = $monthStart->copy()->addDays($session * 3); // Sessions every 3 days

                    if ($sessionDate->lte($currentDate)) {
                        $attendanceData[] = [
                            'student_id' => $studentId,
                            'group_id' => $groupId,
                            'date' => $sessionDate->toDateString(),
                            'is_present' => fake()->boolean(80), // 80% attendance rate
                            'notes' => fake()->boolean(5) ? 'ملاحظة' : null,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];
                    }
                }
            }
        }

        // Insert attendance in chunks
        collect($attendanceData)->chunk(10000)->each(function ($chunk) {
            DB::table('attendances')->insert($chunk->toArray());
        });
    }
}
