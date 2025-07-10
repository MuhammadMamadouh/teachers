<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amounts = [300, 350, 400, 450, 500, 550, 600];
        $isPaid = $this->faker->boolean(85); // 85% chance of being paid

        return [
            'is_paid' => $isPaid,
            'amount' => $this->faker->randomElement($amounts),
            'paid_at' => $isPaid ? $this->faker->dateTimeThisYear() : null,
            'notes' => $isPaid ? null : ($this->faker->boolean(30) ? 'متأخر في الدفع' : null),
        ];
    }

    /**
     * Indicate that the payment is paid.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_paid' => true,
            'paid_at' => $this->faker->dateTimeThisYear(),
            'notes' => null,
        ]);
    }

    /**
     * Indicate that the payment is unpaid.
     */
    public function unpaid(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_paid' => false,
            'paid_at' => null,
            'notes' => $this->faker->randomElement(['متأخر في الدفع', 'لم يدفع بعد', null]),
        ]);
    }
}
