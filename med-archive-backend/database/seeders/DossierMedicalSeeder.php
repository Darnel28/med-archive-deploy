<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\User;
use App\Models\Specialite;
use App\Models\TypeDocument;
use App\Models\Etablissement;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\Laboratoire;
use App\Models\Dossier;
use App\Models\Consultation;
use App\Models\Constante;
use App\Models\Ordonnance;
use App\Models\AnalyseLaboratoire;
use App\Models\Document;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DossierMedicalSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Début du seeding du système Med-Archive...');

        // 1. Récupérer les IDs des rôles (déjà créés par RoleSeeder)
        $this->command->info('Récupération des rôles existants...');
        $roleSuperAdmin = Role::where('nom', 'Super Admin')->first();
        $roleMedecin = Role::where('nom', 'Medecin')->first();
        $rolePatient = Role::where('nom', 'Patient')->first();
        $roleEtablissement = Role::where('nom', 'Responsable Etablissement')->first();
        $roleLaborantin = Role::where('nom', 'Laborantin')->first();
        $roleAgentCaisse = Role::where('nom', 'Agent d\'accueil / caisse')->first();

        if (!$roleSuperAdmin || !$roleMedecin || !$rolePatient || !$roleEtablissement || !$roleLaborantin || !$roleAgentCaisse) {
            $this->command->error('❌ Rôles manquants ! Exécutez d\'abord RoleSeeder.');
            return;
        }

        // 2. CRÉER L'ADMIN (s'il n'existe pas déjà)
        $this->command->info('Création de l\'administrateur...');
        User::firstOrCreate(
            ['email' => 'admin@medarchive.bj'],
            [
                'name' => 'Admin Système',
                'password' => Hash::make('password'),
                'telephone' => '+229 97 00 00 01',
                'adresse' => 'Cotonou, Bénin',
                'ville' => 'Cotonou',
                'role_id' => $roleSuperAdmin->id,
                'statut' => 'actif'
            ]
        );

        User::firstOrCreate(
            ['email' => 'caisse@medarchive.bj'],
            [
                'name' => 'Agent Caisse Principal',
                'password' => Hash::make('password'),
                'telephone' => '+229 97 00 00 03',
                'adresse' => 'Cotonou, Bénin',
                'ville' => 'Cotonou',
                'role_id' => $roleAgentCaisse->id,
                'statut' => 'actif'
            ]
        );
        
        // 3. CRÉER LES ÉTABLISSEMENTS
        $this->command->info('Création des établissements...');
        $etablissements = $this->createEtablissements($roleEtablissement);

        // 4. CRÉER LES MÉDECINS
        $this->command->info('Création des médecins...');
        $medecins = $this->createMedecins($roleMedecin, $etablissements);

        // 5. CRÉER LES LABORANTINS
        $this->command->info('Création des laborantins...');
        $laboratoires = $this->createLaborantins($roleLaborantin, $etablissements);

        // 6. CRÉER LES PATIENTS
        $this->command->info('Création des patients...');
        $patients = $this->createPatients($rolePatient);

        // 7. CRÉER LES DOSSIERS ET CONSULTATIONS
        $this->command->info('Création des dossiers médicaux...');
        $this->createDossiersEtConsultations($patients, $medecins, $laboratoires);

        $this->command->info('✅ Seeding terminé avec succès !');
        $this->afficherResume();
    }

    private function createEtablissements($roleEtablissement)
    {
        $etablissementsData = [
            [
                'name' => 'CNHU-HKM Cotonou',
                'email' => 'contact@cnhu.bj',
                'type' => 'hopital',
                'code' => 'HOP-001-COT',
                'telephone' => '+229 21 30 10 20',
                'adresse' => 'Cotonou, Bénin',
                'directeur' => 'Pr. Jean Mensah'
            ],
            [
                'name' => 'Clinique Les Cocotiers',
                'email' => 'info@cocotiers.bj',
                'type' => 'clinique',
                'code' => 'CLI-001-COT',
                'telephone' => '+229 21 31 40 50',
                'adresse' => 'Cotonou, Bénin',
                'directeur' => 'Dr. Marie Adeoti'
            ],
            [
                'name' => 'Hôpital de Zone de Suru Léré',
                'email' => 'contact@hzsuru.bj',
                'type' => 'hopital',
                'code' => 'HOP-002-PNO',
                'telephone' => '+229 20 21 30 40',
                'adresse' => 'Porto-Novo, Bénin',
                'directeur' => 'Dr. Paul Dossou'
            ],
            [
                'name' => 'Laboratoire National de Santé Publique',
                'email' => 'labo@lnsp.bj',
                'type' => 'laboratoire',
                'code' => 'LAB-001-COT',
                'telephone' => '+229 21 32 45 67',
                'adresse' => 'Cotonou, Bénin',
                'directeur' => 'Dr. Luc Sossa'
            ],
        ];

        $etablissements = [];

        foreach ($etablissementsData as $data) {
            // Utiliser firstOrCreate pour éviter les doublons
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                    'telephone' => $data['telephone'],
                    'adresse' => $data['adresse'],
                    'role_id' => $roleEtablissement->id,
                    'statut' => 'actif'
                ]
            );

            // Créer les informations spécifiques si elles n'existent pas
            Etablissement::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'type_etablissement' => $data['type'],
                    'code_etablissement' => $data['code'],
                    'directeur_nom' => $data['directeur'],
                    'registre_commerce' => 'RC-' . fake()->bothify('####-####'),
                ]
            );

            $etablissements[$data['type']][] = $user;
        }

        return $etablissements;
    }

    private function createMedecins($roleMedecin, $etablissements)
    {
        $specialites = Specialite::all();
        $hopitals = $etablissements['hopital'] ?? [];
        $cliniques = $etablissements['clinique'] ?? [];
        $tousEtablissements = array_merge($hopitals, $cliniques);

        $medecinUsers = [];

        // Créer 10 médecins
        for ($i = 1; $i <= 10; $i++) {
            $etablissement = $tousEtablissements[array_rand($tousEtablissements)];
            $email = 'medecin' . $i . '@hopital.bj';

            // Vérifier si le médecin existe déjà
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                $medecin = Medecin::where('user_id', $existingUser->id)->first();
                if ($medecin) {
                    $medecinUsers[] = $medecin;
                    continue;
                }
            }

            $user = User::create([
                'name' => 'Dr. ' . fake()->lastName(),
                'email' => $email,
                'password' => Hash::make('password'),
                'telephone' => '+229 97 00 00 ' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'adresse' => 'Cotonou, Bénin',
                'role_id' => $roleMedecin->id,
                'etablissement_id' => $etablissement->id,
                'statut' => 'actif'
            ]);

            $medecin = Medecin::create([
                'user_id' => $user->id,
                'etablissement_id' => $etablissement->id,
                'specialite_id' => $specialites->random()->id,
                'numero_professionnel' => 'MED-' . fake()->unique()->bothify('####-####'),
                'annees_experience' => rand(3, 25)
            ]);

            $medecinUsers[] = $medecin;
        }

        return $medecinUsers;
    }

    private function createLaborantins($roleLaborantin, $etablissements)
    {
        $laboratoires = [];
        $laboEtablissements = $etablissements['laboratoire'] ?? [];

        if (empty($laboEtablissements)) {
            $this->command->warn('⚠️  Aucun établissement de type laboratoire trouvé!');
            return [];
        }

        // Créer 3 laborantins
        for ($i = 1; $i <= 3; $i++) {
            $etablissement = $laboEtablissements[array_rand($laboEtablissements)];
            $email = 'laborantin' . $i . '@labo.bj';

            // Vérifier si le laborantin existe déjà
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                $laboratoire = Laboratoire::where('user_id', $existingUser->id)->first();
                if ($laboratoire) {
                    $laboratoires[] = $laboratoire;
                    continue;
                }
            }

            $user = User::create([
                'name' => fake()->name(),
                'email' => $email,
                'password' => Hash::make('password'),
                'telephone' => '+229 97 00 10 ' . str_pad($i, 2, '0', STR_PAD_LEFT),
                'adresse' => 'Cotonou, Bénin',
                'role_id' => $roleLaborantin->id,
                'etablissement_id' => $etablissement->id,
                'statut' => 'actif'
            ]);

            $laboratoire = Laboratoire::create([
                'user_id' => $user->id,
                'etablissement_id' => $etablissement->id,
                'nom_laboratoire' => 'Labo ' . fake()->company(),
                'agrement' => 'AGR-' . fake()->unique()->bothify('####/####'),
                'specialites_analyse' => ['Hématologie', 'Biochimie', 'Microbiologie'],
                'est_actif' => true
            ]);

            $laboratoires[] = $laboratoire;
        }

        return $laboratoires;
    }

    private function createPatients($rolePatient)
    {
        $patients = [];

        // Créer 30 patients
        for ($i = 1; $i <= 30; $i++) {
            $email = 'patient' . $i . '@email.com';

            // Vérifier si le patient existe déjà
            $existingUser = User::where('email', $email)->first();
            if ($existingUser) {
                $patient = Patient::where('user_id', $existingUser->id)->first();
                if ($patient) {
                    $patients[] = $patient;
                    continue;
                }
            }

            $user = User::create([
                'name' => fake()->name(),
                'email' => $email,
                'password' => Hash::make('password'),
                'telephone' => '+229 96 00 ' . str_pad($i, 4, '0', STR_PAD_LEFT),
                'adresse' => fake()->address(),
                'date_naissance' => fake()->dateTimeBetween('-80 years', '-18 years'),
                'sexe' => fake()->randomElement(['M', 'F']),
                'role_id' => $rolePatient->id,
                'statut' => 'actif'
            ]);

            $patient = Patient::create([
                'user_id' => $user->id,
                'npi' => 'NPI-' . date('Y') . '-' . str_pad($i, 6, '0', STR_PAD_LEFT),
                'imu' => 'IMU-' . date('Y') . '-' . str_pad($i, 7, '0', STR_PAD_LEFT),
                'groupe_sanguin' => fake()->randomElement(['A+', 'A-', 'B+', 'B-', 'O+']),
                'allergies' => rand(0, 3) ? 'Aucune' : 'Pénicilline',
                'antecedents_medicaux' => rand(0, 3) ? 'Aucun' : 'Hypertension',
                'personne_contact' => fake()->name(),
                'telephone_contact' => fake()->phoneNumber(),
                'profession' => fake()->jobTitle(),
                'nationalite' => 'Béninoise',
                'lieu_naissance' => fake()->city() . ', Bénin'
            ]);

            $patients[] = $patient;
        }

        return $patients;
    }

   private function createDossiersEtConsultations($patients, $medecins, $laboratoires)
{
    if (empty($medecins)) {
        $this->command->error('❌ Aucun médecin disponible!');
        return;
    }

    $motifs = [
        'Fièvre persistante',
        'Toux sèche',
        'Douleur thoracique',
        'Maux de tête intenses',
        'Douleur abdominale',
        'Fatigue chronique',
        'Suivi hypertension',
        'Consultation de routine',
        'Problème cutané',
        'Difficultés respiratoires'
    ];

    // 1. D'abord, créer les dossiers et consultations pour tous les patients (comme avant)
    foreach ($patients as $patient) {
        $dossier = Dossier::firstOrCreate(
            ['patient_id' => $patient->id],
            [
                'numero_dossier' => 'DOS-' . date('Y') . '-' . str_pad($patient->id, 6, '0', STR_PAD_LEFT),
                'imu' => $patient->imu,
                'statut' => 'actif',
                'date_ouverture' => now()->subMonths(rand(1, 24)),
                'medecin_traitant' => 'Dr. ' . fake()->lastName()
            ]
        );

        $nbConsultations = rand(2, 5);
        for ($j = 0; $j < $nbConsultations; $j++) {
            $medecin = $medecins[array_rand($medecins)];
            $consultation = Consultation::create([
                'dossier_id' => $dossier->id,
                'medecin_id' => $medecin->id,
                'date_consultation' => now()->subDays(rand(1, 365)),
                'motif' => $motifs[array_rand($motifs)],
                'diagnostic' => rand(0, 1) ? 'Diagnostic ' . fake()->word() : null,
                'observations' => rand(0, 1) ? 'Patient à revoir dans 1 mois' : null
            ]);

            Constante::create([
                'consultation_id' => $consultation->id,
                'tension_arterielle' => rand(0, 1) ? '12/8' : '13/8',
                'temperature' => rand(36, 38) . '.' . rand(0, 9),
                'poids' => rand(60, 90) . '.' . rand(0, 9),
                'taille' => rand(160, 185),
                'frequence_cardiaque' => rand(65, 85),
            ]);

            if (rand(0, 1)) {
                Ordonnance::create([
                    'consultation_id' => $consultation->id,
                    'medicaments' => ['Paracétamol 500mg', 'Vitamine C'],
                    'posologie' => '1 comprimé matin et soir',
                    'instructions' => 'Pendant 5 jours'
                ]);
            }

            if (!empty($laboratoires) && rand(0, 2) === 0) {
                AnalyseLaboratoire::create([
                    'consultation_id' => $consultation->id,
                    'laboratoire_id' => $laboratoires[array_rand($laboratoires)]->id,
                    'prescripteur_id' => $medecin->id,
                    'type_analyse' => 'NFS',
                    'date_prelevement' => $consultation->date_consultation,
                    'statut' => 'termine'
                ]);
            }
        }

        $dossier->update([
            'total_consultations' => $dossier->consultations()->count(),
            'derniere_consultation' => $dossier->consultations()->max('date_consultation')
        ]);
    }

    // 2. Ensuite, s'assurer que le médecin par défaut (medecin.default@example.com) a au moins 3 patients
    $defaultMedecin = Medecin::whereHas('user', function($q) {
        $q->where('email', 'medecin.default@example.com');
    })->first();

    if ($defaultMedecin) {
        // Vérifier combien de patients il a déjà
        $existingPatientsCount = $defaultMedecin->patients()->count();
        if ($existingPatientsCount < 3) {
            // Prendre des patients au hasard qui n'ont pas encore de consultation avec ce médecin
            $patientsWithoutDefault = Patient::whereDoesntHave('consultations', function($q) use ($defaultMedecin) {
                $q->where('medecin_id', $defaultMedecin->id);
            })->limit(3 - $existingPatientsCount)->get();

            foreach ($patientsWithoutDefault as $patient) {
                $dossier = Dossier::where('patient_id', $patient->id)->first();
                if (!$dossier) {
                    $dossier = Dossier::create([
                        'patient_id' => $patient->id,
                        'numero_dossier' => 'DOS-' . date('Y') . '-' . str_pad($patient->id, 6, '0', STR_PAD_LEFT),
                        'imu' => $patient->imu,
                        'statut' => 'actif',
                        'date_ouverture' => now(),
                    ]);
                }

                Consultation::create([
                    'dossier_id' => $dossier->id,
                    'medecin_id' => $defaultMedecin->id,
                    'date_consultation' => now()->subDays(rand(1, 30)),
                    'motif' => $motifs[array_rand($motifs)],
                    'diagnostic' => 'Consultation de routine',
                ]);
            }

            $this->command->info("✅ {$defaultMedecin->user->name} a maintenant au moins 3 patients.");
        } else {
            $this->command->info("ℹ️ Le médecin par défaut a déjà {$existingPatientsCount} patients.");
        }
    } else {
        $this->command->warn("⚠️ Médecin par défaut (medecin.default@example.com) non trouvé.");
    }
}

    private function afficherResume()
    {
        $this->command->info("\n📊 RÉSUMÉ DU SYSTÈME MED-ARCHIVE");
        $this->command->info("==================================");
        $this->command->info("Établissements : " . Etablissement::count());
        $this->command->info("Médecins : " . Medecin::count());
        $this->command->info("Laborantins : " . Laboratoire::count());
        $this->command->info("Patients : " . Patient::count());
        $this->command->info("Dossiers médicaux : " . Dossier::count());
        $this->command->info("Consultations : " . Consultation::count());
        $this->command->info("==================================\n");
    }
    
}
