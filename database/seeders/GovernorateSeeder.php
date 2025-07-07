<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Governorate;

class GovernorateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $governorates = [
            [
                'name_ar' => 'القاهرة',
                'name_en' => 'Cairo',
                'code' => 'C',
                'latitude' => 30.0444,
                'longitude' => 31.2357,
                'population' => 10230350,
                'area' => 3085.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الجيزة',
                'name_en' => 'Giza',
                'code' => 'GZ',
                'latitude' => 30.0131,
                'longitude' => 31.2089,
                'population' => 9200000,
                'area' => 13720.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الإسكندرية',
                'name_en' => 'Alexandria',
                'code' => 'ALX',
                'latitude' => 31.2001,
                'longitude' => 29.9187,
                'population' => 5200000,
                'area' => 2679.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الدقهلية',
                'name_en' => 'Dakahlia',
                'code' => 'DK',
                'latitude' => 31.1656,
                'longitude' => 31.4913,
                'population' => 6679000,
                'area' => 3459.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'البحر الأحمر',
                'name_en' => 'Red Sea',
                'code' => 'BA',
                'latitude' => 24.6977,
                'longitude' => 34.2067,
                'population' => 359000,
                'area' => 203685.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'البحيرة',
                'name_en' => 'Beheira',
                'code' => 'BH',
                'latitude' => 30.8481,
                'longitude' => 30.3435,
                'population' => 6177000,
                'area' => 9826.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الفيوم',
                'name_en' => 'Fayoum',
                'code' => 'FYM',
                'latitude' => 29.2793,
                'longitude' => 30.8418,
                'population' => 3747000,
                'area' => 6068.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الغربية',
                'name_en' => 'Gharbia',
                'code' => 'GH',
                'latitude' => 30.8754,
                'longitude' => 31.0335,
                'population' => 5106000,
                'area' => 1942.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الإسماعيلية',
                'name_en' => 'Ismailia',
                'code' => 'IS',
                'latitude' => 30.5965,
                'longitude' => 32.2715,
                'population' => 1304000,
                'area' => 5067.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'المنوفية',
                'name_en' => 'Monufia',
                'code' => 'MN',
                'latitude' => 30.5972,
                'longitude' => 31.0118,
                'population' => 4237000,
                'area' => 2499.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'المنيا',
                'name_en' => 'Minya',
                'code' => 'MNY',
                'latitude' => 28.0871,
                'longitude' => 30.7618,
                'population' => 5497000,
                'area' => 32279.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'القليوبية',
                'name_en' => 'Qalyubia',
                'code' => 'KB',
                'latitude' => 30.1792,
                'longitude' => 31.2421,
                'population' => 5627000,
                'area' => 1001.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الوادي الجديد',
                'name_en' => 'New Valley',
                'code' => 'WAD',
                'latitude' => 25.4510,
                'longitude' => 30.5532,
                'population' => 247000,
                'area' => 376505.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الشرقية',
                'name_en' => 'Sharqia',
                'code' => 'SH',
                'latitude' => 30.5852,
                'longitude' => 31.5041,
                'population' => 7163000,
                'area' => 4180.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'سوهاج',
                'name_en' => 'Sohag',
                'code' => 'SHG',
                'latitude' => 26.5569,
                'longitude' => 31.6948,
                'population' => 5127000,
                'area' => 11022.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'جنوب سيناء',
                'name_en' => 'South Sinai',
                'code' => 'JS',
                'latitude' => 28.4593,
                'longitude' => 33.8116,
                'population' => 103000,
                'area' => 31272.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'شمال سيناء',
                'name_en' => 'North Sinai',
                'code' => 'SIN',
                'latitude' => 30.2832,
                'longitude' => 33.6176,
                'population' => 455000,
                'area' => 27574.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'كفر الشيخ',
                'name_en' => 'Kafr el-Sheikh',
                'code' => 'KFS',
                'latitude' => 31.1107,
                'longitude' => 30.9388,
                'population' => 3172000,
                'area' => 3437.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'قنا',
                'name_en' => 'Qena',
                'code' => 'KN',
                'latitude' => 26.1551,
                'longitude' => 32.7160,
                'population' => 3164000,
                'area' => 8980.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'أسوان',
                'name_en' => 'Aswan',
                'code' => 'ASN',
                'latitude' => 24.0889,
                'longitude' => 32.8998,
                'population' => 1568000,
                'area' => 679.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'أسيوط',
                'name_en' => 'Asyut',
                'code' => 'AST',
                'latitude' => 27.1809,
                'longitude' => 31.1837,
                'population' => 4380000,
                'area' => 13720.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'بني سويف',
                'name_en' => 'Beni Suef',
                'code' => 'BNS',
                'latitude' => 29.0661,
                'longitude' => 31.0994,
                'population' => 3154000,
                'area' => 10954.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'بورسعيد',
                'name_en' => 'Port Said',
                'code' => 'PTS',
                'latitude' => 31.2653,
                'longitude' => 32.3019,
                'population' => 749000,
                'area' => 1345.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'دمياط',
                'name_en' => 'Damietta',
                'code' => 'DT',
                'latitude' => 31.8133,
                'longitude' => 31.7669,
                'population' => 1496000,
                'area' => 910.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'السويس',
                'name_en' => 'Suez',
                'code' => 'SUZ',
                'latitude' => 29.9668,
                'longitude' => 32.5498,
                'population' => 728000,
                'area' => 25400.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'الأقصر',
                'name_en' => 'Luxor',
                'code' => 'LXR',
                'latitude' => 25.6872,
                'longitude' => 32.6396,
                'population' => 1250000,
                'area' => 416.00,
                'is_active' => true
            ],
            [
                'name_ar' => 'مطروح',
                'name_en' => 'Matrouh',
                'code' => 'MT',
                'latitude' => 31.3543,
                'longitude' => 27.2373,
                'population' => 425000,
                'area' => 166563.00,
                'is_active' => true
            ]
        ];

        foreach ($governorates as $governorate) {
            Governorate::updateOrCreate(
                ['code' => $governorate['code']],
                $governorate
            );
        }
    }
}
