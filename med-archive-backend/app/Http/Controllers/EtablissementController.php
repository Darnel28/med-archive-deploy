<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\InformationEtablissement;
use App\Models\Medecin;
use App\Models\Patient;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EtablissementController extends Controller
{
    /**
     * Données de l'établissement connecté
     */
    public function mesDonnees(Request $request)
    {
        $etablissement = $request->user();

        if (!$etablissement->isEtablissement()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux établissements'
            ], 403);
        }

        $info = $etablissement->informationEtablissement;
        $statistiques = $etablissement->statistiquesEtablissement();

        return response()->json([
            'success' => true,
            'data' => [
                'etablissement' => [
                    'id' => $etablissement->id,
                    'nom' => $etablissement->name,
                    'email' => $etablissement->email,
                    'telephone' => $etablissement->telephone,
                    'adresse' => $etablissement->adresse,
                    'type' => $info?->type_etablissement,
                    'code' => $info?->code_etablissement,
                    'directeur' => $info?->directeur_nom
                ],
                'statistiques' => $statistiques
            ]
        ]);
    }

    /**
     * Médecins de l'établissement
     */
    public function mesMedecins(Request $request)
    {
        $etablissement = $request->user();

        if (!$etablissement->isEtablissement()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux établissements'
            ], 403);
        }

        $medecins = $etablissement->medecins()
            ->with(['medecin.specialite'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'nom' => $user->name,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'specialite' => $user->medecin->specialite->nom ?? null,
                    'numero_professionnel' => $user->medecin->numero_professionnel ?? null,
                    'annees_experience' => $user->medecin->annees_experience ?? 0,
                    'statistiques' => [
                        'consultations_mois' => $user->medecin->consultations()
                            ->whereMonth('date_consultation', now()->month)
                            ->count(),
                        'patients_actifs' => $user->medecin->patients()->count()
                    ]
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $medecins
        ]);
    }

    /**
     * Patients de l'établissement
     */
    public function mesPatients(Request $request)
    {
        $etablissement = $request->user();

        if (!$etablissement->isEtablissement()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux établissements'
            ], 403);
        }

        $patients = $etablissement->mesPatients()
            ->with([
                'patient.service',
                'patient.dossier.medecinReferent.user',
                'patient.dossier.medecinReferent.service',
                'patient.dossier.serviceProprietaire',
                'patient.dossier.transferts',
            ])
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $patients
        ]);
    }

    /**
     * Consultations de l'établissement
     */
    public function mesConsultations(Request $request)
    {
        $etablissement = $request->user();

        if (!$etablissement->isEtablissement()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux établissements'
            ], 403);
        }

        $query = $etablissement->mesConsultations();

        // Filtres
        if ($request->has('date_debut')) {
            $query->whereDate('date_consultation', '>=', $request->date_debut);
        }
        if ($request->has('date_fin')) {
            $query->whereDate('date_consultation', '<=', $request->date_fin);
        }
        if ($request->has('medecin_id')) {
            $query->where('medecin_id', $request->medecin_id);
        }

        $consultations = $query->with(['medecin.user', 'dossier.patient.user'])
            ->orderBy('date_consultation', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $consultations
        ]);
    }

    /**
     * Statistiques détaillées de l'établissement
     */
    public function statistiques(Request $request)
    {
        $etablissement = $request->user();

        if (!$etablissement->isEtablissement()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux établissements'
            ], 403);
        }

        $debut = $request->get('debut', now()->startOfMonth());
        $fin = $request->get('fin', now()->endOfMonth());

        $medecinIds = $etablissement->medecins()->pluck('id');

        $consultations = Consultation::whereIn('medecin_id', $medecinIds)
            ->whereBetween('date_consultation', [$debut, $fin]);

        return response()->json([
            'success' => true,
            'data' => [
                'periode' => [
                    'debut' => $debut,
                    'fin' => $fin
                ],
                'consultations' => [
                    'total' => $consultations->count(),
                    'par_jour' => $consultations->select(
                            DB::raw('DATE(date_consultation) as date'),
                            DB::raw('count(*) as total')
                        )
                        ->groupBy('date')
                        ->orderBy('date')
                        ->get(),
                    'par_motif' => $consultations->select('motif', DB::raw('count(*) as total'))
                        ->groupBy('motif')
                        ->orderBy('total', 'desc')
                        ->limit(10)
                        ->get()
                ],
                'patients' => [
                    'total' => $etablissement->mesPatients()->count(),
                    'nouveaux' => $etablissement->mesPatients()
                        ->where('created_at', '>=', $debut)
                        ->count()
                ],
                'medecins' => [
                    'total' => $etablissement->medecins()->count(),
                    'plus_actifs' => $consultations->select('medecin_id', DB::raw('count(*) as total'))
                        ->with('medecin.user')
                        ->groupBy('medecin_id')
                        ->orderBy('total', 'desc')
                        ->limit(5)
                        ->get()
                        ->map(function($item) {
                            return [
                                'nom' => $item->medecin->user->name,
                                'consultations' => $item->total
                            ];
                        })
                ]
            ]
        ]);
    }

    /**
     * Tableau de bord de l'établissement
     */
    public function dashboard(Request $request)
    {
        $etablissement = $request->user();

        if (!$etablissement->isEtablissement()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux établissements'
            ], 403);
        }

        $aujourdhui = now()->format('Y-m-d');
        $medecinIds = $etablissement->medecins()->pluck('id');

        return response()->json([
            'success' => true,
            'data' => [
                'consultations_aujourdhui' => Consultation::whereIn('medecin_id', $medecinIds)
                    ->whereDate('date_consultation', $aujourdhui)
                    ->count(),
                'patients_actifs' => $etablissement->mesPatients()
                    ->whereHas('patient.consultations', function($q) {
                        $q->where('date_consultation', '>=', now()->subMonths(3));
                    })
                    ->count(),
                'medecins_actifs' => $etablissement->medecins()
                    ->whereHas('medecin.consultations', function($q) use ($aujourdhui) {
                        $q->whereDate('date_consultation', $aujourdhui);
                    })
                    ->count(),
                'analyses_en_cours' => DB::table('analyses_laboratoire')
                    ->whereIn('prescripteur_id', $medecinIds)
                    ->whereIn('statut', ['prescrit', 'preleve', 'en_cours'])
                    ->count(),
                'consultations_recentes' => Consultation::whereIn('medecin_id', $medecinIds)
                    ->with(['medecin.user', 'dossier.patient.user'])
                    ->latest('date_consultation')
                    ->limit(10)
                    ->get()
            ]
        ]);
    }

    /**
     * Mettre à jour les informations de l'établissement
     */
    public function updateInfo(Request $request)
    {
        $etablissement = $request->user();

        if (!$etablissement->isEtablissement()) {
            return response()->json([
                'success' => false,
                'message' => 'Accès réservé aux établissements'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $etablissement->id,
            'telephone' => 'sometimes|string|max:20',
            'adresse' => 'sometimes|string',
            'directeur_nom' => 'sometimes|string|max:255',
            'type_etablissement' => 'sometimes|in:hopital,clinique,cabinet,laboratoire'
        ]);

        // Mettre à jour l'utilisateur
        if ($request->has('name') || $request->has('email') || $request->has('telephone') || $request->has('adresse')) {
            $userData = [];
            if ($request->has('name')) $userData['name'] = $request->name;
            if ($request->has('email')) $userData['email'] = $request->email;
            if ($request->has('telephone')) $userData['telephone'] = $request->telephone;
            if ($request->has('adresse')) $userData['adresse'] = $request->adresse;

            $etablissement->update($userData);
        }

        // Mettre à jour les informations spécifiques
        if ($etablissement->informationEtablissement) {
            $infoData = [];
            if ($request->has('directeur_nom')) $infoData['directeur_nom'] = $request->directeur_nom;
            if ($request->has('type_etablissement')) $infoData['type_etablissement'] = $request->type_etablissement;

            $etablissement->informationEtablissement->update($infoData);
        }

        return response()->json([
            'success' => true,
            'message' => 'Informations mises à jour avec succès'
        ]);
    }
}
