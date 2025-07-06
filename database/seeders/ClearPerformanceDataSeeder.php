<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClearPerformanceDataSeeder extends Seeder
{
    /**
     * Clear all performance test data while preserving essential data.
     */
    public function run(): void
    {
        $this->command->info('Clearing performance test data...');
        
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear data in proper order to respect foreign key constraints
        $tables = [
            'attendances',
            'payments',
            'students',
            'groups'
        ];
        
        foreach ($tables as $table) {
            $count = DB::table($table)->count();
            DB::table($table)->truncate();
            $this->command->info("Cleared {$count} records from {$table} table");
        }
        
        // Clear non-admin users (teachers and assistants)
        $userCount = DB::table('users')->where('is_admin', false)->count();
        DB::table('users')->where('is_admin', false)->delete();
        $this->command->info("Cleared {$userCount} teacher/assistant users");
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->command->info('✅ Performance test data cleared successfully!');
        $this->command->info('Admin users and plans have been preserved.');
    }
}
