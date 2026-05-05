<?php

namespace Database\Factories;

use App\Models\Constante;
use App\Models\Consultation;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConstanteFactory extends Factory
{
    protected $model = Constante::class;

    public function definition(): array
    {
        return [
            'consultation_id' => Consultation::factory(),
            'tension_arterielle' => $this->faker->randomElement([
                '12/8',
                '13/8',
                '14/9',
                '11/7',
                '13/7',
                '15/9',
                '12/7'
            ]),
            'temperature' => $this->faker->randomFloat(1, 35.5, 39.5),
            'poids' => $this->faker->randomFloat(1, 50, 120),
            'taille' => $this->faker->numberBetween(150, 190),
            'frequence_cardiaque' => $this->faker->numberBetween(60, 100),
            'glycemie' => $this->faker->randomFloat(2, 4.5, 15.0),
            'saturation_oxygene' => $this->faker->randomFloat(1, 92, 99),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Constantes normales
     */
    public function normales(): static
    {
        return $this->state(fn (array $attributes) => [
            'tension_arterielle' => '12/8',
            'temperature' => 37.0,
            'frequence_cardiaque' => 72,
            'saturation_oxygene' => 98
        ]);
    }

    /**
     * Patient avec fièvre
     */
    public function fievre(): static
    {
        return $this->state(fn (array $attributes) => [
            'temperature' => $this->faker->randomFloat(1, 38.5, 40.0)
        ]);
    }
}
