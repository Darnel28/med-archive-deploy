<?php

namespace App\Http\Controllers;

use App\Mail\CompteCreeMail;
use App\Models\Role;
use App\Models\Service;
use App\Models\Patient;
use App\Models\SystemNotification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    private function success($data = null, string $message = 'OK', int $status = Response::HTTP_OK)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $status);
    }

    private function error(string $message, int $status, $data = null)
    {
        return response()->json([
            'success' => false,
            'data' => $data,
            'message' => $message,
        ], $status);
    }

    private function canReadServices(Request $request): bool
    {
        $user = $request->user();
        return $user?->isAdmin() || $user?->isEtablissement() || $user?->isMedecin() || $user?->isService();
    }

    private function canManageServices(Request $request): bool
    {
        $user = $request->user();
        return $user?->isAdmin() || $user?->isEtablissement() || $user?->isService();
    }

    private function scopeForUser(Request $request)
    {
        $user = $request->user();
        $query = Service::with(['etablissement', 'user']);

        if ($request->filled('etablissement_id')) {
            return $query->where('etablissement_id', $request->etablissement_id);
        }

        if ($user?->isAdmin()) {
            return $query;
        }

        if ($user?->isEtablissement()) {
            return $query->where('etablissement_id', $user->id);
        }

        if ($user?->isMedecin() && $user->medecin?->etablissement_id) {
            return $query->where('etablissement_id', $user->medecin->etablissement_id);
        }

        if ($user?->isService() && $user->service?->etablissement_id) {
            return $query->where('etablissement_id', $user->service->etablissement_id);
        }

        return $query->whereRaw('1 = 0');
    }

    public function index(Request $request)
    {
        if (!$this->canReadServices($request)) {
            return $this->error('Accès refusé', Response::HTTP_FORBIDDEN);
        }

        $services = $this->scopeForUser($request)->paginate($request->get('per_page', 25));

        return $this->success($services, 'Services récupérés avec succès');
    }

    public function mesPatients(Request $request)
    {
        $user = $request->user();

        if (!$user?->isService() || !$user->service) {
            return $this->error('Accès réservé au service connecté', Response::HTTP_FORBIDDEN);
        }

        $patients = Patient::with(['user', 'dossier.medecinReferent.user', 'dossier.medecinReferent.specialite', 'dossier.serviceProprietaire', 'service'])
            ->where(function ($patientQuery) use ($user) {
                $patientQuery->where('service_id', $user->service->id)
                    ->orWhereHas('dossier', function ($query) use ($user) {
                        $query->where('service_proprietaire_id', $user->service->id);
                    })
                    ->orWhereHas('consultations', function ($query) use ($user) {
                        $query->where('service_id', $user->service->id);
                    });
            })
            ->paginate($request->get('per_page', 15));

        return $this->success($patients, 'Patients du service récupérés avec succès');
    }

    public function current(Request $request)
    {
        $user = $request->user();

        if (!$user?->isService() || !$user->service) {
            return $this->error('Accès réservé au service connecté', Response::HTTP_FORBIDDEN);
        }

        return $this->success(
            $user->service->load(['etablissement', 'user']),
            'Service connecté récupéré avec succès'
        );
    }

    public function updateCurrent(Request $request)
    {
        $user = $request->user();

        if (!$user?->isService() || !$user->service) {
            return $this->error('Accès réservé au service connecté', Response::HTTP_FORBIDDEN);
        }

        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'est_actif' => 'boolean',
            'tarif_patient_simple' => 'nullable|numeric|min:0',
            'tarif_patient_assure' => 'nullable|numeric|min:0',
        ]);

        $user->service->update($data);

        return $this->success(
            $user->service->fresh(['etablissement', 'user']),
            'Paramètres du service mis à jour avec succès'
        );
    }

    public function store(Request $request)
    {
        if (!$this->canManageServices($request)) {
            return $this->error('Seuls les administrateurs et responsables d’établissement peuvent créer un service', Response::HTTP_FORBIDDEN);
        }

        $rules = [
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'description' => 'nullable|string',
            'est_actif' => 'boolean',
            'tarif_patient_simple' => 'nullable|numeric|min:0',
            'tarif_patient_assure' => 'nullable|numeric|min:0',
        ];

        if ($request->user()->isAdmin()) {
            $rules['etablissement_id'] = 'required|exists:users,id';
        }

        $data = $request->validate($rules);

        if ($request->user()->isEtablissement()) {
            $data['etablissement_id'] = $request->user()->id;
        }

        $plainPassword = $data['password'] ?? Str::password(12);
        $mailWarning = null;

        $service = DB::transaction(function () use ($data, $plainPassword) {
            $roleService = Role::where('nom', 'Service')->firstOrFail();

            $user = User::create([
                'name' => $data['nom'],
                'email' => $data['email'],
                'password' => Hash::make($plainPassword),
                'role_id' => $roleService->id,
                'etablissement_id' => $data['etablissement_id'],
                'statut' => 'actif',
                'must_change_password' => true,
                'temporary_password_expires_at' => now()->addDay(),
            ]);

            return Service::create([
                'user_id' => $user->id,
                'etablissement_id' => $data['etablissement_id'],
                'nom' => $data['nom'],
                'description' => $data['description'] ?? null,
                'est_actif' => $data['est_actif'] ?? true,
                'tarif_patient_simple' => $data['tarif_patient_simple'] ?? 5000,
                'tarif_patient_assure' => $data['tarif_patient_assure'] ?? 2500,
            ])->load(['etablissement', 'user']);
        });

        if (in_array(config('mail.default'), ['log', 'array'], true)) {
            $mailWarning = 'Service cree. Le mailer est configure en mode log/array, donc les identifiants ne sont pas envoyes dans une boite mail.';
        } else {
            try {
                Mail::to($service->user->email)->send(new CompteCreeMail($service->user, $plainPassword));
            } catch (\Throwable $mailException) {
                $mailWarning = str_contains($mailException->getMessage(), 'Username and Password not accepted')
                    ? 'Service cree, mais Gmail a refuse les identifiants SMTP. Verifiez le mot de passe d application Gmail.'
                    : 'Service cree, mais l email des identifiants n a pas pu etre envoye.';
            }
        }

        SystemNotification::create([
            'event_key' => "service:{$service->id}:created",
            'type' => 'service_created',
            'title' => 'Nouveau service cree',
            'body' => ($service->etablissement?->name ?? 'Un etablissement') . " a cree le service {$service->nom}.",
            'etablissement_id' => $service->etablissement_id,
            'meta' => [
                'service_id' => $service->id,
                'service_nom' => $service->nom,
                'created_by' => $request->user()?->id,
                'created_by_name' => $request->user()?->name,
            ],
        ]);

        return $this->success(
            ['service' => $service, 'warning' => $mailWarning],
            $mailWarning ?: 'Service cree avec succes. Les identifiants ont ete envoyes par email.',
            Response::HTTP_CREATED
        );
    }

    public function show(Request $request, $id)
    {
        $service = $this->scopeForUser($request)->find($id);

        if (!$service) {
            return $this->error('Service non trouvé', Response::HTTP_NOT_FOUND);
        }

        return $this->success($service, 'Service récupéré avec succès');
    }

    public function update(Request $request, $id)
    {
        if (!$this->canManageServices($request)) {
            return $this->error('Seuls les administrateurs et responsables d’établissement peuvent modifier un service', Response::HTTP_FORBIDDEN);
        }

        $service = $this->scopeForUser($request)->find($id);

        if (!$service) {
            return $this->error('Service non trouvé', Response::HTTP_NOT_FOUND);
        }

        if ($request->user()->isService() && (int) $request->user()->service?->id !== (int) $service->id) {
            return $this->error('Vous ne pouvez modifier que votre propre service', Response::HTTP_FORBIDDEN);
        }

        $data = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'est_actif' => 'boolean',
            'tarif_patient_simple' => 'nullable|numeric|min:0',
            'tarif_patient_assure' => 'nullable|numeric|min:0',
        ]);

        $service->update($data);

        return $this->success($service->fresh('etablissement'), 'Service mis à jour avec succès');
    }

    public function destroy(Request $request, $id)
    {
        if (!$this->canManageServices($request)) {
            return $this->error('Seuls les administrateurs et responsables d’établissement peuvent supprimer un service', Response::HTTP_FORBIDDEN);
        }

        $service = $this->scopeForUser($request)->find($id);

        if (!$service) {
            return $this->error('Service non trouvé', Response::HTTP_NOT_FOUND);
        }

        if ($service->transfertsSource()->exists() || $service->transfertsDestination()->exists()) {
            return $this->error(
                'Ce service possede un historique de transferts. Desactivez-le au lieu de le supprimer afin de conserver la tracabilite.',
                Response::HTTP_CONFLICT
            );
        }

        DB::transaction(function () use ($service) {
            $service->medecins()->update(['service_id' => null]);
            $service->consultations()->update(['service_id' => null]);
            $service->delete();
        });

        return $this->success(null, 'Service supprimé avec succès');
    }
}
