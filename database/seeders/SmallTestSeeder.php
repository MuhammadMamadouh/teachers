<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use App\Models\Student;
use App\Models\Payment;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SmallTestSeeder extends Seeder
{
    private const TEACHERS_COUNT = 10;
    private const GROUPS_PER_TEACHER = 5;
    private const STUDENTS_PER_TEACHER = 50;
    private const ASSISTANTS_PER_TEACHER = 2;
    private const STUDENTS_PER_GROUP = 10;
    private const PAYMENT_MONTHS = 6;
    private const ATTENDANCE_MONTHS = 2;
    private const SESSIONS_PER_MONTH = 4;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Starting small test data seeding...');
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
        $this->truncateTables();

        // Create all teachers
        $this->command->info("Creating teachers...");
        $teachers = User::factory()
            ->count(self::TEACHERS_COUNT)
            ->teacher()
            ->create();

        // Create assistants
        $this->command->info("Creating assistants...");
        foreach ($teachers as $teacher) {
            User::factory()
                ->count(self::ASSISTANTS_PER_TEACHER)
                ->assistant()
                ->create(['teacher_id' => $teacher->id]);
        }

        // Create groups and students for each teacher
        foreach ($teachers as $teacher) {
            $this->command->info("Creating data for teacher: {$teacher->name}");
            $this->seedTeacherData($teacher->id);
        }

        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->command->info('Small test data seeding completed!');
    }

    private function truncateTables(): void
    {
        $this->command->info('Truncating existing data...');
        
        $tables = [
            'attendances',
            'payments', 
            'students',
            'groups',
            'users'
        ];

        foreach ($tables as $table) {
            DB::table($table)->truncate();
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

        // Assign students to groups
        $studentIds = $students->pluck('id')->toArray();
        $groupIds = $groups->pluck('id')->toArray();
        
        $studentIndex = 0;
        foreach ($groupIds as $groupId) {
            $groupStudents = array_slice($studentIds, $studentIndex, self::STUDENTS_PER_GROUP);
            
            // Update students to belong to this group
            Student::whereIn('id', $groupStudents)->update(['group_id' => $groupId]);
            
            $studentIndex += self::STUDENTS_PER_GROUP;
        }

        // Create payment and attendance records
        $this->createPaymentRecords($studentIds, $groupIds);
        $this->createAttendanceRecords($studentIds, $groupIds);
    }

    private function createPaymentRecords(array $studentIds, array $groupIds): void
    {
        $currentDate = Carbon::now();
        
        foreach ($studentIds as $studentId) {
            $groupId = $groupIds[array_rand($groupIds)];
            
            for ($month = 0; $month < self::PAYMENT_MONTHS; $month++) {
                $paymentMonth = $currentDate->copy()->subMonths($month);
                
                Payment::factory()->create([
                    'student_id' => $studentId,
                    'group_id' => $groupId,
                    'month' => $paymentMonth->month,
                    'year' => $paymentMonth->year,
                ]);
            }
        }
    }

    private function createAttendanceRecords(array $studentIds, array $groupIds): void
    {
        $currentDate = Carbon::now();
        
        foreach ($studentIds as $studentId) {
            $groupId = $groupIds[array_rand($groupIds)];
            
            for ($month = 0; $month < self::ATTENDANCE_MONTHS; $month++) {
                $monthStart = $currentDate->copy()->subMonths($month)->startOfMonth();
                
                for ($session = 0; $session < self::SESSIONS_PER_MONTH; $session++) {
                    $sessionDate = $monthStart->copy()->addDays($session * 7); // Weekly sessions
                    
                    if ($sessionDate->lte($currentDate)) {
                        Attendance::factory()->create([
                            'student_id' => $studentId,
                            'group_id' => $groupId,
                            'date' => $sessionDate->toDateString(),
                        ]);
                    }
                }
            }
        }
    }
}
