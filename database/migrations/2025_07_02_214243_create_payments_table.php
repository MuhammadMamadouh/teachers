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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->integer('month'); // 1-12
            $table->integer('year'); // e.g., 2025
            $table->boolean('is_paid')->default(false);
            $table->decimal('amount', 8, 2)->nullable(); // Optional: track payment amount
            $table->date('paid_date')->nullable(); // Optional: when payment was received
            $table->text('notes')->nullable(); // Optional: payment notes
            $table->timestamps();
            
            // Ensure no duplicate payment record for same student, group, month, and year
            $table->unique(['student_id', 'group_id', 'month', 'year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
