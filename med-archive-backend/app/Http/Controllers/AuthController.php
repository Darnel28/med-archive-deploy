<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'telephone' => $validated['telephone'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
            'role_id' => $validated['role_id'],
            'statut' => 'actif'
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie',
            'user' => $user->load('role'),
            'token' => $token
        ], 201);
    }

    /**
     * Connexion utilisateur
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)
                    ->with('role')
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        if ($user->statut !== 'actif') {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte est désactivé. Veuillez contacter l\'administrateur.'
            ], 403);
        }

        if ($user->temporary_password_expires_at && now()->greaterThan($user->temporary_password_expires_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Votre mot de passe temporaire a expire. Veuillez demander un nouveau mot de passe.',
                'password_expired' => true,
            ], 403);
        }

        // Supprimer les anciens tokens
        $user->tokens()->delete();

        // Créer un nouveau token
        $token = $user->createToken('auth_token', [$user->role->nom])->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'user' => $user,
            'token' => $token,
            'must_change_password' => (bool) $user->must_change_password,
        ]);
    }

    public function changerMotDePasse(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
            'temporary_password_expires_at' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifie avec succes',
        ]);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie'
        ]);
    }

    /**
     * Récupérer l'utilisateur connecté
     */
    public function me(Request $request)
    {
        $user = $request->user()->load([
            'role',
            'etablissement',
            'medecin.specialite',
            'patient',
            'service',
            'laboratoire'
        ]);

        // Charger les données spécifiques selon le rôle
        $data = ['user' => $user];

        if ($user->isMedecin() && $user->medecin) {
            $data['statistiques'] = [
                'total_patients' => $user->medecin->patients()->count(),
                'total_consultations' => $user->medecin->consultations()->count(),
                'consultations_aujourdhui' => $user->medecin->consultations()
                    ->whereDate('date_consultation', today())
                    ->count()
            ];
        }

        if ($user->isEtablissement()) {
            $data['statistiques'] = $user->statistiquesEtablissement();
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Rafraîchir le token
     */
    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        $token = $user->createToken('auth_token', [$user->role->nom])->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token
        ]);
    }
}
