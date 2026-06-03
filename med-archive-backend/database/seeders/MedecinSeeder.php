<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Medecin;
use App\Models\Role;
use App\Models\Specialite;

class MedecinSeeder extends Seeder
{
    public function run(): void
    {
        // Récupère le rôle Medecin
        $roleMedecin = Role::where('nom', 'Medecin')->first();

        // Rechercher des établissements existants créés par DossierMedicalSeeder
        $etablissementEmails = [
            'contact@cnhu.bj',
            'info@cocotiers.bj',
            'contact@hzsuru.bj',
            'labo@lnsp.bj'
        ];

        $etablissement = User::whereIn('email', $etablissementEmails)->first();

        if (!$etablissement) {
            // Fallback: prendre le premier user avec le rôle établissement
            $roleEtab = Role::where('nom', 'Responsable Etablissement')->first();
            $etablissement = User::where('role_id', $roleEtab?->id)->first();
        }

        // Rechercher une spécialité précise si disponible (Médecine Générale), sinon la première
        $specialite = Specialite::where('nom', 'Médecine Générale')->first() ?? Specialite::first();

        if (!$roleMedecin) {
            $this->command->error('❌ Rôle Medecin introuvable. Exécute RoleSeeder avant ce seeder.');
            return;
        }

        if (!$etablissement) {
            $this->command->warn('⚠️ Aucun établissement existant trouvé. Le médecin sera lié sans établissement.');
        }

        // Crée l'utilisateur médecin par défaut (ou récupère s'il existe)
        $userEmail = 'medecin.default@example.com';
        $user = User::firstOrCreate(
            ['email' => $userEmail],
            [
                'name' => 'Docteur Exemple',
                'email' => $userEmail,
                'password' => Hash::make('password123'),
                'telephone' => '0700000000',
                'adresse' => 'Rue Exemple, 000',
                'ville' => 'Ville',
                'date_naissance' => '1980-01-01',
                'sexe' => 'M',
                'role_id' => $roleMedecin->id,
                'etablissement_id' => $etablissement?->id,
                'statut' => 'actif'
            ]
        );

        // Crée ou met à jour la ligne Medecin associée
        $medecin = Medecin::updateOrCreate(
            ['user_id' => $user->id],
            [
                'etablissement_id' => $etablissement?->id,
                'specialite_id' => $specialite?->id,
                'numero_professionnel' => 'MED-0001',
                'diplome' => 'Doctorat en médecine',
                'annees_experience' => 5
            ]
        );

        $this->command->info('✅ Médecin par défaut créé/mis à jour : ' . $user->email);
        $this->command->info('   - Spécialité utilisée: ' . ($specialite?->nom ?? 'Aucune'));
        $this->command->info('   - Etablissement utilisé: ' . ($etablissement?->name ?? 'Aucun'));
    }
}
