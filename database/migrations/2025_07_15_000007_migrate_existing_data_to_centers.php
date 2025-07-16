<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Center;
use App\Models\Student;
use App\Models\Group;
use App\Models\Subscription;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create centers for existing users and migrate data
        DB::transaction(function () {
            $users = User::where('type', 'teacher')
                ->orWhereNull('type')
                ->get();

            foreach ($users as $user) {
                // Create a center for each existing teacher
                $center = Center::create([
                    'name' => $user->name . ' Center',
                    'type' => 'individual',
                    'owner_id' => $user->id,
                    'is_active' => true,
                ]);

                // Update user with center_id
                $user->update(['center_id' => $center->id]);

                // Update all students for this user
                Student::where('user_id', $user->id)
                    ->update(['center_id' => $center->id]);

                // Update all groups for this user
                Group::where('user_id', $user->id)
                    ->update(['center_id' => $center->id]);

                // Update all subscriptions for this user
                Subscription::where('user_id', $user->id)
                    ->update(['center_id' => $center->id]);

                // Update assistants for this user
                User::where('teacher_id', $user->id)
                    ->update(['center_id' => $center->id]);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be completely reversed as it involves complex data restructuring
        // Consider creating a backup before running this migration
    }
};
