<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call([
            GovernorateSeeder::class,
            PlansSeeder::class,
            AdminUserSeeder::class,
            // DefaultSubscriptionSeeder::class,
            // GroupSeeder::class,
        ]);
        
        // Uncomment one of the following for performance testing:
        // $this->call(SmallTestSeeder::class);        // For quick testing (10 teachers)
        // $this->call(PerformanceTestSeeder::class);  // For performance testing (1000 teachers)
        
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
