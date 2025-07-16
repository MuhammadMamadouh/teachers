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
        $updates = [
            'first_primary' => 'ابتدائي',
            'second_primary' => 'ابتدائي',
            'third_primary' => 'ابتدائي',
            'fourth_primary' => 'ابتدائي',
            'fifth_primary' => 'ابتدائي',
            'sixth_primary' => 'ابتدائي',
            'first_preparatory' => 'إعدادي',
            'second_preparatory' => 'إعدادي',
            'third_preparatory' => 'إعدادي',
            'first_secondary' => 'ثانوي',
            'second_secondary' => 'ثانوي',
            'third_secondary' => 'ثانوي',
        ];

        foreach ($updates as $code => $level) {
            \App\Models\AcademicYear::where('code', $code)->update(['level' => $level]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \App\Models\AcademicYear::query()->update(['level' => null]);
    }
};
