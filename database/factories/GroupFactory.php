<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Group>
 */
class GroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subjects = [
            'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة العربية',
            'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا', 'التربية الإسلامية',
            'الحاسوب', 'العلوم', 'الرياضيات المتقدمة',
        ];

        $levels = [
            'الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس',
            'الصف السادس', 'الصف السابع', 'الصف الثامن', 'الصف التاسع', 'الصف العاشر',
            'الصف الحادي عشر', 'الصف الثاني عشر',
        ];

        $subject = $this->faker->randomElement($subjects);
        $level = $this->faker->randomElement($levels);

        return [
            'user_id' => User::factory(),
            'name' => $subject . ' - ' . $level,
            'description' => 'مجموعة ' . $subject . ' للطلاب في ' . $level,
            'max_students' => $this->faker->numberBetween(15, 25),
            'is_active' => true,
            'payment_type' => $this->faker->randomElement(['monthly', 'per_session']),
            'student_price' => $this->faker->randomFloat(2, 50, 200),
            'academic_year_id' => AcademicYear::factory(),
        ];
    }
}
