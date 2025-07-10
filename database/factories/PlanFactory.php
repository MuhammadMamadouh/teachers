<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Plan;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Plan>
 */
class PlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement(['الأساسية', 'المتقدمة', 'الاحترافية']),
            'price' => $this->faker->randomFloat(2, 50, 500),
            'max_students' => $this->faker->randomElement([10, 25, 50, 100]),
            'max_assistants' => $this->faker->randomElement([0, 1, 2, 5]),
            'is_trial' => false,
            'is_default' => false,
        ];
    }

    /**
     * Indicate that the plan is a trial plan.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_trial' => true,
            'price' => 0,
            'max_students' => 5,
            'max_assistants' => 0,
        ]);
    }

    /**
     * Indicate that the plan is the default plan.
     */
    public function default(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }

    /**
     * Create a basic plan.
     */
    public function basic(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'الأساسية',
            'price' => 50,
            'max_students' => 10,
            'max_assistants' => 0,
        ]);
    }

    /**
     * Create a premium plan.
     */
    public function premium(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'الاحترافية',
            'price' => 200,
            'max_students' => 100,
            'max_assistants' => 5,
        ]);
    }
}
