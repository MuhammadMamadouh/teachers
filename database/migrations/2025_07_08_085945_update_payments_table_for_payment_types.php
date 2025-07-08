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
        // Drop the table and recreate it with the new structure
        Schema::dropIfExists('payments');
        
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->enum('payment_type', ['monthly', 'per_session']);
            $table->date('related_date'); // For per_session → attendance date, for monthly → month start
            $table->decimal('amount', 8, 2);
            $table->boolean('is_paid')->default(false);
            $table->datetime('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure no duplicate payment record for same student, group, and related_date
            $table->unique(['group_id', 'student_id', 'related_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new table and recreate the old one
        Schema::dropIfExists('payments');
        
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->integer('month'); // 1-12
            $table->integer('year'); // e.g., 2025
            $table->boolean('is_paid')->default(false);
            $table->decimal('amount', 8, 2)->nullable();
            $table->date('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['student_id', 'group_id', 'month', 'year']);
        });
    }
};
