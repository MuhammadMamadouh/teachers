<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        $roles = [
            'system-admin',
            'center-admin',
            'teacher',
            'assistant',
        ];

        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // Create permissions
        $permissions = [
            'manage-system',
            'manage-all-centers',
            'manage-all-teachers',
            'manage-all-plans',
            'manage-center',
            'manage-center-users',
            'manage-students',
            'manage-groups',
            'manage-attendance',
            'manage-payments',
            'view-reports',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName]);
        }

        // Assign permissions to roles
        $systemAdminRole = Role::findByName('system-admin');
        $centerAdminRole = Role::findByName('center-admin');
        $teacherRole = Role::findByName('teacher');
        $assistantRole = Role::findByName('assistant');

        // System admin gets all permissions
        $systemAdminRole->givePermissionTo(Permission::all());

        // Center admin gets center-specific permissions
        $centerAdminRole->givePermissionTo([
            'manage-center',
            'manage-center-users',
            'manage-students',
            'manage-groups',
            'manage-attendance',
            'manage-payments',
            'view-reports',
        ]);

        // Teacher gets teaching-specific permissions
        $teacherRole->givePermissionTo([
            'manage-students',
            'manage-groups',
            'manage-attendance',
            'manage-payments',
            'view-reports',
        ]);

        // Assistant gets limited permissions (will be assigned dynamically)
        $assistantRole->givePermissionTo([
            'manage-attendance',
            'view-reports',
        ]);

        $this->command->info('Roles and permissions created successfully!');
    }
}
