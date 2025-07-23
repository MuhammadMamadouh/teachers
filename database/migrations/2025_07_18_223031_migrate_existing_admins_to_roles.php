<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Get all users who are currently marked as admins
        $adminUsers = User::where('is_admin', true)->get();
        
        // Ensure roles exist
        $systemAdminRole = Role::firstOrCreate(['name' => 'system-admin']);
        $centerAdminRole = Role::firstOrCreate(['name' => 'center-admin']);
        
        foreach ($adminUsers as $user) {
            // If user has center_id, they're a center admin
            if ($user->center_id) {
                $user->assignRole('center-admin');
            } else {
                // Otherwise, they're a system admin
                $user->assignRole('system-admin');
            }
        }
        
        // Also assign roles to existing users based on their type
        $centerOwners = User::where('type', 'center_owner')->get();
        foreach ($centerOwners as $user) {
            if (!$user->hasRole('center-admin')) {
                $user->assignRole('center-admin');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove role assignments
        $users = User::all();
        foreach ($users as $user) {
            $user->removeRole('system-admin');
            $user->removeRole('center-admin');
        }
    }
};
