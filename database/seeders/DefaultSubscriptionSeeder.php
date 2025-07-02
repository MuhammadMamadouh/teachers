<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\User;
use App\Models\Plan;
use Illuminate\Database\Seeder;

class DefaultSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the default plan
        $defaultPlan = Plan::where('is_default', true)->first();
        
        if (!$defaultPlan) {
            $this->command->warn('No default plan found. Skipping subscription creation.');
            return;
        }

        // Create default subscriptions for all existing users without subscriptions
        $usersWithoutSubscriptions = User::whereDoesntHave('subscriptions')->get();

        foreach ($usersWithoutSubscriptions as $user) {
            Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $defaultPlan->id,
                'max_students' => $defaultPlan->max_students, // Keep for backward compatibility
                'is_active' => true,
                'start_date' => now(),
                'end_date' => null, // No end date for basic plan
            ]);
        }
    }
}
