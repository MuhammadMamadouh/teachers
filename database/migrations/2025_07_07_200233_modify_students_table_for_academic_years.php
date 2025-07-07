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
        Schema::table('students', function (Blueprint $table) {
            // Remove guardian_name field if it exists
            if (Schema::hasColumn('students', 'guardian_name')) {
                $table->dropColumn('guardian_name');
            }
            
            // Add academic_year_id foreign key as nullable first (since there might be existing data)
            $table->foreignId('academic_year_id')->nullable()->after('group_id')->constrained('academic_years')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            // Drop foreign key and column
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
            
            // Add back guardian_name field
            $table->string('guardian_name')->nullable();
        });
    }
};
