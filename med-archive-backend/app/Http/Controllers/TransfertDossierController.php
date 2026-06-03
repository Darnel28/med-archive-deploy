<?php

namespace App\Http\Controllers;

use App\Models\TransfertDossier;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TransfertDossierController extends Controller
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

    private function canReadTransfers(Request $request): bool
    {
        $user = $request->user();
        return $user?->isAdmin() || $user?->isEtablissement() || $user?->isMedecin();
    }

    private function canRequestTransfer(Request $request): bool
    {
        $user = $request->user();
        return $user?->isAdmin() || $user?->isEtablissement() || $user?->isMedecin();
    }

    private function canApproveTransfer(Request $request, TransfertDossier $transfert): bool
    {
        $user = $request->user();

        if ($user?->isAdmin()) {
            return true;
        }

        return $user?->isEtablissement() && (int) $transfert->etablissement_destination_id === (int) $user->id;
    }

    private function scopeForUser(Request $request)
    {
        $user = $request->user();
        $query = TransfertDossier::with([
            'dossier.patient.user',
            'serviceSource',
            'serviceDestination',
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
            return $query->where('demandeur_id', $user->id);
        }

        return $query->whereRaw('1 = 0');
    }

    public function index(Request $request)
    {
        if (!$this->canReadTransfers($request)) {
            return $this->error('Accès refusé', Response::HTTP_FORBIDDEN);
        }

        $transferts = $this->scopeForUser($request)
            ->latest('date_demande')
            ->paginate($request->get('per_page', 25));

        return $this->success($transferts, 'Transferts récupérés avec succès');
    }

    public function store(Request $request)
    {
        if (!$this->canRequestTransfer($request)) {
            return $this->error('Accès refusé', Response::HTTP_FORBIDDEN);
        }

        $data = $request->validate([
            'dossier_id' => 'required|exists:dossiers,id',
            'service_source_id' => 'required|exists:services,id',
            'service_destination_id' => 'required|exists:services,id',
            'etablissement_source_id' => 'required|exists:users,id',
            'etablissement_destination_id' => 'required|exists:users,id',
            'motif' => 'nullable|string',
            'observations' => 'nullable|string',
        ]);

        $data['demandeur_id'] = $request->user()->id;
        $data['date_demande'] = now();
        $data['statut'] = 'demande';

        $transfert = TransfertDossier::create($data)->load([
            'dossier.patient.user',
            'serviceSource',
            'serviceDestination',
            'etablissementSource',
            'etablissementDestination',
            'demandeur',
        ]);

        return $this->success($transfert, 'Demande de transfert créée avec succès', Response::HTTP_CREATED);
    }

    public function show(Request $request, $id)
    {
        $transfert = $this->scopeForUser($request)->find($id);

        if (!$transfert) {
            return $this->error('Transfert non trouvé', Response::HTTP_NOT_FOUND);
        }

        return $this->success($transfert, 'Transfert récupéré avec succès');
    }

    public function update(Request $request, $id)
    {
        $transfert = $this->scopeForUser($request)->find($id);

        if (!$transfert) {
            return $this->error('Transfert non trouvé', Response::HTTP_NOT_FOUND);
        }

        if (!$this->canApproveTransfer($request, $transfert)) {
            return $this->error('Seul l’administrateur ou l’établissement destinataire peut valider ce transfert', Response::HTTP_FORBIDDEN);
        }

        $data = $request->validate([
            'statut' => 'required|in:demande,accepte,refuse',
            'observations' => 'nullable|string',
        ]);

        if ($data['statut'] !== $transfert->statut) {
            $data['approbateur_id'] = $request->user()->id;
            $data['date_approbation'] = in_array($data['statut'], ['accepte', 'refuse'], true) ? now() : null;
        }

        $transfert->update($data);

        return $this->success(
            $transfert->fresh(['dossier.patient.user', 'serviceSource', 'serviceDestination', 'demandeur', 'approbateur']),
            'Transfert mis à jour avec succès'
        );
    }

    public function destroy(Request $request, $id)
    {
        if (!$request->user()?->isAdmin()) {
            return $this->error('Seuls les administrateurs peuvent supprimer un transfert', Response::HTTP_FORBIDDEN);
        }

        $transfert = TransfertDossier::find($id);

        if (!$transfert) {
            return $this->error('Transfert non trouvé', Response::HTTP_NOT_FOUND);
        }

        $transfert->delete();

        return $this->success(null, 'Transfert supprimé avec succès');
    }
}
