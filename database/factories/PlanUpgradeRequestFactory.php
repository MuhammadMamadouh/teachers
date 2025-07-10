<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\PlanUpgradeRequest;
use App\Models\User;
use App\Models\Plan;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PlanUpgradeRequest>
 */
class PlanUpgradeRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'current_plan_id' => Plan::factory(),
            'requested_plan_id' => Plan::factory(),
            'status' => 'pending',
            'notes' => $this->faker->optional()->sentence(),
            'admin_notes' => null,
            'approved_by' => null,
            'approved_at' => null,
        ];
    }

    /**
     * Indicate that the request is approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'approved_by' => User::factory()->admin(),
            'approved_at' => now(),
        ]);
    }

    /**
     * Indicate that the request is rejected.
     */
    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'approved_by' => User::factory()->admin(),
            'approved_at' => now(),
        ]);
    }
}
