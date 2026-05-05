<?php

namespace Database\Factories;

use App\Models\Ordonnance;
use App\Models\Consultation;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrdonnanceFactory extends Factory
{
    protected $model = Ordonnance::class;

    public function definition(): array
    {
        $medicaments = [
            ['Paracétamol 500mg', 'Ibuprofène 400mg'],
            ['Amoxicilline 500mg', 'Doliprane 1000mg'],
            ['Ventoline spray', 'Prednisolone 20mg'],
            ['Lisinopril 5mg', 'Hydrochlorothiazide 25mg'],
            ['Metformine 500mg', 'Glibenclamide 5mg'],
            ['Salbutamol spray', 'Montélukast 10mg'],
            ['Diazepam 5mg', 'Sertraline 50mg'],
            ['Oméprazole 20mg', 'Dompéridone 10mg']
        ];

        return [
            'consultation_id' => Consultation::factory(),
            'medicaments' => $this->faker->randomElement($medicaments),
            'posologie' => $this->faker->randomElement([
                '1 comprimé matin et soir',
                '1 comprimé le soir au coucher',
                '2 comprimés par jour pendant 7 jours',
                '1 comprimé 3 fois par jour',
                'Si besoin, sans dépasser 3 par jour'
            ]),
            'instructions' => $this->faker->optional()->sentence(),
            'date_validite' => $this->faker->optional()->dateTimeBetween('now', '+6 months'),
            'est_executee' => false,
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Ordonnance exécutée
     */
    public function executee(): static
    {
        return $this->state(fn (array $attributes) => [
            'est_executee' => true
        ]);
    }

    /**
     * Ordonnance expirée
     */
    public function expiree(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_validite' => now()->subDays(30)
        ]);
    }
}
