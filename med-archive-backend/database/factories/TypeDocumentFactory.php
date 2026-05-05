<?php

namespace Database\Factories;

use App\Models\TypeDocument;
use Illuminate\Database\Eloquent\Factories\Factory;

class TypeDocumentFactory extends Factory
{
    protected $model = TypeDocument::class;

    public function definition(): array
    {
        $types = [
            'Analyse Laboratoire' => 'Résultat d\'analyse médicale',
            'Compte Rendu' => 'Compte rendu de consultation ou d\'hospitalisation',
            'Imagerie' => 'Radio, IRM, Scanner, Échographie',
            'Certificat Médical' => 'Certificat de santé, d\'aptitude, etc.',
            'Ordonnance' => 'Prescription médicale',
            'Compte Rendu Opératoire' => 'Compte rendu d\'intervention chirurgicale',
            'Courrier Médical' => 'Lettre de liaison entre médecins',
            'Protocole de Soins' => 'Plan de traitement détaillé',
            'Consentement éclairé' => 'Formulaire de consentement du patient',
            'Facture' => 'Document de facturation'
        ];

        $nom = $this->faker->unique()->randomElement(array_keys($types));

        return [
            'nom' => $nom,
            'description' => $types[$nom],
            'created_at' => now(),
            'updated_at' => now()
        ];
    }
}
