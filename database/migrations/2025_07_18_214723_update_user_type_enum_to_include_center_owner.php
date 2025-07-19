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
            // Change the type column to include center_owner
            $table->enum('type', ['teacher', 'assistant', 'center_owner'])->default('teacher')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('type', ['teacher', 'assistant'])->default('teacher')->change();
        });
    }
};
