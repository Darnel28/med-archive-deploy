<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Liste des utilisateurs avec filtres
     */
    public function index(Request $request)
    {
        $query = User::with('role');

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
            'date_naissance' => 'nullable|date',
            'sexe' => 'nullable|in:M,F',
            'statut' => 'sometimes|in:actif,inactif,en_attente'
        ]);

        if ($request->has('password')) {
            $request->validate(['password' => 'min:8|confirmed']);
            $validated['password'] = Hash::make($request->password);
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès',
            'data' => $user->fresh('role')
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
