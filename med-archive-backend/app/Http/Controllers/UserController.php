<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Etablissement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs avec filtres
     */
    public function index(Request $request)
    {
        $query = User::with(['role', 'etablissement', 'informationEtablissement']);

        // Filtre par rôle
        if ($request->has('role')) {
            $query->whereHas('role', function($q) use ($request) {
                $q->where('nom', $request->role);
            });
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par établissement
        if ($request->has('etablissement_id')) {
            $query->where('etablissement_id', $request->etablissement_id);
        }

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('telephone', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Créer un utilisateur.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'date_naissance' => 'nullable|date',
            'sexe' => 'nullable|in:M,F',
            'role_id' => 'nullable|exists:roles,id',
            'role' => 'nullable|string|exists:roles,nom',
            'etablissement_id' => 'nullable|exists:users,id',
            'statut' => 'nullable|in:actif,inactif,en_attente',
            'type_etablissement' => 'nullable|in:hopital,clinique,cabinet,laboratoire',
            'code_etablissement' => 'nullable|string|unique:etablissements,code_etablissement',
            'registre_commerce' => 'nullable|string|max:255',
            'directeur_nom' => 'nullable|string|max:255',
        ]);

        if (empty($validated['role_id'])) {
            $roleName = $validated['role'] ?? 'Patient';
            $validated['role_id'] = Role::where('nom', $roleName)->value('id');
        }

        $role = Role::findOrFail($validated['role_id']);

        return DB::transaction(function () use ($validated, $role) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'telephone' => $validated['telephone'] ?? null,
                'adresse' => $validated['adresse'] ?? null,
                'ville' => $validated['ville'] ?? null,
                'date_naissance' => $validated['date_naissance'] ?? null,
                'sexe' => $validated['sexe'] ?? null,
                'role_id' => $role->id,
                'etablissement_id' => $validated['etablissement_id'] ?? null,
                'statut' => $validated['statut'] ?? 'actif',
            ]);

            if ($role->isEtablissement()) {
                Etablissement::create([
                    'user_id' => $user->id,
                    'type_etablissement' => $validated['type_etablissement'] ?? 'hopital',
                    'code_etablissement' => $validated['code_etablissement'] ?? 'ETAB-' . str_pad((string) $user->id, 5, '0', STR_PAD_LEFT),
                    'registre_commerce' => $validated['registre_commerce'] ?? null,
                    'directeur_nom' => $validated['directeur_nom'] ?? null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $user->fresh(['role', 'etablissement', 'informationEtablissement'])
            ], 201);
        });
    }

    /**
     * Détails d'un utilisateur
     */
    public function show($id)
    {
        $user = User::with([
            'role',
            'etablissement',
            'medecin.specialite',
            'patient',
            'laboratoire',
            'informationEtablissement'
        ])->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Mettre à jour un utilisateur
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'date_naissance' => 'nullable|date',
            'sexe' => 'nullable|in:M,F',
            'role_id' => 'sometimes|exists:roles,id',
            'etablissement_id' => 'nullable|exists:users,id',
            'type_etablissement' => 'nullable|in:hopital,clinique,cabinet,laboratoire',
            'code_etablissement' => 'nullable|string|unique:etablissements,code_etablissement,' . $user->informationEtablissement?->id,
            'registre_commerce' => 'nullable|string|max:255',
            'directeur_nom' => 'nullable|string|max:255',
            'statut' => 'sometimes|in:actif,inactif,en_attente'
        ]);

        if ($request->has('password')) {
            $request->validate(['password' => 'min:8|confirmed']);
            $validated['password'] = Hash::make($request->password);
        }

        $etablissementData = collect($validated)->only([
            'type_etablissement',
            'code_etablissement',
            'registre_commerce',
            'directeur_nom',
        ])->toArray();

        $userData = collect($validated)->except([
            'type_etablissement',
            'code_etablissement',
            'registre_commerce',
            'directeur_nom',
        ])->toArray();

        $user->update($userData);

        $freshUser = $user->fresh('role');
        if ($freshUser->role?->isEtablissement()) {
            $freshUser->informationEtablissement()->updateOrCreate(
                ['user_id' => $freshUser->id],
                array_merge([
                    'type_etablissement' => 'hopital',
                    'code_etablissement' => 'ETAB-' . str_pad((string) $freshUser->id, 5, '0', STR_PAD_LEFT),
                ], $etablissementData)
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $user->fresh(['role', 'etablissement', 'informationEtablissement'])
        ]);
    }

    /**
     * Supprimer un utilisateur.
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }

    /**
     * Désactiver un utilisateur
     */
    public function desactiver($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->update(['statut' => 'inactif']);
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur désactivé avec succès'
        ]);
    }

    /**
     * Activer un utilisateur
     */
    public function activer($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->update(['statut' => 'actif']);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur activé avec succès'
        ]);
    }

    /**
     * Statistiques globales
     */
    public function statistiques()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_utilisateurs' => User::count(),
                'par_role' => [
                    'medecins' => User::whereHas('role', fn($q) => $q->where('nom', 'Medecin'))->count(),
                    'patients' => User::whereHas('role', fn($q) => $q->where('nom', 'Patient'))->count(),
                    'etablissements' => User::whereHas('role', fn($q) => $q->where('nom', 'Responsable Etablissement'))->count(),
                    'laborantins' => User::whereHas('role', fn($q) => $q->where('nom', 'Laborantin'))->count(),
                ],
                'actifs' => User::where('statut', 'actif')->count(),
                'inactifs' => User::where('statut', 'inactif')->count()
            ]
        ]);
    }
}
