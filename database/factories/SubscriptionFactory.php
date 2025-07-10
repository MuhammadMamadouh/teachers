<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Plan;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('-1 month', 'now');
        $endDate = $this->faker->dateTimeBetween($startDate, '+2 months');

        return [
            'user_id' => User::factory(),
            'plan_id' => Plan::factory(),
            'is_active' => true,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'max_students' => $this->faker->randomElement([5, 10, 25, 50, 100]),
        ];
    }

    /**
     * Indicate that the subscription is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
            'start_date' => now()->subMonths(3),
            'end_date' => now()->subDays(5),
        ]);
    }

    /**
     * Indicate that the subscription is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'start_date' => now()->subDays(10),
            'end_date' => now()->addDays(20),
        ]);
    }

    /**
     * Indicate that the subscription is a trial.
     */
    public function trial(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDays(25),
            'max_students' => 5,
        ]);
    }
}
