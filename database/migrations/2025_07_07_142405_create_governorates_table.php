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
        Schema::create('governorates', function (Blueprint $table) {
            $table->id();
            $table->string('name_ar')->comment('Arabic name of the governorate');
            $table->string('name_en')->comment('English name of the governorate');
            $table->string('code', 10)->unique()->comment('Governorate code');
            $table->decimal('latitude', 10, 8)->nullable()->comment('Latitude coordinate');
            $table->decimal('longitude', 11, 8)->nullable()->comment('Longitude coordinate');
            $table->integer('population')->nullable()->comment('Population count');
            $table->decimal('area', 10, 2)->nullable()->comment('Area in square kilometers');
            $table->boolean('is_active')->default(true)->comment('Whether this governorate is active');
            $table->timestamps();
            
            $table->index(['name_ar', 'is_active']);
            $table->index('code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('governorates');
    }
};
