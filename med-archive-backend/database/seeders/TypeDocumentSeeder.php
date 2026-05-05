<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TypeDocument;

class TypeDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['nom' => 'Analyse Laboratoire', 'description' => 'Résultat d\'analyse médicale'],
            ['nom' => 'Compte Rendu', 'description' => 'Compte rendu de consultation ou d\'hospitalisation'],
            ['nom' => 'Imagerie', 'description' => 'Radio, IRM, Scanner, Échographie'],
            ['nom' => 'Certificat Médical', 'description' => 'Certificat de santé, d\'aptitude, etc.'],
            ['nom' => 'Ordonnance', 'description' => 'Prescription médicale'],
            ['nom' => 'Compte Rendu Opératoire', 'description' => 'Compte rendu d\'intervention chirurgicale'],
            ['nom' => 'Courrier Médical', 'description' => 'Lettre de liaison entre médecins'],
            ['nom' => 'Protocole de Soins', 'description' => 'Plan de traitement détaillé'],
            ['nom' => 'Consentement éclairé', 'description' => 'Formulaire de consentement du patient'],
            ['nom' => 'Facture', 'description' => 'Document de facturation'],
        ];

        foreach ($types as $type) {
            TypeDocument::firstOrCreate(
                ['nom' => $type['nom']],
                ['description' => $type['description']]
            );
        }

        $this->command->info('✅ Types de documents créés avec succès !');
    }
}
