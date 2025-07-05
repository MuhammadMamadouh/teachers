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
            // Update existing price column (if it exists as integer) to decimal for Egyptian pounds
            // The price column will now store Egyptian pounds directly (not cents)
            $table->decimal('price', 10, 2)->change()->comment('Price in Egyptian Pounds (EGP)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            // Revert back to integer (cents) if needed
            $table->integer('price')->change()->comment('Price in cents');
        });
    }
};
