<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Admin User',
            'email' => 'admin@admin.com',
            'password' => bcrypt('123456'),
            'phone' => '555-0000',
            'subject' => 'Administrator',
            'city' => 'Admin City',
            'is_admin' => true,
            'is_approved' => true,
            'approved_at' => now(),
        ]);
    }
}
