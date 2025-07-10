<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdatePlansWithAssistantLimits extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing plans with reasonable assistant limits
        DB::table('plans')->where('max_students', '<=', 10)->update(['max_assistants' => 1]);
        DB::table('plans')->where('max_students', '>', 10)->where('max_students', '<=', 25)->update(['max_assistants' => 2]);
        DB::table('plans')->where('max_students', '>', 25)->where('max_students', '<=', 50)->update(['max_assistants' => 3]);
        DB::table('plans')->where('max_students', '>', 50)->update(['max_assistants' => 5]);

        $this->command->info('Plans updated with assistant limits');
    }
}
