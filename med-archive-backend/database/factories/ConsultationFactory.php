<?php

namespace Database\Factories;

use App\Models\Consultation;
use App\Models\Dossier;
use App\Models\Medecin;
use App\Models\Ordonnance;
use App\Models\Constante;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConsultationFactory extends Factory
{
    protected $model = Consultation::class;

    public function definition(): array
    {
        $motifs = [
            'Fièvre persistante',
            'Toux sèche',
            'Douleur thoracique',
            'Céphalées intenses',
            'Douleur abdominale',
            'Fatigue chronique',
            'Suivi hypertension',
            'Consultation prénatale',
            'Examen de routine',
            'Problème cutané',
            'Difficultés respiratoires',
            'Troubles digestifs',
            'Douleurs articulaires',
            'Vertiges',
            'Insomnie'
        ];

        $diagnostics = [
            'Paludisme simple',
            'Infection respiratoire aiguë',
            'Crise d\'asthme',
            'Hypertension artérielle',
            'Gastro-entérite',
            'Migraine',
            'Anémie ferriprive',
            'Diabète type 2 déséquilibré',
            'RAS - Examen normal',
            'Dermatite de contact',
            'Rhinite allergique',
            'Trouble anxieux généralisé',
            'Lombalgie commune',
            'Otite moyenne aiguë',
            'Angine érythémateuse'
        ];

        return [
            'dossier_id' => Dossier::factory(),
            'medecin_id' => Medecin::factory(),
            'date_consultation' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'motif' => $this->faker->randomElement($motifs),
            'diagnostic' => $this->faker->optional(0.7)->randomElement($diagnostics),
            'observations' => $this->faker->optional(0.5)->sentence(),
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Avec constantes vitales
     */
    public function avecConstantes(): static
    {
        return $this->afterCreating(function (Consultation $consultation) {
            Constante::factory()->create([
                'consultation_id' => $consultation->id
            ]);
        });
    }

    /**
     * Avec ordonnance
     */
    public function avecOrdonnance(): static
    {
        return $this->afterCreating(function (Consultation $consultation) {
            Ordonnance::factory()->create([
                'consultation_id' => $consultation->id
            ]);
        });
    }

    /**
     * Consultation récente
     */
    public function recente(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_consultation' => $this->faker->dateTimeBetween('-1 week', 'now')
        ]);
    }
}
