<?php

namespace Database\Factories;

use App\Models\AnalyseLaboratoire;
use App\Models\Consultation;
use App\Models\Laboratoire;
use App\Models\Medecin;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnalyseLaboratoireFactory extends Factory
{
    protected $model = AnalyseLaboratoire::class;

    public function definition(): array
    {
        $typesAnalyse = [
            'NFS - Numération Formule Sanguine',
            'Glycémie à jeun',
            'Bilan lipidique',
            'Créatininémie',
            'Transaminases (ALAT/ASAT)',
            'Sérologie paludisme',
            'Test de grossesse',
            'ECBU',
            'Hémoglobine glyquée (HbA1c)',
            'Goutte épaisse',
            'Sérologie VIH',
            'Hépatite B',
            'Hépatite C',
            'TP - TCA',
            'Ionogramme sanguin'
        ];

        $statuts = ['prescrit', 'preleve', 'en_cours', 'termine'];
        $statut = $this->faker->randomElement($statuts);

        $datePrelevement = $this->faker->dateTimeBetween('-1 month', 'now');
        $dateResultat = $statut === 'termine'
            ? $this->faker->dateTimeBetween($datePrelevement, '+2 weeks')
            : null;

        $resultats = null;
        if ($statut === 'termine') {
            $resultats = [
                'valeur' => $this->faker->randomFloat(2, 5, 150),
                'unite' => $this->faker->randomElement(['g/L', 'mg/dL', 'mmol/L', 'UI/L']),
                'normale' => $this->faker->boolean(80),
                'commentaire' => $this->faker->optional()->sentence()
            ];
        }

        return [
            'consultation_id' => Consultation::factory(),
            'laboratoire_id' => Laboratoire::factory(),
            'prescripteur_id' => Medecin::factory(),
            'type_analyse' => $this->faker->randomElement($typesAnalyse),
            'resultats' => $resultats,
            'date_prelevement' => $datePrelevement,
            'date_resultat' => $dateResultat,
            'statut' => $statut,
            'commentaires' => $this->faker->optional()->sentence(),
            'fichier_resultat' => $statut === 'termine'
                ? 'analyses/' . $this->faker->uuid() . '.pdf'
                : null,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Analyse terminée
     */
    public function terminee(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'termine',
            'date_resultat' => now(),
            'resultats' => [
                'valeur' => $this->faker->randomFloat(2, 10, 100),
                'unite' => 'mg/dL',
                'normale' => true,
                'commentaire' => 'Résultats dans les normes'
            ]
        ]);
    }

    /**
     * Analyse en attente
     */
    public function enAttente(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'prescrit',
            'date_resultat' => null,
            'resultats' => null
        ]);
    }

    /**
     * Avec résultat anormal
     */
    public function anormal(): static
    {
        return $this->state(fn (array $attributes) => [
            'statut' => 'termine',
            'resultats' => [
                'valeur' => $this->faker->randomFloat(2, 150, 300),
                'unite' => 'mg/dL',
                'normale' => false,
                'commentaire' => 'Valeur anormale, à surveiller'
            ]
        ]);
    }
}
