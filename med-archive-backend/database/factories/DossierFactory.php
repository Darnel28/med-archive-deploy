<?php

namespace Database\Factories;

use App\Models\Dossier;
use App\Models\Patient;
use App\Models\Consultation;
use Illuminate\Database\Eloquent\Factories\Factory;

class DossierFactory extends Factory
{
    protected $model = Dossier::class;

    public function definition(): array
    {
        static $dossierCounter = 0;
        $dossierCounter++;

        $patient = Patient::factory()->create();

        return [
            'patient_id' => $patient->id,
            'numero_dossier' => 'DOS-' . date('Y') . str_pad($dossierCounter, 6, '0', STR_PAD_LEFT),
            'imu' => $patient->imu,
            'statut' => 'actif',
            'date_ouverture' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'date_fermeture' => null,
            'medecin_traitant' => 'Dr. ' . $this->faker->lastName(),
            'diagnostics_principaux' => $this->faker->randomElement([
                null,
                'HTA',
                'Diabète type 2',
                'Asthme',
                'Drépanocytose'
            ]),
            'traitements_en_cours' => $this->faker->randomElement([
                null,
                'Amlodipine 5mg/jour',
                'Metformine 500mg x2/jour',
                'Salbutamol si besoin',
                'Acide folique'
            ]),
            'allergies_importantes' => $this->faker->randomElement([
                null,
                'Pénicilline',
                'Arachides',
                'Sulfamides'
            ]),
            'notes_importantes' => $this->faker->optional()->sentence(),
            'total_consultations' => 0,
            'total_documents' => 0,
            'total_analyses' => 0,
            'total_ordonnances' => 0,
            'derniere_consultation' => null,
            'dernier_document' => null,
            'derniere_analyse' => null,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Dossier avec des consultations
     */
    public function avecConsultations(int $count = 3): static
    {
        return $this->afterCreating(function (Dossier $dossier) use ($count) {
            $consultations = Consultation::factory()->count($count)->create([
                'dossier_id' => $dossier->id
            ]);

            $dossier->update([
                'total_consultations' => $count,
                'derniere_consultation' => $consultations->max('date_consultation')
            ]);
        });
    }

    /**
     * Dossier archivé
     */
    public function archive(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'archive',
            'date_fermeture' => now()->subMonths(6)
        ]);
    }
}
