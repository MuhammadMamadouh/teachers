<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use App\Models\Group;
use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $arabicFirstNames = [
            'أحمد', 'محمد', 'علي', 'حسن', 'يوسف', 'عبدالله', 'إبراهيم', 'عمر', 'خالد', 'سعد',
            'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'نور', 'سارة', 'دينا', 'هند', 'ليلى',
            'عبدالرحمن', 'عبدالعزيز', 'ماجد', 'فهد', 'طارق', 'نواف', 'سلطان', 'بندر', 'تركي',
            'أميرة', 'ريم', 'رنا', 'دانا', 'جنى', 'لما', 'شهد', 'غلا', 'رؤى', 'لين'
        ];

        $arabicLastNames = [
            'العتيبي', 'المطيري', 'الدوسري', 'القحطاني', 'الغامدي', 'الزهراني', 'الشهري', 'العنزي',
            'الحربي', 'المالكي', 'السبيعي', 'الشمري', 'العامري', 'البلوي', 'الثقفي', 'الجهني',
            'العسيري', 'الخالدي', 'الرشيدي', 'الصاعدي', 'القرشي', 'الفيصل', 'السعد', 'الحمد'
        ];

        $firstName = $this->faker->randomElement($arabicFirstNames);
        $lastName = $this->faker->randomElement($arabicLastNames);

        return [
            'user_id' => User::factory(),
            'name' => $firstName . ' ' . $lastName,
            'phone' => '05' . $this->faker->numerify('########'),
            'guardian_phone' => '05' . $this->faker->numerify('########'),
            'academic_year_id' => AcademicYear::factory(),
            'group_id' => Group::factory(),
        ];
    }
}
