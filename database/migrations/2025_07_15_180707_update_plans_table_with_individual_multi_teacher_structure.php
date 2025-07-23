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
            // Add new columns for plan categorization
            $table->enum('category', ['individual', 'multi_teacher'])->after('plan_type')->default('individual');
            $table->string('target_audience')->after('category')->nullable(); // 'معلم واحد', 'مراكز صغيرة', 'مراكز كبيرة'
            $table->boolean('is_featured')->after('target_audience')->default(false);
            $table->integer('sort_order')->after('is_featured')->default(0);
            $table->json('features')->after('sort_order')->nullable(); // Array of features
            $table->string('billing_cycle')->after('features')->default('monthly'); // monthly, yearly
            $table->decimal('yearly_price', 8, 2)->after('billing_cycle')->nullable();
            $table->integer('yearly_discount_percentage')->after('yearly_price')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn([
                'category',
                'target_audience',
                'is_featured',
                'sort_order',
                'features',
                'billing_cycle',
                'yearly_price',
                'yearly_discount_percentage'
            ]);
        });
    }
};
