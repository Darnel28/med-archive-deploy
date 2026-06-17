<?php

namespace App\Http\Controllers;

use App\Models\Medecin;
use App\Models\Service;
use App\Models\TransfertDossier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TransfertDossierController extends Controller
{
    private function success($data = null, string $message = 'OK', int $status = Response::HTTP_OK)
    {
        return response()->json(['success' => true, 'data' => $data, 'message' => $message], $status);
    }

    private function error(string $message, int $status, $data = null)
    {
        return response()->json(['success' => false, 'data' => $data, 'message' => $message], $status);
    }

    private function canReadTransfers(Request $request): bool
    {
        $user = $request->user();
        return $user?->isAdmin() || $user?->isEtablissement() || $user?->isMedecin() || $user?->isService();
    }

    private function canRequestTransfer(Request $request): bool
    {
        return $this->canReadTransfers($request);
    }

    private function canApproveTransfer(Request $request, TransfertDossier $transfert): bool
    {
        $user = $request->user();

        if ($user?->isAdmin()) {
            return true;
        }

        if ($user?->isEtablissement() && (int) $transfert->etablissement_destination_id === (int) $user->id) {
            return true;
        }

        return $user?->isService()
            && $user->service
            && (int) $transfert->service_destination_id === (int) $user->service->id;
    }

    private function canManageSentTransfer(Request $request, TransfertDossier $transfert): bool
    {
        $user = $request->user();

        if ($user?->isAdmin()) {
            return true;
        }

        if ($transfert->statut !== 'demande') {
            return false;
        }

        if ($user?->isEtablissement()) {
            return (int) $transfert->etablissement_source_id === (int) $user->id;
        }

        if ($user?->isService() && $user->service) {
            return (int) $transfert->service_source_id === (int) $user->service->id;
        }

        return $user?->isMedecin() && (int) $transfert->demandeur_id === (int) $user->id;
    }

    private function scopeForUser(Request $request)
    {
        $user = $request->user();
        $query = TransfertDossier::with([
            'dossier.patient.user',
            'serviceSource',
            'serviceDestination',
            'medecinReferentDestination.user',
            'etablissementSource',
            'etablissementDestination',
            'demandeur',
            'approbateur',
        ]);

        if ($user?->isAdmin()) {
            return $query;
        }

        if ($user?->isEtablissement()) {
            return $query->where(function ($q) use ($user) {
                $q->where('etablissement_source_id', $user->id)
                    ->orWhere('etablissement_destination_id', $user->id);
            });
        }

        if ($user?->isMedecin()) {
            return $query->where(function ($q) use ($user) {
                $q->where('demandeur_id', $user->id)
                    ->orWhere('medecin_referent_destination_id', $user->medecin?->id);
            });
        }

        if ($user?->isService() && $user->service) {
            return $query->where(function ($q) use ($user) {
                $q->where('service_source_id', $user->service->id)
                    ->orWhere('service_destination_id', $user->service->id);
            });
        }

        return $query->whereRaw('1 = 0');
    }

    public function index(Request $request)
    {
        if (!$this->canReadTransfers($request)) {
            return $this->error('Acces refuse', Response::HTTP_FORBIDDEN);
        }

        $transferts = $this->scopeForUser($request)
            ->latest('date_demande')
            ->paginate($request->get('per_page', 25));

        return $this->success($transferts, 'Transferts recuperes avec succes');
    }

    public function store(Request $request)
    {
        if (!$this->canRequestTransfer($request)) {
            return $this->error('Acces refuse', Response::HTTP_FORBIDDEN);
        }

        $data = $request->validate([
            'dossier_id' => 'required|exists:dossiers,id',
            'service_source_id' => 'required|exists:services,id',
            'service_destination_id' => 'required|exists:services,id',
            'medecin_referent_destination_id' => 'nullable|exists:medecins,id',
            'etablissement_source_id' => 'required|exists:users,id',
            'etablissement_destination_id' => 'required|exists:users,id',
            'medecin_traitant_id' => 'nullable|exists:medecins,id',
            'motif' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        if (empty($data['medecin_referent_destination_id']) && !empty($data['medecin_traitant_id'])) {
            $data['medecin_referent_destination_id'] = $data['medecin_traitant_id'];
        }
        unset($data['medecin_traitant_id']);

        $source = User::with('role')->find($data['etablissement_source_id']);
        $destination = User::with('role')->find($data['etablissement_destination_id']);
        $serviceSource = Service::find($data['service_source_id']);
        $serviceDestination = Service::find($data['service_destination_id']);
        $user = $request->user();

        if (!$user?->isAdmin()) {
            $sourceEtablissementId = $user?->isEtablissement()
                ? $user->id
                : ($user?->isService() ? $user->service?->etablissement_id : $user?->medecin?->etablissement_id);

            if ((int) $data['etablissement_source_id'] !== (int) $sourceEtablissementId) {
                return $this->error('Vous ne pouvez creer une demande que depuis votre etablissement', Response::HTTP_FORBIDDEN);
            }

            if ($user?->isService() && (int) $data['service_source_id'] !== (int) $user->service?->id) {
                return $this->error('Vous ne pouvez creer une demande que depuis votre service', Response::HTTP_FORBIDDEN);
            }
        }

        if (!$source?->isEtablissement() || !$destination?->isEtablissement()) {
            return $this->error('Les etablissements de depart et accueil doivent etre des hopitaux valides', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ((int) $serviceSource->etablissement_id !== (int) $source->id) {
            return $this->error('Le service de depart ne correspond pas a hopital de depart', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ((int) $serviceDestination->etablissement_id !== (int) $destination->id) {
            return $this->error('Le service demande doit appartenir a hopital accueil', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!empty($data['medecin_referent_destination_id'])) {
            $medecinValide = Medecin::where('id', $data['medecin_referent_destination_id'])
                ->where('service_id', $data['service_destination_id'])
                ->where('etablissement_id', $data['etablissement_destination_id'])
                ->exists();

            if (!$medecinValide) {
                return $this->error('Le medecin referent doit appartenir au service destinataire', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $data['demandeur_id'] = $request->user()->id;
        $data['date_demande'] = now();
        $data['statut'] = 'demande';

        $transfert = TransfertDossier::create($data)->load([
            'dossier.patient.user',
            'serviceSource',
            'serviceDestination',
            'medecinReferentDestination.user',
            'etablissementSource',
            'etablissementDestination',
            'demandeur',
        ]);

        return $this->success($transfert, 'Demande de transfert creee avec succes', Response::HTTP_CREATED);
    }

    public function show(Request $request, $id)
    {
        $transfert = $this->scopeForUser($request)->find($id);

        if (!$transfert) {
            return $this->error('Transfert non trouve', Response::HTTP_NOT_FOUND);
        }

        return $this->success($transfert, 'Transfert recupere avec succes');
    }

    public function update(Request $request, $id)
    {
        $transfert = $this->scopeForUser($request)->find($id);

        if (!$transfert) {
            return $this->error('Transfert non trouve', Response::HTTP_NOT_FOUND);
        }

        $data = $request->validate([
            'dossier_id' => 'sometimes|exists:dossiers,id',
            'service_destination_id' => 'sometimes|exists:services,id',
            'etablissement_destination_id' => 'sometimes|exists:users,id',
            'medecin_referent_destination_id' => 'nullable|exists:medecins,id',
            'statut' => 'sometimes|in:demande,accepte,refuse',
            'motif' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        $nextStatus = $data['statut'] ?? $transfert->statut;
        $statusChanged = $nextStatus !== $transfert->statut;

        if ($statusChanged) {
            if (!$this->canApproveTransfer($request, $transfert)) {
                return $this->error('Seul le service destinataire peut valider ce transfert', Response::HTTP_FORBIDDEN);
            }

            $data['approbateur_id'] = $request->user()->id;
            $data['date_approbation'] = in_array($nextStatus, ['accepte', 'refuse'], true) ? now() : null;
        } elseif (!$this->canManageSentTransfer($request, $transfert)) {
            return $this->error('Vous ne pouvez modifier que les demandes envoyees par votre service et encore en attente', Response::HTTP_FORBIDDEN);
        }

        if (!empty($data['medecin_referent_destination_id'])) {
            $destinationServiceId = $data['service_destination_id'] ?? $transfert->service_destination_id;
            $medecinValide = Medecin::where('id', $data['medecin_referent_destination_id'])
                ->where('service_id', $destinationServiceId)
                ->exists();

            if (!$medecinValide) {
                return $this->error('Le medecin referent doit appartenir au service destinataire', Response::HTTP_UNPROCESSABLE_ENTITY);
            }
        }

        $transfert->update($data);
        $transfert->refresh();

        if ($nextStatus === 'accepte') {
            $referent = $transfert->medecinReferentDestination()->with('user')->first();
            $transfert->dossier?->update([
                'statut' => 'transfere',
                'statut_transfert' => 'accepte',
                'service_proprietaire_id' => $transfert->service_destination_id,
                'medecin_referent_id' => $transfert->medecin_referent_destination_id,
                'medecin_traitant' => $referent?->user?->name,
            ]);
            $transfert->dossier?->patient?->update(['service_id' => $transfert->service_destination_id]);
        } elseif ($nextStatus === 'refuse') {
            $transfert->dossier?->update(['statut_transfert' => 'refuse']);
        }

        return $this->success(
            $transfert->fresh(['dossier.patient.user', 'serviceSource', 'serviceDestination', 'medecinReferentDestination.user', 'demandeur', 'approbateur']),
            'Transfert mis a jour avec succes'
        );
    }

    public function destroy(Request $request, $id)
    {
        $transfert = $this->scopeForUser($request)->find($id);

        if (!$transfert) {
            return $this->error('Transfert non trouve', Response::HTTP_NOT_FOUND);
        }

        if (!$this->canManageSentTransfer($request, $transfert)) {
            return $this->error('Vous ne pouvez supprimer que les demandes envoyees par votre service et encore en attente', Response::HTTP_FORBIDDEN);
        }

        $transfert->delete();

        return $this->success(null, 'Transfert supprime avec succes');
    }
}
