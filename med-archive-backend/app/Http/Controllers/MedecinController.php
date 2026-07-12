<?php

namespace App\Http\Controllers;

use App\Models\Medecin;
use App\Models\Role;
use App\Models\Service;
use App\Models\Specialite;
use App\Models\User;
use App\Models\Consultation;
use App\Support\CompteCreeMailer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MedecinController extends Controller
{
    /**
     * Liste des médecins
     */
    public function index(Request $request)
    {
        $query = Medecin::with(['user', 'specialite', 'etablissement', 'service']);

        if ($request->user()?->isService() && $request->user()->service) {
            $query->where('service_id', $request->user()->service->id);
        }

        if ($request->user()?->isEtablissement()) {
            $query->where('etablissement_id', $request->user()->id);
        }

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

        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
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
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        $medecins->getCollection()->transform(function (Medecin $medecin) use ($monthStart, $monthEnd) {
            $patientsActifs = $medecin->patients()->count();
            $consultationsMois = $medecin->consultations()
                ->whereBetween('date_consultation', [$monthStart, $monthEnd])
                ->count();

            $medecin->setAttribute('statistiques', [
                'patients_actifs' => $patientsActifs,
                'consultations_mois' => $consultationsMois,
            ]);

            return $medecin;
        });

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
            'password' => 'nullable|string|min:6',
            'telephone' => 'required|string|max:20',
            'adresse' => 'required|string',
            'date_naissance' => 'required|date',
            'sexe' => 'required|in:M,F',
            'specialite_id' => 'nullable|exists:specialites,id',
            'etablissement_id' => 'nullable|exists:users,id',
            'service_id' => 'nullable|exists:services,id',
            'numero_professionnel' => 'required|string|unique:medecins,numero_professionnel',
            'diplome' => 'nullable|string',
            'annees_experience' => 'nullable|integer|min:0',
        ]);

        $plainPassword = $validated['password'] ?? Str::password(12);
        $mailWarning = null;

        DB::beginTransaction();

        try {
            $service = !empty($validated['service_id']) ? Service::find($validated['service_id']) : null;

            if ($request->user()?->isService()) {
                $service = $request->user()->service;
            }

            $etablissementId = $service?->etablissement_id ?? $validated['etablissement_id'] ?? null;

            if (!$etablissementId) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Etablissement ou service requis pour creer un medecin',
                ], 422);
            }

            if ($request->user()?->isEtablissement() && (int) $etablissementId !== (int) $request->user()->id) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez creer un medecin que dans votre etablissement',
                ], 403);
            }

            if ($request->user()?->isService() && (int) $service?->id !== (int) $request->user()->service?->id) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez creer un medecin que dans votre service',
                ], 403);
            }

            $specialiteId = $service?->specialite_id
                ?? ($service ? Specialite::where('nom', $service->nom)->value('id') : null)
                ?? $validated['specialite_id'];

            if (!$specialiteId) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Specialite requise pour creer un medecin',
                ], 422);
            }

            $roleMedecin = Role::where('nom', 'Medecin')->firstOrFail();

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($plainPassword),
                'telephone' => $validated['telephone'],
                'adresse' => $validated['adresse'],
                'date_naissance' => $validated['date_naissance'],
                'sexe' => $validated['sexe'],
                'role_id' => $roleMedecin->id,
                'etablissement_id' => $etablissementId,
                'statut' => 'actif',
                'must_change_password' => true,
                'temporary_password_expires_at' => now()->addDay(),
            ]);

            $medecin = Medecin::create([
                'user_id' => $user->id,
                'etablissement_id' => $etablissementId,
                'service_id' => $service?->id,
                'specialite_id' => $specialiteId,
                'numero_professionnel' => $validated['numero_professionnel'],
                'diplome' => $validated['diplome'] ?? null,
                'annees_experience' => $validated['annees_experience'] ?? 0,
            ]);

            DB::commit();

            $mailWarning = CompteCreeMailer::send($user, $plainPassword, 'medecin');

            return response()->json([
                'success' => true,
                'message' => $mailWarning ?: 'Medecin cree avec succes. Les identifiants ont ete envoyes par email.',
                'data' => [
                    'medecin' => $medecin->load(['user', 'specialite', 'etablissement', 'service']),
                    'warning' => $mailWarning,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la creation: ' . $e->getMessage(),
            ], 500);
        }
    }
    public function show($id)
    {
        $medecin = Medecin::with([
            'user',
            'specialite',
            'etablissement',
            'service',
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
        $medecin = Medecin::with('user')->find($id);

        if (!$medecin) {
            return response()->json([
                'success' => false,
                'message' => 'Médecin non trouvé'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $medecin->user_id,
            'password' => 'nullable|string|min:6',
            'telephone' => 'sometimes|string|max:20',
            'adresse' => 'sometimes|string',
            'date_naissance' => 'sometimes|date',
            'sexe' => 'sometimes|in:M,F',
            'statut' => 'sometimes|in:actif,inactif,en_attente',
            'specialite_id' => 'sometimes|exists:specialites,id',
            'etablissement_id' => 'nullable|exists:users,id',
            'service_id' => 'nullable|exists:services,id',
            'numero_professionnel' => 'sometimes|string|unique:medecins,numero_professionnel,' . $medecin->id,
            'diplome' => 'nullable|string',
            'annees_experience' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();

        try {
            // Mettre à jour le médecin
            $service = array_key_exists('service_id', $validated) && !empty($validated['service_id'])
                ? Service::find($validated['service_id'])
                : null;

            if ($request->user()?->isService()) {
                $service = $request->user()->service;
            }

            $etablissementId = $service?->etablissement_id
                ?? $validated['etablissement_id']
                ?? $medecin->etablissement_id;

            if ($request->user()?->isEtablissement() && (int) $etablissementId !== (int) $request->user()->id) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez modifier un medecin que dans votre etablissement',
                ], 403);
            }

            if ($request->user()?->isService() && (int) $service?->id !== (int) $request->user()->service?->id) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Vous ne pouvez modifier un medecin que dans votre service',
                ], 403);
            }

            $medecin->update([
                'etablissement_id' => $etablissementId,
                'service_id' => array_key_exists('service_id', $validated) ? $service?->id : $medecin->service_id,
                'specialite_id' => $validated['specialite_id'] ?? $medecin->specialite_id,
                'numero_professionnel' => $validated['numero_professionnel'] ?? $medecin->numero_professionnel,
                'diplome' => $validated['diplome'] ?? $medecin->diplome,
                'annees_experience' => $validated['annees_experience'] ?? $medecin->annees_experience
            ]);

            // Mettre à jour l'utilisateur
            $userData = [];
            foreach (['name', 'email', 'telephone', 'adresse', 'date_naissance', 'sexe', 'statut'] as $field) {
                if (array_key_exists($field, $validated)) {
                    $userData[$field] = $validated[$field];
                }
            }
            if (!empty($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
                $userData['must_change_password'] = true;
                $userData['temporary_password_expires_at'] = now()->addDay();
            }
            if ($etablissementId) {
                $userData['etablissement_id'] = $etablissementId;
            }
            if ($userData) {
                $medecin->user->update($userData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Médecin mis à jour avec succès',
                'data' => $medecin->fresh(['user', 'specialite', 'etablissement', 'service'])
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
        $medecin = Medecin::with('user')->find($id);

        if (!$medecin) {
            return response()->json([
                'success' => false,
                'message' => 'Médecin non trouvé'
            ], 404);
        }

        $date = $request->get('date', now()->format('Y-m-d'));

        $consultations = Consultation::where('medecin_id', $id)
            ->whereDate('date_consultation', $date)
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
                        'statut' => $c->statut ?: 'en_attente',
                        'statut_paiement' => $c->statut_paiement,
                        'est_urgence' => $c->est_urgence,
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

        $patients = \App\Models\User::whereHas('patient.dossier', function ($query) use ($medecin) {
                $query->where('medecin_referent_id', $medecin->id)
                    ->orWhere(function ($serviceQuery) use ($medecin) {
                        $serviceQuery->whereNotNull('service_proprietaire_id')
                            ->where('service_proprietaire_id', $medecin->service_id);
                    });
            })
            ->whereHas('role', fn ($query) => $query->where('nom', 'Patient'))
            ->with(['patient.dossier.medecinReferent.user'])
            ->orderBy('name')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }
}
