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
        Schema::table('centers', function (Blueprint $table) {
            $table->foreignId('governorate_id')->nullable()->after('email')->constrained('governorates')->onDelete('set null');
            $table->index('governorate_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('centers', function (Blueprint $table) {
            $table->dropForeign(['governorate_id']);
            $table->dropIndex(['governorate_id']);
            $table->dropColumn('governorate_id');
        });
    }
};
