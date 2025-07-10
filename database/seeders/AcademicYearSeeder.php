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
            ['code' => 'first_primary',     'name_ar' => 'الصف الأول الابتدائي'],
            ['code' => 'second_primary',    'name_ar' => 'الصف الثاني الابتدائي'],
            ['code' => 'third_primary',     'name_ar' => 'الصف الثالث الابتدائي'],
            ['code' => 'fourth_primary',    'name_ar' => 'الصف الرابع الابتدائي'],
            ['code' => 'fifth_primary',     'name_ar' => 'الصف الخامس الابتدائي'],
            ['code' => 'sixth_primary',     'name_ar' => 'الصف السادس الابتدائي'],

            // Preparatory School (الإعدادي)
            ['code' => 'first_preparatory', 'name_ar' => 'الصف الأول الإعدادي'],
            ['code' => 'second_preparatory','name_ar' => 'الصف الثاني الإعدادي'],
            ['code' => 'third_preparatory', 'name_ar' => 'الصف الثالث الإعدادي'],

            // Secondary School (الثانوي)
            ['code' => 'first_secondary',   'name_ar' => 'الصف الأول الثانوي'],
            ['code' => 'second_secondary',  'name_ar' => 'الصف الثاني الثانوي'],
            ['code' => 'third_secondary',   'name_ar' => 'الصف الثالث الثانوي'],
        ];

        foreach ($academicYears as $academicYear) {
            AcademicYear::create($academicYear);
        }
    }
}
