<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

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
        return $user?->isAdmin() || $user?->isEtablissement();
    }

    private function scopeForUser(Request $request)
    {
        $user = $request->user();
        $query = Service::with('etablissement');

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

        $patients = Patient::with(['user', 'dossier'])
            ->whereHas('consultations', function ($query) use ($user) {
                $query->where('service_id', $user->service->id);
            })
            ->paginate($request->get('per_page', 15));

        return $this->success($patients, 'Patients du service récupérés avec succès');
    }

    public function store(Request $request)
    {
        if (!$this->canManageServices($request)) {
            return $this->error('Seuls les administrateurs et responsables d’établissement peuvent créer un service', Response::HTTP_FORBIDDEN);
        }

        $rules = [
            'nom' => 'required|string|max:255',
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

        $service = Service::create($data)->load('etablissement');

        return $this->success($service, 'Service créé avec succès', Response::HTTP_CREATED);
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

        $service->delete();

        return $this->success(null, 'Service supprimé avec succès');
    }
}
