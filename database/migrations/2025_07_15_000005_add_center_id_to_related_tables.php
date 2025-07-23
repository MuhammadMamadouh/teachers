<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add center_id to subscriptions table
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade');
            $table->index('center_id');
        });

        // Add center_id to attendances table
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade');
            $table->index('center_id');
        });

        // Add center_id to group_schedules table
        Schema::table('group_schedules', function (Blueprint $table) {
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade');
            $table->index('center_id');
        });

        // Add center_id to group_special_sessions table
        Schema::table('group_special_sessions', function (Blueprint $table) {
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade');
            $table->index('center_id');
        });

        // Add center_id to plan_upgrade_requests table
        Schema::table('plan_upgrade_requests', function (Blueprint $table) {
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade');
            $table->index('center_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropIndex(['center_id']);
            $table->dropColumn('center_id');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropIndex(['center_id']);
            $table->dropColumn('center_id');
        });

        Schema::table('group_schedules', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropIndex(['center_id']);
            $table->dropColumn('center_id');
        });

        Schema::table('group_special_sessions', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropIndex(['center_id']);
            $table->dropColumn('center_id');
        });

        Schema::table('plan_upgrade_requests', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropIndex(['center_id']);
            $table->dropColumn('center_id');
        });
    }
};
