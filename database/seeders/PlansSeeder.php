<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlansSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only create plans if they don't exist
        if (Plan::count() == 0) {
            // Create the subscription plans
            Plan::create([
                'name' => 'Basic',
                'max_students' => 10,
                'price_per_month' => 9.99,
                'is_default' => true,
            ]);

            Plan::create([
                'name' => 'Standard',
                'max_students' => 25,
                'price_per_month' => 19.99,
                'is_default' => false,
            ]);

            Plan::create([
                'name' => 'Pro',
                'max_students' => 100,
                'price_per_month' => 39.99,
                'is_default' => false,
            ]);
        }
    }
}
