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
        Schema::table('users', function (Blueprint $table) {
            // Add center_id to link users to centers
            $table->foreignId('center_id')->nullable()->constrained('centers')->onDelete('cascade');
            $table->index('center_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['center_id']);
            $table->dropIndex(['center_id']);
            $table->dropColumn('center_id');
        });
    }
};
