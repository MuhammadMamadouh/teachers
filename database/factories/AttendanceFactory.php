<?php

namespace Database\Factories;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Group;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attendance>
 */
class AttendanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $isPresent = $this->faker->boolean(80); // 80% attendance rate

        return [
            'date' => $this->faker->date(),
            'is_present' => $isPresent,
            'notes' => $isPresent ? null : ($this->faker->boolean(30) ? 'غياب بعذر' : 'غياب بدون عذر'),
        ];
    }

    /**
     * Indicate that the student was present.
     */
    public function present(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_present' => true,
            'notes' => null,
        ]);
    }

    /**
     * Indicate that the student was absent.
     */
    public function absent(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_present' => false,
            'notes' => $this->faker->randomElement(['غياب بعذر', 'غياب بدون عذر', 'مرض']),
        ]);
    }
}
