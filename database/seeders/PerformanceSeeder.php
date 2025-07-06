<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class PerformanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $choice = $this->command->choice(
            'Which performance test would you like to run?',
            [
                'small' => 'Small Test (10 teachers, quick setup)',
                'large' => 'Large Test (1000 teachers, full performance test)',
            ],
            'small'
        );

        if ($choice === 'small') {
            $this->call(SmallTestSeeder::class);
        } else {
            $this->call(PerformanceTestSeeder::class);
        }
    }
}
