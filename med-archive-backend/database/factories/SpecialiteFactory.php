<?php

namespace Database\Factories;

use App\Models\Specialite;
use Illuminate\Database\Eloquent\Factories\Factory;

class SpecialiteFactory extends Factory
{
    protected $model = Specialite::class;

    public function definition(): array
    {
        $specialites = [
            'Médecine Générale' => 'Médecine générale et soins primaires',
            'Cardiologie' => 'Spécialiste du cœur et du système cardiovasculaire',
            'Pédiatrie' => 'Spécialiste des enfants et adolescents',
            'Gynécologie' => 'Spécialiste de la santé de la femme',
            'Dermatologie' => 'Spécialiste de la peau et des muqueuses',
            'Ophtalmologie' => 'Spécialiste des yeux et de la vision',
            'Radiologie' => 'Spécialiste de l\'imagerie médicale',
            'Pneumologie' => 'Spécialiste des poumons et de la respiration',
            'Neurologie' => 'Spécialiste du système nerveux',
            'Psychiatrie' => 'Spécialiste de la santé mentale',
            'Hématologie' => 'Spécialiste du sang',
            'Oncologie' => 'Spécialiste du cancer',
            'Chirurgie générale' => 'Spécialiste des interventions chirurgicales',
            'Orthopédie' => 'Spécialiste des os et articulations',
            'Urologie' => 'Spécialiste de l\'appareil urinaire'
        ];

        $nom = $this->faker->unique()->randomElement(array_keys($specialites));

        return [
            'nom' => $nom,
            'description' => $specialites[$nom],
            'created_at' => now(),
            'updated_at' => now()
        ];
    }
}
