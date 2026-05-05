<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        $roles = [
            'Super Admin',
            'Admin Regional',
            'Medecin',
            'Patient',
            'Laborantin',
            'Pharmacien',
            'Responsable Etablissement'
        ];

        return [
            'nom' => $this->faker->unique()->randomElement($roles),
            'description' => $this->faker->sentence(),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Indiquer que le rôle est un médecin
     */
    public function medecin(): static
    {
        return $this->state(fn (array $attributes) => [
            'nom' => 'Medecin',
            'description' => 'Médecin traitant'
        ]);
    }

    /**
     * Indiquer que le rôle est un patient
     */
    public function patient(): static
    {
        return $this->state(fn (array $attributes) => [
            'nom' => 'Patient',
            'description' => 'Patient'
        ]);
    }

    /**
     * Indiquer que le rôle est un établissement
     */
    public function etablissement(): static
    {
        return $this->state(fn (array $attributes) => [
            'nom' => 'Responsable Etablissement',
            'description' => 'Responsable d\'établissement de santé'
        ]);
    }

    /**
     * Indiquer que le rôle est un laborantin
     */
    public function laborantin(): static
    {
        return $this->state(fn (array $attributes) => [
            'nom' => 'Laborantin',
            'description' => 'Personnel de laboratoire'
        ]);
    }
}
