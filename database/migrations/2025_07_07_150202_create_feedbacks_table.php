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
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['suggestion', 'bug', 'question'])->comment('Type of feedback');
            $table->text('message')->comment('Feedback message content');
            $table->enum('status', ['new', 'in_progress', 'resolved'])->default('new')->comment('Admin management status');
            $table->text('reply')->nullable()->comment('Admin reply to the feedback');
            $table->timestamp('responded_at')->nullable()->comment('When admin responded');
            $table->boolean('is_read_by_admin')->default(false)->comment('Whether admin has read this feedback');
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index(['type', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
