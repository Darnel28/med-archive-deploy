<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use App\Models\Dossier;
use App\Models\Role;
use App\Models\Service;
use App\Support\CompteCreeMailer;
use App\Support\DossierAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\SvgWriter;

class PatientController extends Controller
{
    /**
     * Liste des patients
     */
    public function index(Request $request)
    {
        $query = Patient::with(['user', 'dossier']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->Where('imu', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('telephone', 'like', "%{$search}%");
                  });
            });
        }

        // Filtre par groupe sanguin
        if ($request->has('groupe_sanguin')) {
            $query->where('groupe_sanguin', $request->groupe_sanguin);
        }

        $patients = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

    /**
     * Créer un nouveau patient
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'npi' => 'required|string|unique:patients,npi',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'telephone' => 'required|string|max:20',
            'adresse' => 'required|string',
            'ville' => 'required|string|max:255',
            'date_naissance' => 'required|date',
            'sexe' => 'required|in:M,F',
            'groupe_sanguin' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'nullable|string',
            'antecedents_medicaux' => 'nullable|string',
            'personne_contact' => 'nullable|string',
            'telephone_contact' => 'nullable|string',
            'profession' => 'nullable|string',
            'nationalite' => 'nullable|string',
            'lieu_naissance' => 'nullable|string',
            'service_id' => 'nullable|exists:services,id'
        ]);

        $plainPassword = $validated['password'] ?? Str::password(12);
        $mailWarning = null;
        $selectedServiceId = null;
        $selectedService = null;
        $currentUser = $request->user();

        if ($currentUser?->isService()) {
            $selectedService = $currentUser->service;
            $selectedServiceId = $selectedService?->id;
        } elseif (!empty($validated['service_id'])) {
            $selectedService = Service::find($validated['service_id']);

            if ($currentUser?->isEtablissement() && (int) $selectedService?->etablissement_id !== (int) $currentUser->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Le service choisi n appartient pas a votre etablissement.'
                ], 422);
            }

            $selectedServiceId = $selectedService?->id;
        }

        DB::beginTransaction();

        try {
            $rolePatient = Role::where('nom', 'Patient')->firstOrFail();

            // Créer l'utilisateur
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($plainPassword),
                'telephone' => $validated['telephone'],
                'adresse' => $validated['adresse'],
                'ville' => $validated['ville'],
                'date_naissance' => $validated['date_naissance'],
                'sexe' => $validated['sexe'],
                'role_id' => $rolePatient->id,
                'etablissement_id' => $selectedService?->etablissement_id,
                'statut' => 'actif',
                'must_change_password' => true,
                'temporary_password_expires_at' => now()->addDay(),
            ]);

            // Créer le patient
            $patient = Patient::create([
                'user_id' => $user->id,
                'service_id' => $selectedServiceId,
                'npi' => $validated['npi'],
                'imu' => Patient::generateIMU(),
                'groupe_sanguin' => $validated['groupe_sanguin'] ?? null,
                'allergies' => $validated['allergies'] ?? null,
                'antecedents_medicaux' => $validated['antecedents_medicaux'] ?? null,
                'personne_contact' => $validated['personne_contact'] ?? null,
                'telephone_contact' => $validated['telephone_contact'] ?? null,
                'profession' => $validated['profession'] ?? null,
                'nationalite' => $validated['nationalite'] ?? 'Béninoise',
                'lieu_naissance' => $validated['lieu_naissance'] ?? null
            ]);

            // Créer le dossier médical
            Dossier::create([
                'patient_id' => $patient->id,
                'numero_dossier' => Dossier::generateNumeroDossier(),
                'imu' => $patient->imu,
                'statut' => 'actif',
                'date_ouverture' => now(),
                'medecin_traitant' => null,
                'service_proprietaire_id' => $selectedServiceId
            ]);

            DB::commit();

            $mailWarning = CompteCreeMailer::send($user, $plainPassword, 'patient');

            return response()->json([
                'success' => true,
                'message' => $mailWarning ?: 'Patient cree avec succes. Les identifiants ont ete envoyes par email.',
                'warning' => $mailWarning,
                'data' => $patient->load('user', 'service', 'dossier.serviceProprietaire')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détails d'un patient
     */
    public function show($id)
    {
        $patient = Patient::with([
            'user',
            'service',
            'dossier.medecinReferent.user',
            'dossier.serviceProprietaire',
            'consultations' => function($q) {
                $q->with(['medecin.user', 'constantes'])
                  ->latest('date_consultation')
                  ->limit(10);
            }
        ])->find($id);

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $patient
        ]);
    }

    public function showByImu($imu)
    {
        $patient = Patient::where('imu', $imu)
            ->with('dossier', 'user')
            ->first();
        if (!$patient) return response()->json([
            'success' => false, 'message' => 'Patient introuvable'
        ], 404);
        return response()->json([
            'success' => true, 'data' => $patient
        ]);
    }

    /**  patient QR code. */
    public function emergencyCardByImu($imu)
    {
        $patient = Patient::where('imu', $imu)->with([
            'user:id,name,telephone,date_naissance,sexe',
            'dossier.serviceProprietaire.etablissement:id,name',
            'dossier.ordonnances' => fn ($query) => $query->latest('ordonnances.created_at'),
        ])->first();

        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Patient introuvable'], 404);
        }

        $user = $patient->user;
        $service = $patient->dossier?->serviceProprietaire;
        $medicamentsActuels = ($patient->dossier?->ordonnances ?? collect())
            ->flatMap(fn ($ordonnance) => is_array($ordonnance->medicaments) ? $ordonnance->medicaments : [$ordonnance->medicaments])
            ->filter()
            ->unique()
            ->values()
            ->all();
        return response()->json([
            'success' => true,
            'data' => [
                'nom_complet' => $user?->name,
                'sexe' => $user?->sexe,
                'date_naissance' => $user?->date_naissance,
                'photo' => $user?->avatar,
                'groupe_sanguin' => $patient->groupe_sanguin,
                'allergies' => $patient->allergies,
                'antecedents_medicaux' => $patient->antecedents_medicaux,
                'maladies_chroniques' => null,
                'medicaments_actuels' => $medicamentsActuels,
                // 'implants_dispositifs' => null,
                'personne_contact' => $patient->personne_contact,
                'lien_parente' => null,
                'telephone_contact' => $patient->telephone_contact,
                'imu' => $patient->imu,
                'dernier_etablissement' => $service?->etablissement?->name ?? $service?->nom,
            ],
        ]);
    }

    /**
     * Dossier complet du patient
     */
    public function dossierComplet(Request $request, $id)
    {
        $patient = Patient::with('user')->find($id);

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient non trouvé'
            ], 404);
        }

        if (!$patient->dossier) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun dossier trouvé pour ce patient'
            ], 404);
        }

        $dossier = $patient->dossier;

        if (!DossierAccess::canRead($request->user(), $dossier)) {
            return response()->json([
                'success' => false,
                'message' => 'Acces refuse',
            ], 403);
        }

        $consultations = DossierAccess::applyReadableConsultations($request->user(), $dossier, $dossier->consultations())
            ->with(['medecin.user', 'medecin.etablissement', 'service', 'constantes', 'ordonnance', 'analyses.laboratoire.user', 'documents.typeDocument'])
            ->latest('date_consultation')
            ->get();
        $visibleConsultationIds = $consultations->pluck('id');

        $latestConstantes = $consultations
            ->pluck('constantes')
            ->filter()
            ->sortByDesc(fn ($constante) => $constante->created_at)
            ->first();

        $contenuComplet = [
            'dossier' => $dossier->load(['medecinReferent.user', 'medecinReferent.specialite', 'serviceProprietaire']),
            'patient' => $patient->load('user'),
            'consultations' => $consultations,
            'dernieres_constantes' => $latestConstantes,
            'documents' => $dossier->documents()
                ->whereIn('consultations.id', $visibleConsultationIds)
                ->with('typeDocument')
                ->latest('documents.created_at')
                ->get(),
            'analyses' => $dossier->analyses()
                ->whereIn('consultations.id', $visibleConsultationIds)
                ->with(['laboratoire.user', 'prescripteur.user'])
                ->latest('date_prelevement')
                ->get(),
            'ordonnances' => $dossier->ordonnances()
                ->whereIn('consultations.id', $visibleConsultationIds)
                ->with(['consultation.medecin.user'])
                ->latest('ordonnances.created_at')
                ->get(),
            'statistiques' => [
                'total_consultations' => $consultations->count(),
                'total_documents' => $dossier->documents()->whereIn('consultations.id', $visibleConsultationIds)->count(),
                'total_analyses' => $dossier->analyses()->whereIn('consultations.id', $visibleConsultationIds)->count(),
                'derniere_activite' => $consultations->first()?->date_consultation,
            ],
            'permissions' => [
                'can_read' => true,
                'can_write' => DossierAccess::canWrite($request->user(), $dossier),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $contenuComplet
        ]);
    }

    public function monDossierComplet(Request $request)
    {
        $patient = $request->user()->patient;

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Espace patient introuvable',
            ], 403);
        }

        return $this->dossierComplet($request, $patient->id);
    }

    public function mesConsultations(Request $request)
    {
        $patient = $request->user()->patient;

        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Espace patient introuvable'], 403);
        }

        $query = $patient->consultations()
            ->with(['medecin.user', 'medecin.specialite', 'service', 'facture', 'constantes', 'ordonnance'])
            ->latest('date_consultation');

        if ($request->filled('periode')) {
            $request->periode === 'avenir'
                ? $query->where('date_consultation', '>=', now()->startOfDay())
                : $query->where('date_consultation', '<', now());
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate($request->get('per_page', 15)),
        ]);
    }

    public function mesOrdonnances(Request $request)
    {
        $patient = $request->user()->patient;

        if (!$patient || !$patient->dossier) {
            return response()->json(['success' => false, 'message' => 'Dossier patient introuvable'], 403);
        }

        $ordonnances = $patient->dossier->ordonnances()
            ->with([
                'consultation.medecin.user',
                'consultation.medecin.etablissement',
                'consultation.medecin.specialite',
                'consultation.service.etablissement',
            ])
            ->latest('ordonnances.created_at')
            ->paginate($request->get('per_page', 15));

        return response()->json(['success' => true, 'data' => $ordonnances]);
    }

    public function mesAnalyses(Request $request)
    {
        $patient = $request->user()->patient;

        if (!$patient || !$patient->dossier) {
            return response()->json(['success' => false, 'message' => 'Dossier patient introuvable'], 403);
        }

        $query = $patient->dossier->analyses()
            ->with(['laboratoire.user', 'prescripteur.user', 'consultation', 'facture'])
            ->latest('analyses_laboratoire.created_at');

        if ($request->filled('statut_paiement')) {
            $query->where('statut_paiement', $request->statut_paiement);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate($request->get('per_page', 15)),
        ]);
    }

    public function mesFactures(Request $request)
    {
        $patient = $request->user()->patient;

        if (!$patient) {
            return response()->json(['success' => false, 'message' => 'Espace patient introuvable'], 403);
        }

        $query = $patient->factures()->with([
            'consultation.medecin.user.etablissement',
            'consultation.medecin.specialite',
            'consultation.service',
            'paiements',
        ]);

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate($request->get('per_page', 15)),
        ]);
    }

    /**
     * Mettre à jour un patient
     */
    public function update(Request $request, $id)
    {
        $patient = Patient::find($id);

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient non trouvé'
            ], 404);
        }

        $validated = $request->validate([
            'groupe_sanguin' => 'nullable|in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            'allergies' => 'nullable|string',
            'antecedents_medicaux' => 'nullable|string',
            'personne_contact' => 'nullable|string',
            'telephone_contact' => 'nullable|string',
            'profession' => 'nullable|string',
            'nationalite' => 'nullable|string',
            'lieu_naissance' => 'nullable|string'
        ]);

        $patient->update($validated);

        // Mettre à jour aussi l'utilisateur si nécessaire
        if ($request->has('name') || $request->has('telephone') || $request->has('adresse')) {
            $userData = [];
            if ($request->has('name')) $userData['name'] = $request->name;
            if ($request->has('telephone')) $userData['telephone'] = $request->telephone;
            if ($request->has('adresse')) $userData['adresse'] = $request->adresse;

            $patient->user->update($userData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Patient mis à jour avec succès',
            'data' => $patient->fresh(['user', 'dossier'])
        ]);
    }

    /**
     * Statistiques des patients
     */
    public function statistiques()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_patients' => Patient::count(),
                'repartition_groupe_sanguin' => Patient::select('groupe_sanguin', DB::raw('count(*) as total'))
                    ->groupBy('groupe_sanguin')
                    ->get(),
                'patients_avec_allergies' => Patient::whereNotNull('allergies')->where('allergies', '!=', 'Aucune')->count(),
                'patients_avec_antecedents' => Patient::whereNotNull('antecedents_medicaux')->where('antecedents_medicaux', '!=', 'Aucun')->count(),
                'nouveaux_mois' => Patient::whereMonth('created_at', now()->month)->count()
            ]
        ]);
    }
// le coede qr du patient 
    public function generateQrCode($id)
    {
        $patient = Patient::findOrFail($id);

 
        // route public.
        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://med-archive-projet.onrender.com'), '/');
       
       
        $qrText = $frontendUrl . '/#/urgence/' . rawurlencode($patient->imu);

        $builder = new Builder(
            writer: new SvgWriter(),
            data: $qrText,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 650,
            margin: 10,
        );

        $result = $builder->build();

        return response($result->getString(), 200)
            ->header('Content-Type', 'image/svg+xml');
    }
}
