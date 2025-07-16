<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Center management
            'view center',
            'edit center',
            'manage center users',
            'invite users',
            
            // Student management
            'view all students',
            'view own students',
            'create students',
            'edit students',
            'delete students',
            
            // Group management
            'view all groups',
            'view own groups',
            'create groups',
            'edit groups',
            'delete groups',
            
            // Attendance management
            'view all attendance',
            'view own attendance',
            'manage attendance',
            
            // Subscription management
            'view subscriptions',
            'manage subscriptions',
            
            // Reports
            'view all reports',
            'view own reports',
            
            // Settings
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles and assign permissions
        $adminRole = Role::create(['name' => 'admin']);
        $teacherRole = Role::create(['name' => 'teacher']);
        $assistantRole = Role::create(['name' => 'assistant']);

        // Admin permissions (center owner/admin)
        $adminRole->givePermissionTo([
            'view center',
            'edit center',
            'manage center users',
            'invite users',
            'view all students',
            'create students',
            'edit students',
            'delete students',
            'view all groups',
            'create groups',
            'edit groups',
            'delete groups',
            'view all attendance',
            'manage attendance',
            'view subscriptions',
            'manage subscriptions',
            'view all reports',
            'manage settings',
        ]);

        // Teacher permissions (own data only)
        $teacherRole->givePermissionTo([
            'view center',
            'view own students',
            'create students',
            'edit students',
            'view own groups',
            'create groups',
            'edit groups',
            'view own attendance',
            'manage attendance',
            'view own reports',
        ]);

        // Assistant permissions (limited, customizable)
        $assistantRole->givePermissionTo([
            'view center',
            'view own students',
            'view own groups',
            'view own attendance',
            'view own reports',
        ]);
    }
}
