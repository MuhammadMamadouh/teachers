<?php

namespace Database\Seeders;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Seeder;

class DefaultSubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default subscriptions for all existing users without subscriptions
        $usersWithoutSubscriptions = User::whereDoesntHave('subscriptions')->get();

        foreach ($usersWithoutSubscriptions as $user) {
            Subscription::create([
                'user_id' => $user->id,
                'max_students' => 5,
                'is_active' => true,
                'start_date' => now(),
                'end_date' => null, // No end date for free tier
            ]);
        }
    }
}
