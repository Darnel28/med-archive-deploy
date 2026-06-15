<?php

namespace Database\Seeders;

use App\Models\Consultation;
use App\Models\Constante;
use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\Laboratoire;
use App\Models\Medecin;
use App\Models\Ordonnance;
use App\Models\Patient;
use App\Models\Role;
use App\Models\Service;
use App\Models\Specialite;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DossierMedicalSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Debut du seeding coherent du systeme Med-Archive...');

        $roleSuperAdmin = Role::where('nom', 'Super Admin')->first();
        $roleMedecin = Role::where('nom', 'Medecin')->first();
        $rolePatient = Role::where('nom', 'Patient')->first();
        $roleService = Role::where('nom', 'Service')->first();
        $roleEtablissement = Role::where('nom', 'Responsable Etablissement')->first();
        $roleLaborantin = Role::where('nom', 'Laborantin')->first();

        if (!$roleSuperAdmin || !$roleMedecin || !$rolePatient || !$roleService || !$roleEtablissement || !$roleLaborantin) {
            $this->command->error('Roles manquants. Executez RoleSeeder avant ce seeder.');
            return;
        }

        $admin = $this->createAdmin($roleSuperAdmin);
        $this->command->info('Admin cree: ' . $admin->email);

        foreach ($this->hospitalDataset() as $hospitalIndex => $hospitalData) {
            $hospital = $this->createHospital($hospitalData, $roleEtablissement);

            foreach ($hospitalData['services'] as $serviceIndex => $serviceData) {
                $service = $this->createService($hospital, $serviceData, $roleService, $hospitalIndex, $serviceIndex);
                $specialite = $this->specialite($serviceData['specialite']);

                foreach ($serviceData['medecins'] as $doctorIndex => $doctorData) {
                    $medecin = $this->createMedecin(
                        $doctorData,
                        $roleMedecin,
                        $hospital,
                        $service,
                        $specialite,
                        $hospitalIndex,
                        $serviceIndex,
                        $doctorIndex
                    );

                    for ($patientOffset = 1; $patientOffset <= 3; $patientOffset++) {
                        $patientNumber = ($hospitalIndex * 27) + ($serviceIndex * 9) + ($doctorIndex * 3) + $patientOffset;
                        $patient = $this->createPatient($patientNumber, $rolePatient, $hospitalData['ville']);
                        $this->createDossierEtConsultation($patient, $medecin, $service, $serviceData, $patientNumber);
                    }
                }
            }
        }

        $this->createLaboratoire($roleLaborantin);

        $this->command->info('Seeding termine avec succes.');
        $this->afficherResume();
    }

    private function createAdmin($roleSuperAdmin): User
    {
        return User::updateOrCreate(
            ['email' => 'admin@medarchive.bj'],
            [
                'name' => 'Aminata Kone',
                'password' => Hash::make('password'),
                'telephone' => '+229 97 00 00 01',
                'adresse' => 'Quartier Ganhi',
                'ville' => 'Cotonou',
                'role_id' => $roleSuperAdmin->id,
                'statut' => 'actif',
            ]
        );
    }

    private function createHospital(array $data, $roleEtablissement): User
    {
        $hospital = User::updateOrCreate(
            ['email' => $data['email']],
            [
                'name' => $data['name'],
                'password' => Hash::make('password'),
                'telephone' => $data['telephone'],
                'adresse' => $data['adresse'],
                'ville' => $data['ville'],
                'role_id' => $roleEtablissement->id,
                'statut' => 'actif',
            ]
        );

        Etablissement::updateOrCreate(
            ['user_id' => $hospital->id],
            [
                'type_etablissement' => 'hopital',
                'code_etablissement' => $data['code'],
                'registre_commerce' => $data['registre'],
                'directeur_nom' => $data['directeur'],
            ]
        );

        return $hospital;
    }

    private function createService(User $hospital, array $data, $roleService, int $hospitalIndex, int $serviceIndex): Service
    {
        $number = ($hospitalIndex * 3) + $serviceIndex + 1;
        $serviceUser = User::updateOrCreate(
            ['email' => 'service.' . str_pad($number, 2, '0', STR_PAD_LEFT) . '@medarchive.bj'],
            [
                'name' => 'Accueil ' . $data['nom'] . ' - ' . $hospital->ville,
                'password' => Hash::make('password'),
                'telephone' => '+229 93 40 ' . str_pad($number, 4, '0', STR_PAD_LEFT),
                'adresse' => $hospital->adresse,
                'ville' => $hospital->ville,
                'role_id' => $roleService->id,
                'etablissement_id' => $hospital->id,
                'statut' => 'actif',
            ]
        );

        return Service::updateOrCreate(
            [
                'etablissement_id' => $hospital->id,
                'nom' => $data['nom'],
            ],
            [
                'user_id' => $serviceUser->id,
                'description' => $data['description'],
                'est_actif' => true,
            ]
        );
    }

    private function createLaboratoire($roleLaborantin): Laboratoire
    {
        $hospital = User::where('email', 'chu.cotonou@medarchive.bj')->first();

        $user = User::updateOrCreate(
            ['email' => 'labo.central@medarchive.bj'],
            [
                'name' => 'Centre d Analyse Bio-Sante Cotonou',
                'password' => Hash::make('password'),
                'telephone' => '+229 91 50 00 01',
                'adresse' => 'Quartier Cadjehoun',
                'ville' => 'Cotonou',
                'role_id' => $roleLaborantin->id,
                'etablissement_id' => $hospital?->id,
                'statut' => 'actif',
            ]
        );

        return Laboratoire::updateOrCreate(
            ['user_id' => $user->id],
            [
                'etablissement_id' => $hospital->id,
                'nom_laboratoire' => 'Centre d Analyse Bio-Sante Cotonou',
                'agrement' => 'LAB-BJ-2026-001',
                'specialites_analyse' => ['Hematologie', 'Biochimie', 'Microbiologie'],
                'est_actif' => true,
            ]
        );
    }

    private function createMedecin(
        array $data,
        $roleMedecin,
        User $hospital,
        Service $service,
        Specialite $specialite,
        int $hospitalIndex,
        int $serviceIndex,
        int $doctorIndex
    ): Medecin {
        $number = ($hospitalIndex * 9) + ($serviceIndex * 3) + $doctorIndex + 1;
        $email = 'medecin.' . str_pad($number, 2, '0', STR_PAD_LEFT) . '@medarchive.bj';

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $data['name'],
                'password' => Hash::make('password'),
                'telephone' => '+229 96 10 ' . str_pad($number, 4, '0', STR_PAD_LEFT),
                'adresse' => $hospital->adresse,
                'ville' => $hospital->ville,
                'date_naissance' => $data['date_naissance'],
                'sexe' => $data['sexe'],
                'role_id' => $roleMedecin->id,
                'etablissement_id' => $hospital->id,
                'statut' => 'actif',
            ]
        );

        return Medecin::updateOrCreate(
            ['user_id' => $user->id],
            [
                'etablissement_id' => $hospital->id,
                'service_id' => $service->id,
                'specialite_id' => $specialite->id,
                'numero_professionnel' => 'MED-BJ-' . str_pad($number, 4, '0', STR_PAD_LEFT),
                'diplome' => 'Doctorat en medecine',
                'annees_experience' => $data['experience'],
            ]
        );
    }

    private function createPatient(int $number, $rolePatient, string $ville): Patient
    {
        $firstNames = [
            'Koffi', 'Awa', 'Moussa', 'Fatou', 'Sena', 'Yao', 'Aissatou', 'Kwame', 'Mariama',
            'Abdoulaye', 'Akouavi', 'Ibrahim', 'Nafiou', 'Adjoa', 'Cheikh', 'Binta', 'Tchalla',
            'Aminata', 'Kodjo', 'Salimata', 'Basile', 'Fanta', 'Souleymane', 'Akossiwa', 'Mawuli',
            'Rokia', 'Issa'
        ];

        $lastNames = [
            'Mensah', 'Dossou', 'Traore', 'Ouattara', 'Adeoti', 'Sow', 'Agbessi', 'Dieng', 'Kone',
            'Bio', 'Sissoko', 'Houngbedji', 'Diop', 'Adjovi', 'Balde', 'Gueye', 'Toure', 'Zinsou',
            'Kouassi', 'Sanogo', 'Azon', 'Camara', 'Gnassingbe', 'Diallo', 'Lawson', 'Ndiaye', 'Sagna'
        ];

        $jobs = [
            'Enseignant', 'Commercante', 'Chauffeur', 'Etudiante', 'Cultivateur', 'Comptable',
            'Infirmiere', 'Menuisier', 'Couturiere'
        ];

        $bloodGroups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
        $firstName = $firstNames[($number - 1) % count($firstNames)];
        $lastName = $lastNames[($number - 1) % count($lastNames)];
        $sexe = in_array($firstName, ['Awa', 'Fatou', 'Aissatou', 'Mariama', 'Akouavi', 'Adjoa', 'Binta', 'Aminata', 'Salimata', 'Fanta', 'Akossiwa', 'Rokia'], true) ? 'F' : 'M';

        $user = User::updateOrCreate(
            ['email' => 'patient.' . str_pad($number, 3, '0', STR_PAD_LEFT) . '@medarchive.bj'],
            [
                'name' => $firstName . ' ' . $lastName,
                'password' => Hash::make('password'),
                'telephone' => '+229 95 20 ' . str_pad($number, 4, '0', STR_PAD_LEFT),
                'adresse' => 'Quartier ' . $this->quartier($number),
                'ville' => $ville,
                'date_naissance' => (1970 + ($number % 32)) . '-' . str_pad(($number % 12) + 1, 2, '0', STR_PAD_LEFT) . '-' . str_pad(($number % 27) + 1, 2, '0', STR_PAD_LEFT),
                'sexe' => $sexe,
                'role_id' => $rolePatient->id,
                'statut' => 'actif',
            ]
        );

        return Patient::updateOrCreate(
            ['user_id' => $user->id],
            [
                'npi' => 'NPI-2026-' . str_pad($number, 6, '0', STR_PAD_LEFT),
                'imu' => 'IMU-2026-' . str_pad($number, 7, '0', STR_PAD_LEFT),
                'groupe_sanguin' => $bloodGroups[($number - 1) % count($bloodGroups)],
                'allergies' => $number % 7 === 0 ? 'Allergie connue a la penicilline' : 'Aucune allergie connue',
                'antecedents_medicaux' => $number % 5 === 0 ? 'Hypertension familiale' : 'Aucun antecedent majeur',
                'personne_contact' => 'Contact ' . $lastName,
                'telephone_contact' => '+229 94 30 ' . str_pad($number, 4, '0', STR_PAD_LEFT),
                'profession' => $jobs[($number - 1) % count($jobs)],
                'nationalite' => 'Beninoise',
                'lieu_naissance' => $ville . ', Benin',
            ]
        );
    }

    private function createDossierEtConsultation(
        Patient $patient,
        Medecin $medecin,
        Service $service,
        array $serviceData,
        int $patientNumber
    ): void {
        $dossier = Dossier::updateOrCreate(
            ['patient_id' => $patient->id],
            [
                'numero_dossier' => 'DOS-2026-' . str_pad($patientNumber, 6, '0', STR_PAD_LEFT),
                'imu' => $patient->imu,
                'statut' => 'actif',
                'date_ouverture' => now()->subDays(120 - ($patientNumber % 60))->toDateString(),
                'medecin_traitant' => $medecin->user->name,
                'diagnostics_principaux' => $serviceData['diagnostic'],
                'traitements_en_cours' => $serviceData['traitement'],
                'allergies_importantes' => $patient->allergies,
                'notes_importantes' => 'Suivi assure par le service ' . $service->nom,
            ]
        );

        $consultation = Consultation::firstOrCreate(
            [
                'dossier_id' => $dossier->id,
                'medecin_id' => $medecin->id,
            ],
            [
                'service_id' => $service->id,
                'date_consultation' => now()->subDays(30 - ($patientNumber % 20)),
                'motif' => $serviceData['motif'],
                'diagnostic' => $serviceData['diagnostic'],
                'observations' => 'Patient stable. Controle programme dans un mois.',
                'statut_paiement' => 'payee',
                'montant_consultation' => 5000,
                'est_urgence' => false,
            ]
        );

        Constante::firstOrCreate(
            ['consultation_id' => $consultation->id],
            [
                'tension_arterielle' => $patientNumber % 4 === 0 ? '13/8' : '12/8',
                'temperature' => 36.5 + (($patientNumber % 4) / 10),
                'poids' => 55 + ($patientNumber % 35),
                'taille' => 155 + ($patientNumber % 30),
                'frequence_cardiaque' => 68 + ($patientNumber % 15),
                'glycemie' => 0.85 + (($patientNumber % 5) / 100),
                'saturation_oxygene' => 97 + ($patientNumber % 3),
            ]
        );

        Ordonnance::firstOrCreate(
            ['consultation_id' => $consultation->id],
            [
                'medicaments' => $serviceData['medicaments'],
                'posologie' => $serviceData['posologie'],
                'instructions' => 'Respecter le traitement et revenir en controle si les symptomes persistent.',
                'date_validite' => now()->addDays(30)->toDateString(),
                'est_executee' => false,
            ]
        );

        $dossier->update([
            'total_consultations' => $dossier->consultations()->count(),
            'total_ordonnances' => $dossier->ordonnances()->count(),
            'derniere_consultation' => $dossier->consultations()->max('date_consultation'),
        ]);
    }

    private function specialite(string $nom): Specialite
    {
        return Specialite::where('nom', $nom)->first() ?? Specialite::firstOrCreate(
            ['nom' => $nom],
            ['description' => 'Specialite medicale']
        );
    }

    private function quartier(int $number): string
    {
        $quartiers = ['Zongo', 'Akpakpa', 'Tokpota', 'Banikanni', 'Fidjrosse', 'Gbegamey', 'Kandebi', 'Akonabo'];

        return $quartiers[($number - 1) % count($quartiers)];
    }

    private function hospitalDataset(): array
    {
        $doctors = [
            ['Dr. Kossi Mensah', 'Dr. Awa Dossou', 'Dr. Ibrahim Traore'],
            ['Dr. Mariama Sow', 'Dr. Yao Kouassi', 'Dr. Fatou Diop'],
            ['Dr. Sena Adeoti', 'Dr. Cheikh Ndiaye', 'Dr. Akouavi Lawson'],
            ['Dr. Moussa Kone', 'Dr. Rokia Camara', 'Dr. Kodjo Zinsou'],
            ['Dr. Aminata Diallo', 'Dr. Abdoulaye Sissoko', 'Dr. Adjoa Toure'],
            ['Dr. Basile Houngbedji', 'Dr. Fanta Gueye', 'Dr. Mawuli Agbessi'],
            ['Dr. Nafiou Bio', 'Dr. Binta Balde', 'Dr. Issa Sanogo'],
            ['Dr. Salimata Ouattara', 'Dr. Kwame Adjovi', 'Dr. Aissatou Dieng'],
            ['Dr. Souleymane Gnassingbe', 'Dr. Akossiwa Azon', 'Dr. Tchalla Sagna'],
        ];

        return [
            [
                'name' => 'Centre Hospitalier Universitaire de Cotonou',
                'email' => 'chu.cotonou@medarchive.bj',
                'telephone' => '+229 21 30 10 20',
                'adresse' => 'Avenue Jean-Paul II',
                'ville' => 'Cotonou',
                'code' => 'HOP-BJ-COT-001',
                'registre' => 'RB-COT-2026-A001',
                'directeur' => 'Pr. Jean Mensah',
                'services' => $this->servicesForHospital(array_slice($doctors, 0, 3)),
            ],
            [
                'name' => 'Hopital Regional de Parakou',
                'email' => 'hopital.parakou@medarchive.bj',
                'telephone' => '+229 23 61 04 44',
                'adresse' => 'Route de Banikanni',
                'ville' => 'Parakou',
                'code' => 'HOP-BJ-PAR-002',
                'registre' => 'RB-PAR-2026-B002',
                'directeur' => 'Dr. Paul Dossou',
                'services' => $this->servicesForHospital(array_slice($doctors, 3, 3)),
            ],
            [
                'name' => 'Hopital Saint Jean de Porto-Novo',
                'email' => 'saintjean.portonovo@medarchive.bj',
                'telephone' => '+229 20 21 30 40',
                'adresse' => 'Boulevard Tokpota',
                'ville' => 'Porto-Novo',
                'code' => 'HOP-BJ-PNO-003',
                'registre' => 'RB-PNO-2026-C003',
                'directeur' => 'Dr. Marie Adeoti',
                'services' => $this->servicesForHospital(array_slice($doctors, 6, 3)),
            ],
        ];
    }

    private function servicesForHospital(array $doctorGroups): array
    {
        $serviceTemplates = [
            [
                'nom' => 'Medecine generale',
                'description' => 'Consultations generales, prevention et suivi des maladies courantes.',
                'specialite' => 'Médecine Générale',
                'motif' => 'Consultation generale et suivi de sante',
                'diagnostic' => 'Etat general stable',
                'traitement' => 'Conseils hygieno-dietetiques et controle medical',
                'medicaments' => ['Paracetamol 500mg', 'Sels de rehydratation orale'],
                'posologie' => 'Selon les symptomes, pendant 3 a 5 jours',
            ],
            [
                'nom' => 'Pediatrie',
                'description' => 'Prise en charge medicale des enfants et adolescents.',
                'specialite' => 'Pédiatrie',
                'motif' => 'Fievre et controle pediatrique',
                'diagnostic' => 'Infection virale simple',
                'traitement' => 'Hydratation, surveillance de la temperature',
                'medicaments' => ['Paracetamol sirop', 'Zinc pediatrique'],
                'posologie' => 'Dose adaptee au poids de l enfant',
            ],
            [
                'nom' => 'Cardiologie',
                'description' => 'Suivi de la tension arterielle et des pathologies cardiovasculaires.',
                'specialite' => 'Cardiologie',
                'motif' => 'Controle tensionnel',
                'diagnostic' => 'Hypertension arterielle controlee',
                'traitement' => 'Surveillance tensionnelle et activite physique reguliere',
                'medicaments' => ['Amlodipine 5mg', 'Hydrochlorothiazide 25mg'],
                'posologie' => 'Un comprime le matin selon avis medical',
            ],
        ];

        return array_map(function (array $service, int $index) use ($doctorGroups) {
            $service['medecins'] = array_map(function (string $name, int $doctorIndex) use ($index) {
                return [
                    'name' => $name,
                    'sexe' => str_contains($name, 'Awa') || str_contains($name, 'Mariama') || str_contains($name, 'Fatou') || str_contains($name, 'Akouavi') || str_contains($name, 'Rokia') || str_contains($name, 'Aminata') || str_contains($name, 'Adjoa') || str_contains($name, 'Fanta') || str_contains($name, 'Binta') || str_contains($name, 'Salimata') || str_contains($name, 'Aissatou') || str_contains($name, 'Akossiwa') ? 'F' : 'M',
                    'date_naissance' => (1974 + $index + $doctorIndex) . '-05-12',
                    'experience' => 6 + $index + $doctorIndex,
                ];
            }, $doctorGroups[$index], array_keys($doctorGroups[$index]));

            return $service;
        }, $serviceTemplates, array_keys($serviceTemplates));
    }

    private function afficherResume(): void
    {
        $this->command->info('');
        $this->command->info('Resume du systeme Med-Archive');
        $this->command->info('==================================');
        $this->command->info('Etablissements : ' . Etablissement::count());
        $this->command->info('Services : ' . Service::count());
        $this->command->info('Medecins : ' . Medecin::count());
        $this->command->info('Laboratoires : ' . Laboratoire::count());
        $this->command->info('Patients : ' . Patient::count());
        $this->command->info('Dossiers medicaux : ' . Dossier::count());
        $this->command->info('Consultations : ' . Consultation::count());
        $this->command->info('==================================');
        $this->command->info('');
    }
}
