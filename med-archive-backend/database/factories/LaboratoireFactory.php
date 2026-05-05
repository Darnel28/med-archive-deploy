<?php

namespace Database\Factories;

use App\Models\Laboratoire;
use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class LaboratoireFactory extends Factory
{
    protected $model = Laboratoire::class;

    public function definition(): array
    {
        $specialites = [
            ['Hématologie', 'Biochimie', 'Microbiologie'],
            ['Parasitologie', 'Immunologie', 'Hormonologie'],
            ['Toxicologie', 'Virologie', 'Bactériologie'],
            ['Génétique', 'Cytologie', 'Anatomopathologie']
        ];

        // Créer d'abord un établissement si nécessaire
        $etablissement = User::where('role_id', Role::factory()->etablissement()->create()->id)
            ->first() ?? User::factory()->etablissement()->create();

        return [
            'user_id' => User::factory()->laborantin($etablissement),
            'etablissement_id' => $etablissement->id,
            'nom_laboratoire' => 'Laboratoire ' . $this->faker->company(),
            'agrement' => 'AGR-' . $this->faker->unique()->bothify('####/####'),
            'specialites_analyse' => $this->faker->randomElement($specialites),
            'est_actif' => true,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Laboratoire inactif
     */
    public function inactif(): static
    {
        return $this->state(fn (array $attributes) => [
            'est_actif' => false
        ]);
    }

    /**
     * Avec spécialités spécifiques
     */
    public function avecSpecialites(array $specialites): static
    {
        return $this->state(fn (array $attributes) => [
            'specialites_analyse' => $specialites
        ]);
    }
}
