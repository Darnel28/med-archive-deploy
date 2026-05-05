<?php

namespace Database\Factories;

use App\Models\Medecin;
use App\Models\User;
use App\Models\Specialite;
use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

class MedecinFactory extends Factory
{
    protected $model = Medecin::class;

    public function definition(): array
    {
        // Créer d'abord un établissement si nécessaire
        $etablissement = User::where('role_id', Role::factory()->etablissement()->create()->id)
            ->first() ?? User::factory()->etablissement()->create();

        return [
            'user_id' => User::factory()->medecin($etablissement),
            'etablissement_id' => $etablissement->id,
            'specialite_id' => Specialite::factory(),
            'numero_professionnel' => 'MED-' . $this->faker->unique()->bothify('####-####'),
            'diplome' => 'Doctorat en Médecine - ' . $this->faker->university(),
            'annees_experience' => $this->faker->numberBetween(1, 40),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Avec une spécialité spécifique
     */
    public function avecSpecialite(string $specialiteNom): static
    {
        $specialite = Specialite::where('nom', $specialiteNom)->first()
            ?? Specialite::factory()->create(['nom' => $specialiteNom]);

        return $this->state(fn (array $attributes) => [
            'specialite_id' => $specialite->id
        ]);
    }

    /**
     * Dans un établissement spécifique
     */
    public function dansEtablissement(User $etablissement): static
    {
        return $this->state(fn (array $attributes) => [
            'etablissement_id' => $etablissement->id
        ])->afterMaking(function (Medecin $medecin) use ($etablissement) {
            $medecin->user->etablissement_id = $etablissement->id;
            $medecin->user->save();
        });
    }
}
