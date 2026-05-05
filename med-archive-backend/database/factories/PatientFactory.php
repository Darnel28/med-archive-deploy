<?php

namespace Database\Factories;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PatientFactory extends Factory
{
    protected $model = Patient::class;

    public function definition(): array
    {
        // Générer l'IMU automatiquement
        static $patientCounter = 0;
        $patientCounter++;

        $year = date('Y');
        $imu = "IMU-{$year}-" . str_pad($patientCounter, 7, '0', STR_PAD_LEFT);

        return [
            'user_id' => User::factory()->patient(),
            'npi' => 'NPI-' . $this->faker->unique()->bothify('####-####-####'),
            'imu' => $imu,
            'groupe_sanguin' => $this->faker->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
            'allergies' => $this->faker->randomElement([
                'Aucune',
                'Pénicilline',
                'Arachides',
                'Pollen',
                'Acariens',
                'Latex',
                'Sulfamides',
                'AINS'
            ]),
            'antecedents_medicaux' => $this->faker->randomElement([
                'Aucun',
                'Hypertension',
                'Diabète type 2',
                'Asthme',
                'Paludisme chronique',
                'Typhoïde',
                'Drépanocytose',
                'HTA + Diabète'
            ]),
            'personne_contact' => $this->faker->name(),
            'telephone_contact' => $this->faker->phoneNumber(),
            'profession' => $this->faker->jobTitle(),
            'nationalite' => 'Béninoise',
            'lieu_naissance' => $this->faker->city() . ', Bénin',
            'created_at' => now(),
            'updated_at' => now()
        ];
    }

    /**
     * Avec un groupe sanguin spécifique
     */
    public function groupeSanguin(string $groupe): static
    {
        return $this->state(fn (array $attributes) => [
            'groupe_sanguin' => $groupe
        ]);
    }

    /**
     * Avec allergies
     */
    public function avecAllergies(): static
    {
        return $this->state(fn (array $attributes) => [
            'allergies' => $this->faker->randomElement([
                'Pénicilline, Arachides',
                'Sulfamides, Latex',
                'Pollen, Acariens, Moisissures',
                'AINS, Codéine'
            ])
        ]);
    }

    /**
     * Avec antécédents
     */
    public function avecAntecedents(): static
    {
        return $this->state(fn (array $attributes) => [
            'antecedents_medicaux' => $this->faker->randomElement([
                'Hypertension, Diabète',
                'Asthme, Allergies saisonnières',
                'Drépanocytose, Crises fréquentes',
                'Paludisme à répétition, Typhoïde'
            ])
        ]);
    }
}
