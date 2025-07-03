<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Student;
use App\Models\Group;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all records from the pivot table
        $pivotRecords = DB::table('group_student')->get();
        
        foreach ($pivotRecords as $record) {
            $student = Student::find($record->student_id);
            
            // Only update if the student doesn't already have a primary group
            if ($student && !$student->group_id) {
                $student->group_id = $record->group_id;
                $student->save();
                
                // Log the migration
                Log::info("Migrated student ID {$student->id} to primary group ID {$record->group_id}");
            } elseif ($student) {
                // Log if there's a conflict (student already has a primary group)
                Log::warning("Student ID {$student->id} already has primary group ID {$student->group_id}, conflicting with pivot group ID {$record->group_id}");
            }
        }
        
        // Note: We're not deleting the pivot table or records yet, 
        // to give time for application code to be updated
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed automatically as it's a data migration
        // If you need to revert, you'll need to manually restore the data
    }
};
