<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Center;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Center>
 */
class CenterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $arabicCenterNames = [
            'مركز الإبداع التعليمي',
            'مركز النور للتعليم',
            'مركز التميز الأكاديمي',
            'مركز الأمل التعليمي',
            'مركز الفجر للتعليم',
            'مركز البراعة التعليمية',
            'مركز الرؤية التعليمي',
            'مركز الإنجاز الأكاديمي',
            'مركز الصفوة التعليمي',
            'مركز المستقبل للتعليم',
        ];

        return [
            'name' => $this->faker->randomElement($arabicCenterNames),
            'type' => $this->faker->randomElement(['individual', 'organization']),
            'address' => $this->faker->address(),
            'phone' => '05' . $this->faker->numerify('########'),
            'email' => $this->faker->unique()->safeEmail(),
            'description' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }

    /**
     * Indicate that the center is individual (single teacher).
     */
    public function individual(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'individual',
        ]);
    }

    /**
     * Indicate that the center is an organization (multiple teachers).
     */
    public function organization(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'organization',
        ]);
    }

    /**
     * Indicate that the center is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
