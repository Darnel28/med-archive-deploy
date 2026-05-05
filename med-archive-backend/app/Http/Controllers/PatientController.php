<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\User;
use App\Models\Dossier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;

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
            'password' => 'required|string|min:6',
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
            'lieu_naissance' => 'nullable|string'
        ]);

        DB::beginTransaction();

        try {
            // Créer l'utilisateur
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => bcrypt($validated['password']),
                'telephone' => $validated['telephone'],
                'adresse' => $validated['adresse'],
                'ville' => $validated['ville'],
                'date_naissance' => $validated['date_naissance'],
                'sexe' => $validated['sexe'],
                'role_id' => 3,
                'statut' => 'actif'
            ]);

            // Créer le patient
            $patient = Patient::create([
                'user_id' => $user->id,
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
                'medecin_traitant' => null
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Patient créé avec succès',
                'data' => $patient->load('user', 'dossier')
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
            'dossier',
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

    /**
     * Dossier complet du patient
     */
    public function dossierComplet($id)
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

        $contenuComplet = $patient->dossier->contenu_complet;

        return response()->json([
            'success' => true,
            'data' => $contenuComplet
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

    public function generateQrCode($id)
    {
        // nécessite 'composer require endroid/qr-code'
        $patient = Patient::findOrFail($id);

        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($patient->imu)
            ->size(300)
            ->margin(10)
            ->build();

        return response($result->getString(), 200)
            ->header('Content-Type', 'image/png');
    }
}
