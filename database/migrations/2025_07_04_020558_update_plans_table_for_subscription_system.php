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
        Schema::table('plans', function (Blueprint $table) {
            // Add new columns for subscription system
            $table->integer('duration_days')->default(30);
            $table->integer('price')->default(0);
            $table->boolean('is_trial')->default(false);
            
            // Drop the old price_per_month column
            $table->dropColumn('price_per_month');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['duration_days', 'price', 'is_trial']);
            $table->decimal('price_per_month', 8, 2);
        });
    }
};
