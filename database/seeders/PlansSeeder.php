<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing plans safely
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Plan::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Create the subscription plans with the new structure
        $plans = [
            [
                'name' => 'تجريبية',
                'max_students' => 50,
                'max_assistants' => 0,
                'duration_days' => 30,
                'price' => 0,
                'is_trial' => true,
                'is_default' => true,
            ],
            [
                'name' => 'شهرية أساسية',
                'max_students' => 100,
                'max_assistants' => 1,
                'duration_days' => 30,
                'price' => 100, // 100 ج.م
                'is_trial' => false,
                'is_default' => false,
            ],
            [
                'name' => 'شهرية متقدمة',
                'max_students' => 500,
                'max_assistants' => 2,
                'duration_days' => 30,
                'price' => 200, // 200 ج.م
                'is_trial' => false,
                'is_default' => false,
            ],
            [
                'name' => 'شهرية موسعة',
                'max_students' => 2000,
                'max_assistants' => 4,
                'duration_days' => 30,
                'price' => 500, // 500 ج.م
                'is_trial' => false,
                'is_default' => false,
            ],

            [
                'name' => 'ربع سنوية أساسية',
                'max_students' => 100,
                'max_assistants' => 1,
                'duration_days' => 30,
                'price' => 250, // 250 ج.م
                'is_trial' => false,
                'is_default' => false,
            ],
             [
                'name' => 'ربع سنوية متقدمة',
                'max_students' => 500,
                'max_assistants' => 2,
                'duration_days' => 30,
                'price' => 500, // 500 ج.م
                'is_trial' => false,
                'is_default' => false,
            ],
            [
                'name' => 'ربع سنوية موسعة',
                'max_students' => 2000,
                'max_assistants' => 4,
                'duration_days' => 30,
                'price' => 1200, // 1200 ج.م
                'is_trial' => false,
                'is_default' => false,
            ],
            [
                'name' => 'سنوية',
                'max_students' => 100,
                'max_assistants' => 3,
                'duration_days' => 365,
                'price' => 2000, // 2000 ج.م
                'is_trial' => false,
                'is_default' => false,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }
    }
}
