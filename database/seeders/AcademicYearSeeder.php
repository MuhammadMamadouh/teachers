<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use Illuminate\Database\Seeder;

class AcademicYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $academicYears = [
            // Primary School (الابتدائي)
            ['code' => 'first_primary',     'name_ar' => 'الصف الأول الابتدائي',   'level' => 'ابتدائي'],
            ['code' => 'second_primary',    'name_ar' => 'الصف الثاني الابتدائي',  'level' => 'ابتدائي'],
            ['code' => 'third_primary',     'name_ar' => 'الصف الثالث الابتدائي',  'level' => 'ابتدائي'],
            ['code' => 'fourth_primary',    'name_ar' => 'الصف الرابع الابتدائي',  'level' => 'ابتدائي'],
            ['code' => 'fifth_primary',     'name_ar' => 'الصف الخامس الابتدائي',  'level' => 'ابتدائي'],
            ['code' => 'sixth_primary',     'name_ar' => 'الصف السادس الابتدائي',  'level' => 'ابتدائي'],

            // Preparatory School (الإعدادي)
            ['code' => 'first_preparatory', 'name_ar' => 'الصف الأول الإعدادي',   'level' => 'إعدادي'],
            ['code' => 'second_preparatory','name_ar' => 'الصف الثاني الإعدادي',  'level' => 'إعدادي'],
            ['code' => 'third_preparatory', 'name_ar' => 'الصف الثالث الإعدادي',  'level' => 'إعدادي'],

            // Secondary School (الثانوي)
            ['code' => 'first_secondary',   'name_ar' => 'الصف الأول الثانوي',    'level' => 'ثانوي'],
            ['code' => 'second_secondary',  'name_ar' => 'الصف الثاني الثانوي',   'level' => 'ثانوي'],
            ['code' => 'third_secondary',   'name_ar' => 'الصف الثالث الثانوي',   'level' => 'ثانوي'],
        ];

        foreach ($academicYears as $academicYear) {
            AcademicYear::create($academicYear);
        }
    }
}
