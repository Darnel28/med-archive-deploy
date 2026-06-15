<?php

namespace App\Http\Controllers;

use App\Models\Medecin;
use App\Models\User;
use App\Models\Consultation;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MedecinController extends Controller
{
    /**
     * Liste des médecins
     */
    public function index(Request $request)
    {
        $query = Medecin::with(['user', 'specialite', 'etablissement']);

        // Filtre par spécialité
        if ($request->has('specialite')) {
            $query->whereHas('specialite', function($q) use ($request) {
                $q->where('nom', 'like', "%{$request->specialite}%");
            });
        }

        // Filtre par établissement
        if ($request->has('etablissement_id')) {
            $query->where('etablissement_id', $request->etablissement_id);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->whereHas('user', function($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                              ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('numero_professionnel', 'like', "%{$search}%");
            });
        }

        $medecins = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $medecins
        ]);
    }

    /**
     * Créer un nouveau médecin
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|max:20',
            'adresse' => 'required|string',
            'date_naissance' => 'required|date',
            'sexe' => 'required|in:M,F',
            'specialite_id' => 'required|exists:specialites,id',
            'etablissement_id' => 'required|exists:users,id',
            'numero_professionnel' => 'required|string|unique:medecins,numero_professionnel',
            'diplome' => 'nullable|string',
            'annees_experience' => 'nullable|integer|min:0'
        ]);

        DB::beginTransaction();

        try {
            // Créer l'utilisateur
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('password123'),
                'telephone' => $validated['telephone'],
                'adresse' => $validated['adresse'],
                'date_naissance' => $validated['date_naissance'],
                'sexe' => $validated['sexe'],
                'role_id' => 2, // Medecin (à adapter)
                'etablissement_id' => $validated['etablissement_id'],
                'statut' => 'actif'
            ]);

            // Créer le médecin
            $medecin = Medecin::create([
                'user_id' => $user->id,
                'etablissement_id' => $validated['etablissement_id'],
                'specialite_id' => $validated['specialite_id'],
                'numero_professionnel' => $validated['numero_professionnel'],
                'diplome' => $validated['diplome'] ?? null,
                'annees_experience' => $validated['annees_experience'] ?? 0
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Médecin créé avec succès',
                'data' => $medecin->load(['user', 'specialite', 'etablissement'])
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
     * Détails d'un médecin
     */
    public function show($id)
    {
        $medecin = Medecin::with([
            'user',
            'specialite',
            'etablissement',
            'consultations' => function($q) {
                $q->with(['dossier.patient.user'])
                  ->latest('date_consultation')
                  ->limit(10);
            }
        ])->find($id);

        if (!$medecin) {
            return response()->json([
                'success' => false,
                'message' => 'Médecin non trouvé'
            ], 404);
        }

        // Statistiques du médecin
        $stats = [
            'total_consultations' => $medecin->consultations()->count(),
            'consultations_mois' => $medecin->consultations()
                ->whereMonth('date_consultation', now()->month)
                ->count(),
            'patients_uniques' => $medecin->patients()->count(),
            'analyses_prescrites' => $medecin->analysesPrescrites()->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'medecin' => $medecin,
                'statistiques' => $stats
            ]
        ]);
    }

    /**
     * Mettre à jour un médecin
     */
    public function update(Request $request, $id)
    {
        $medecin = Medecin::find($id);

        if (!$medecin) {
            return response()->json([
                'success' => false,
                'message' => 'Médecin non trouvé'
            ], 404);
        }

        $validated = $request->validate([
            'specialite_id' => 'sometimes|exists:specialites,id',
            'diplome' => 'nullable|string',
            'annees_experience' => 'nullable|integer|min:0',
            'telephone' => 'sometimes|string|max:20',
            'adresse' => 'sometimes|string'
        ]);

        DB::beginTransaction();

        try {
            // Mettre à jour le médecin
            $medecin->update([
                'specialite_id' => $validated['specialite_id'] ?? $medecin->specialite_id,
                'diplome' => $validated['diplome'] ?? $medecin->diplome,
                'annees_experience' => $validated['annees_experience'] ?? $medecin->annees_experience
            ]);

            // Mettre à jour l'utilisateur
            if ($request->has('telephone') || $request->has('adresse')) {
                $userData = [];
                if ($request->has('telephone')) $userData['telephone'] = $request->telephone;
                if ($request->has('adresse')) $userData['adresse'] = $request->adresse;

                $medecin->user->update($userData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Médecin mis à jour avec succès',
                'data' => $medecin->fresh(['user', 'specialite', 'etablissement'])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Planning du médecin
     */
    public function planning(Request $request, $id)
    {
        $medecin = Medecin::find($id);

        if (!$medecin) {
            return response()->json([
                'success' => false,
                'message' => 'Médecin non trouvé'
            ], 404);
        }

        $date = $request->get('date', now()->format('Y-m-d'));

        $consultations = Consultation::where('medecin_id', $id)
            ->whereDate('date_consultation', $date)
            ->where(function ($query) {
                $query->where('statut_paiement', 'payee')
                    ->orWhere('est_urgence', true);
            })
            ->with(['dossier.patient.user', 'medecin.user', 'medecin.etablissement'])
            ->orderBy('date_consultation')
            ->get();

        $occupiedSlots = $consultations
            ->map(fn ($consultation) => $consultation->date_consultation->format('H:i'))
            ->all();

        $slots = [];
        $start = Carbon::parse($date)->setTime(8, 0);
        $end = Carbon::parse($date)->setTime(17, 0);

        while ($start->lt($end)) {
            $slot = $start->format('H:i');

            if (!in_array($slot, $occupiedSlots, true)) {
                $slots[] = [
                    'heure' => $slot,
                    'date_consultation' => $start->format('Y-m-d\TH:i:s'),
                ];
            }

            $start->addMinutes(30);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'date' => $date,
                'total' => $consultations->count(),
                'creneaux_libres' => $slots,
                'consultations' => $consultations->map(function($c) {
                    $patient = $c->dossier?->patient;
                    $user = $patient?->user;
                    return [
                        'id' => $c->id,
                        'heure' => $c->date_consultation->format('H:i'),
                        'patient' => $user?->name,
                        'patient_id' => $patient?->id,
                        'patient_npi' => $patient?->npi,
                        'patient_imu' => $patient?->imu,
                        'patient_sexe' => $user?->sexe,
                        'patient_date_naissance' => $user?->date_naissance,
                        'numero_dossier' => $c->dossier?->numero_dossier,
                        'motif' => $c->motif,
                        'date_consultation' => $c->date_consultation,
                        'medecin' => $c->medecin?->user?->name,
                        'hopital' => $c->medecin?->etablissement?->name,
                        'hopital_adresse' => $c->medecin?->etablissement?->adresse,
                        'statut' => $c->statut ?: 'en_attente'
                    ];
                })
            ]
        ]);
    }

    /**
     * Patients du médecin
     */
    public function patients($id)
    {
        $medecin = Medecin::find($id);

        if (!$medecin) {
            return response()->json([
                'success' => false,
                'message' => 'Médecin non trouvé'
            ], 404);
        }

        $patients = $medecin->patients()
            ->with(['patient.dossier'])
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }
}
