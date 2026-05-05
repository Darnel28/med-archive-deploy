<?php

namespace Database\Factories;

use App\Models\Etablissement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EtablissementFactory extends Factory
{
    protected $model = Etablissement::class;

    public function definition(): array
    {
        $types = ['hopital', 'clinique', 'cabinet', 'laboratoire'];

        return [
            'user_id' => User::factory()->etablissement(),
            'type_etablissement' => $this->faker->randomElement($types),
            'code_etablissement' => 'ETAB-' . strtoupper($this->faker->bothify('???-####')),
            'registre_commerce' => $this->faker->bothify('RC-####-####'),
            'directeur_nom' => $this->faker->name(),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Indiquer que c'est un hôpital
     */
    public function hopital(): static
    {
        return $this->state(fn (array $attributes) => [
            'type_etablissement' => 'hopital'
        ]);
    }

    /**
     * Indiquer que c'est un laboratoire
     */
    public function laboratoire(): static
    {
        return $this->state(fn (array $attributes) => [
            'type_etablissement' => 'laboratoire'
        ]);
    }
}
