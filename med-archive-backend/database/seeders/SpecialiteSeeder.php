<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialite;

class SpecialiteSeeder extends Seeder
{
    public function run(): void
    {
        $specialites = [
            ['nom' => 'Médecine Générale', 'description' => 'Médecine générale et soins primaires'],
            ['nom' => 'Cardiologie', 'description' => 'Spécialiste du cœur et du système cardiovasculaire'],
            ['nom' => 'Pédiatrie', 'description' => 'Spécialiste des enfants et adolescents'],
            ['nom' => 'Gynécologie', 'description' => 'Spécialiste de la santé de la femme'],
            ['nom' => 'Dermatologie', 'description' => 'Spécialiste de la peau et des muqueuses'],
            ['nom' => 'Ophtalmologie', 'description' => 'Spécialiste des yeux et de la vision'],
            ['nom' => 'Radiologie', 'description' => 'Spécialiste de l\'imagerie médicale'],
            ['nom' => 'Pneumologie', 'description' => 'Spécialiste des poumons et de la respiration'],
            ['nom' => 'Neurologie', 'description' => 'Spécialiste du système nerveux'],
            ['nom' => 'Psychiatrie', 'description' => 'Spécialiste de la santé mentale'],
            ['nom' => 'Hématologie', 'description' => 'Spécialiste du sang'],
            ['nom' => 'Oncologie', 'description' => 'Spécialiste du cancer'],
            ['nom' => 'Chirurgie générale', 'description' => 'Spécialiste des interventions chirurgicales'],
            ['nom' => 'Orthopédie', 'description' => 'Spécialiste des os et articulations'],
            ['nom' => 'Urologie', 'description' => 'Spécialiste de l\'appareil urinaire'],
        ];

        foreach ($specialites as $spec) {
            Specialite::firstOrCreate(
                ['nom' => $spec['nom']],
                ['description' => $spec['description']]
            );
        }

        $this->command->info('✅ Spécialités créées avec succès !');
    }
}
