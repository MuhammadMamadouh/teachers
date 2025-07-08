<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add type column with enum values
            $table->enum('type', ['teacher', 'assistant'])->default('teacher');
            
            // Add teacher_id for assistant users
            $table->foreignId('teacher_id')->nullable()->constrained('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['teacher_id']);
            
            // Drop the columns
            $table->dropColumn(['type', 'teacher_id']);
        });
    }
};
