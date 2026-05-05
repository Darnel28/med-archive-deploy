<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nom' => 'Super Admin',
                'description' => 'Administrateur système avec tous les droits',
            ],
            [
                'nom' => 'Admin Regional',
                'description' => 'Administrateur pour une région sanitaire',
            ],
            [
                'nom' => 'Medecin',
                'description' => 'Médecin traitant',
            ],
            [
                'nom' => 'Patient',
                'description' => 'Patient',
            ],
            [
                'nom' => 'Laborantin',
                'description' => 'Personnel de laboratoire',
            ],
            [
                'nom' => 'Pharmacien',
                'description' => 'Pharmacien',
            ],
            [
                'nom' => 'Responsable Etablissement',
                'description' => 'Responsable d\'établissement de santé',
            ],
            [
                'nom' => 'Agent d\'accueil / caisse',
                'description' => 'Agent d\'accueil ou de caisse dans un établissement de santé',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['nom' => $role['nom']],
                ['description' => $role['description']]
            );
        }

        $this->command->info('✅ Rôles créés avec succès !');
    }
}
