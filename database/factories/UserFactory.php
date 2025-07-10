<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $arabicNames = [
            'أحمد محمد العتيبي', 'فاطمة عبدالله المطيري', 'محمد علي الدوسري', 'عائشة حسن القحطاني',
            'علي أحمد الغامدي', 'زينب محمد الزهراني', 'حسن عبدالرحمن الشهري', 'مريم خالد العنزي',
            'يوسف سعد الحربي', 'نور عبدالعزيز المالكي', 'عبدالله فهد السبيعي', 'سارة طارق الشمري',
            'إبراهيم ماجد العامري', 'دينا نواف البلوي', 'عمر سلطان الثقفي', 'هند بندر الجهني'
        ];

        $subjects = [
            'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة العربية', 
            'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا', 'التربية الإسلامية', 'الحاسوب'
        ];

        return [
            'name' => $this->faker->randomElement($arabicNames),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('123456'),
            'remember_token' => Str::random(10),
            'phone' => '05' . $this->faker->numerify('########'),
            'subject' => $this->faker->randomElement($subjects),
            'notes' => $this->faker->boolean(20) ? $this->faker->sentence() : null,
            'is_approved' => true,
            'is_admin' => false,
            'approved_at' => now(),
            'type' => 'teacher',
            'teacher_id' => null, // Will be set for assistants
            'governorate_id' => null, // Will be set by seeder if governorates exist
            'onboarding_completed' => $this->faker->boolean(80),
            'onboarding_completed_at' => $this->faker->boolean(80) ? now() : null,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user is a teacher.
     */
    public function teacher(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'teacher',
            'is_admin' => false,
            'is_approved' => true,
            'approved_at' => now(),
            'onboarding_completed' => true,
            'onboarding_completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the user is an assistant.
     */
    public function assistant(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'assistant',
            'is_admin' => false,
            'is_approved' => true,
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the user is an admin.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'teacher',
            'is_admin' => true,
            'is_approved' => true,
            'approved_at' => now(),
        ]);
    }
}
