<?php

namespace App\Http\Controllers;

use App\Models\Laboratoire;
use App\Models\User;
use App\Models\AnalyseLaboratoire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class LaboratoireController extends Controller
{
    /**
     * Liste des laboratoires
     */
    public function index(Request $request)
    {
        $query = Laboratoire::with(['user', 'etablissement']);

        // Filtre par établissement
        if ($request->has('etablissement_id')) {
            $query->where('etablissement_id', $request->etablissement_id);
        }

        // Filtre par statut
        if ($request->has('est_actif')) {
            $query->where('est_actif', $request->est_actif);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nom_laboratoire', 'like', "%{$search}%")
                  ->orWhere('agrement', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $laboratoires = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $laboratoires
        ]);
    }

    /**
     * Créer un nouveau laboratoire
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|max:20',
            'adresse' => 'required|string',
            'etablissement_id' => 'required|exists:users,id',
            'nom_laboratoire' => 'required|string|max:255',
            'agrement' => 'required|string|unique:laboratoires,agrement',
            'specialites_analyse' => 'nullable|array'
        ]);

        DB::beginTransaction();

        try {
            // Créer l'utilisateur (laborantin)
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make('password123'),
                'telephone' => $validated['telephone'],
                'adresse' => $validated['adresse'],
                'role_id' => 5, // Laborantin (à adapter)
                'etablissement_id' => $validated['etablissement_id'],
                'statut' => 'actif'
            ]);

            // Créer le laboratoire
            $laboratoire = Laboratoire::create([
                'user_id' => $user->id,
                'etablissement_id' => $validated['etablissement_id'],
                'nom_laboratoire' => $validated['nom_laboratoire'],
                'agrement' => $validated['agrement'],
                'specialites_analyse' => $validated['specialites_analyse'] ?? [],
                'est_actif' => true
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Laboratoire créé avec succès',
                'data' => $laboratoire->load(['user', 'etablissement'])
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
     * Détails d'un laboratoire
     */
    public function show($id)
    {
        $laboratoire = Laboratoire::with([
            'user',
            'etablissement',
            'analyses' => function($q) {
                $q->with(['consultation.dossier.patient.user', 'prescripteur.user'])
                  ->latest('date_prelevement')
                  ->limit(20);
            }
        ])->find($id);

        if (!$laboratoire) {
            return response()->json([
                'success' => false,
                'message' => 'Laboratoire non trouvé'
            ], 404);
        }

        // Statistiques
        $stats = [
            'total_analyses' => $laboratoire->analyses()->count(),
            'analyses_en_attente' => $laboratoire->analysesEnAttente()->count(),
            'analyses_terminees' => $laboratoire->analyses()->where('statut', 'termine')->count(),
            'analyses_mois' => $laboratoire->analyses()
                ->whereMonth('created_at', now()->month)
                ->count()
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'laboratoire' => $laboratoire,
                'statistiques' => $stats
            ]
        ]);
    }

    /**
     * Mettre à jour un laboratoire
     */
    public function update(Request $request, $id)
    {
        $laboratoire = Laboratoire::find($id);

        if (!$laboratoire) {
            return response()->json([
                'success' => false,
                'message' => 'Laboratoire non trouvé'
            ], 404);
        }

        $validated = $request->validate([
            'nom_laboratoire' => 'sometimes|string|max:255',
            'agrement' => 'sometimes|string|unique:laboratoires,agrement,' . $id,
            'specialites_analyse' => 'nullable|array',
            'est_actif' => 'sometimes|boolean',
            'telephone' => 'sometimes|string|max:20',
            'adresse' => 'sometimes|string'
        ]);

        DB::beginTransaction();

        try {
            // Mettre à jour le laboratoire
            $laboratoire->update([
                'nom_laboratoire' => $validated['nom_laboratoire'] ?? $laboratoire->nom_laboratoire,
                'agrement' => $validated['agrement'] ?? $laboratoire->agrement,
                'specialites_analyse' => $validated['specialites_analyse'] ?? $laboratoire->specialites_analyse,
                'est_actif' => $validated['est_actif'] ?? $laboratoire->est_actif
            ]);

            // Mettre à jour l'utilisateur
            if ($request->has('telephone') || $request->has('adresse')) {
                $userData = [];
                if ($request->has('telephone')) $userData['telephone'] = $request->telephone;
                if ($request->has('adresse')) $userData['adresse'] = $request->adresse;

                $laboratoire->user->update($userData);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Laboratoire mis à jour avec succès',
                'data' => $laboratoire->fresh(['user', 'etablissement'])
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
     * Analyses en attente du laboratoire
     */
    public function analysesEnAttente(Request $request, $id)
    {
        $laboratoire = Laboratoire::find($id);

        if (!$laboratoire) {
            return response()->json([
                'success' => false,
                'message' => 'Laboratoire non trouvé'
            ], 404);
        }

        $analyses = $laboratoire->analysesEnAttente()
            ->with(['consultation.dossier.patient.user', 'prescripteur.user'])
            ->orderBy('date_prelevement')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $analyses
        ]);
    }

    /**
     * Statistiques du laboratoire
     */
    public function statistiques($id)
    {
        $laboratoire = Laboratoire::find($id);

        if (!$laboratoire) {
            return response()->json([
                'success' => false,
                'message' => 'Laboratoire non trouvé'
            ], 404);
        }

        $stats = $laboratoire->statistiques();

        // Évolution mensuelle
        $evolution = $laboratoire->analyses()
            ->select(
                DB::raw('DATE_TRUNC(\'month\', created_at) as mois'),
                DB::raw('count(*) as total'),
                DB::raw("count(case when statut = 'termine' then 1 end) as terminees")
            )
            ->groupBy('mois')
            ->orderBy('mois', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'resume' => $stats,
                'evolution' => $evolution
            ]
        ]);
    }
}
