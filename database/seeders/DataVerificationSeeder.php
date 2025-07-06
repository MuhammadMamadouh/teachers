<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use App\Models\Student;
use App\Models\Payment;
use App\Models\Attendance;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DataVerificationSeeder extends Seeder
{
    /**
     * Verify the seeded data integrity and relationships.
     */
    public function run(): void
    {
        $this->command->info('=== Data Verification Report ===');
        $this->command->newLine();

        // Count totals
        $teacherCount = User::where('type', 'teacher')->count();
        $assistantCount = User::where('type', 'assistant')->count();
        $groupCount = Group::count();
        $studentCount = Student::count();
        $paymentCount = Payment::count();
        $attendanceCount = Attendance::count();

        $this->command->info("📊 Total Counts:");
        $this->command->info("   Teachers: {$teacherCount}");
        $this->command->info("   Assistants: {$assistantCount}");
        $this->command->info("   Groups: {$groupCount}");
        $this->command->info("   Students: {$studentCount}");
        $this->command->info("   Payments: {$paymentCount}");
        $this->command->info("   Attendance Records: {$attendanceCount}");
        $this->command->newLine();

        // Verify relationships
        $this->command->info("🔗 Relationship Verification:");
        
        // Check if all students have groups
        $studentsWithoutGroups = Student::whereNull('group_id')->count();
        $this->command->info("   Students without groups: {$studentsWithoutGroups}");
        
        // Check if all students have teachers
        $studentsWithoutTeachers = Student::whereNull('user_id')->count();
        $this->command->info("   Students without teachers: {$studentsWithoutTeachers}");
        
        // Check group distribution
        $avgStudentsPerGroup = $studentCount > 0 && $groupCount > 0 ? round($studentCount / $groupCount, 2) : 0;
        $this->command->info("   Average students per group: {$avgStudentsPerGroup}");
        
        // Check assistant assignment
        $assistantsWithTeachers = User::where('type', 'assistant')->whereNotNull('teacher_id')->count();
        $this->command->info("   Assistants assigned to teachers: {$assistantsWithTeachers}");
        $this->command->newLine();

        // Payment statistics
        $this->command->info("💰 Payment Statistics:");
        $paidPayments = Payment::where('is_paid', true)->count();
        $unpaidPayments = Payment::where('is_paid', false)->count();
        $paymentRate = $paymentCount > 0 ? round(($paidPayments / $paymentCount) * 100, 1) : 0;
        $this->command->info("   Paid payments: {$paidPayments}");
        $this->command->info("   Unpaid payments: {$unpaidPayments}");
        $this->command->info("   Payment rate: {$paymentRate}%");
        $this->command->newLine();

        // Attendance statistics
        $this->command->info("📚 Attendance Statistics:");
        $presentAttendance = Attendance::where('is_present', true)->count();
        $absentAttendance = Attendance::where('is_present', false)->count();
        $attendanceRate = $attendanceCount > 0 ? round(($presentAttendance / $attendanceCount) * 100, 1) : 0;
        $this->command->info("   Present records: {$presentAttendance}");
        $this->command->info("   Absent records: {$absentAttendance}");
        $this->command->info("   Attendance rate: {$attendanceRate}%");
        $this->command->newLine();

        // Database size estimation
        $this->command->info("💾 Database Size Estimation:");
        $tables = ['users', 'groups', 'students', 'payments', 'attendances'];
        $totalRows = 0;
        
        foreach ($tables as $table) {
            $count = DB::table($table)->count();
            $totalRows += $count;
            $this->command->info("   {$table}: {$count} rows");
        }
        
        $this->command->info("   Total rows: {$totalRows}");
        $estimatedSizeMB = round($totalRows * 0.001, 2); // Very rough estimation
        $this->command->info("   Estimated size: ~{$estimatedSizeMB} MB");
        $this->command->newLine();

        // Sample data preview
        $this->command->info("👀 Sample Data Preview:");
        $sampleTeacher = User::where('type', 'teacher')->first();
        if ($sampleTeacher) {
            $this->command->info("   Sample Teacher: {$sampleTeacher->name} ({$sampleTeacher->email})");
            $teacherGroups = Group::where('user_id', $sampleTeacher->id)->count();
            $teacherStudents = Student::where('user_id', $sampleTeacher->id)->count();
            $this->command->info("   - Groups: {$teacherGroups}");
            $this->command->info("   - Students: {$teacherStudents}");
        }

        $sampleStudent = Student::first();
        if ($sampleStudent) {
            $this->command->info("   Sample Student: {$sampleStudent->name}");
            $studentPayments = Payment::where('student_id', $sampleStudent->id)->count();
            $studentAttendance = Attendance::where('student_id', $sampleStudent->id)->count();
            $this->command->info("   - Payments: {$studentPayments}");
            $this->command->info("   - Attendance records: {$studentAttendance}");
        }

        $this->command->newLine();
        $this->command->info("✅ Data verification completed!");
    }
}
