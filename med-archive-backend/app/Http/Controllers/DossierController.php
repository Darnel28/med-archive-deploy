<?php

namespace App\Http\Controllers;

use App\Models\Dossier;
use App\Models\User;
use App\Support\DossierAccess;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DossierController extends Controller
{
    /**
     * Liste des dossiers
     */
    public function index(Request $request)
    {
        $query = Dossier::with(['patient.user']);

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par médecin traitant
        if ($request->has('medecin')) {
            $query->where('medecin_traitant', 'like', "%{$request->medecin}%");
        }

        // Recherche par numéro de dossier ou IMU
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('numero_dossier', 'like', "%{$search}%")
                  ->orWhere('imu', 'like', "%{$search}%")
                  ->orWhereHas('patient.user', function($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Dossiers actifs récents
        if ($request->has('recent')) {
            $query->where('derniere_consultation', '>=', now()->subDays(30));
        }

        $dossiers = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $dossiers
        ]);
    }

    /**
     * Détails d'un dossier
     */
    public function show(Request $request, $id)
    {
        $dossier = Dossier::with('patient.user')->find($id);

        if (!$dossier) {
            return response()->json([
                'success' => false,
                'message' => 'Dossier non trouvé'
            ], 404);
        }

        $consultations = DossierAccess::applyReadableConsultations($request->user(), $dossier, $dossier->consultations())
            ->with(['medecin.user', 'medecin.etablissement', 'service', 'constantes', 'ordonnance', 'analyses.laboratoire.user', 'documents.typeDocument'])
            ->latest('date_consultation')
            ->get();

        $visibleConsultationIds = $consultations->pluck('id');

        $dossier->setRelation('consultations', $consultations);
        $dossier->setRelation('documents', $dossier->documents()
            ->whereIn('consultations.id', $visibleConsultationIds)
            ->with('typeDocument')
            ->latest('documents.created_at')
            ->get());
        $dossier->setRelation('analyses', $dossier->analyses()
            ->whereIn('consultations.id', $visibleConsultationIds)
            ->with(['laboratoire.user', 'prescripteur.user'])
            ->latest('date_prelevement')
            ->get());

        return response()->json([
            'success' => true,
            'data' => $dossier
        ]);
    }

    /**
     * Mettre à jour un dossier
     */
    public function update(Request $request, $id)
    {
        $dossier = Dossier::find($id);

        if (!$dossier) {
            return response()->json([
                'success' => false,
                'message' => 'Dossier non trouvé'
            ], 404);
        }

        $validated = $request->validate([
            'statut' => 'sometimes|in:actif,archive,transfere',
            'medecin_traitant' => 'nullable|string|max:255',
            'diagnostics_principaux' => 'nullable|string',
            'traitements_en_cours' => 'nullable|string',
            'allergies_importantes' => 'nullable|string',
            'notes_importantes' => 'nullable|string'
        ]);

        $dossier->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Dossier mis à jour avec succès',
            'data' => $dossier->fresh('patient.user')
        ]);
    }

    /**
     * Archiver un dossier
     */
    public function archiver($id)
    {
        $dossier = Dossier::find($id);

        if (!$dossier) {
            return response()->json([
                'success' => false,
                'message' => 'Dossier non trouvé'
            ], 404);
        }

        $dossier->update([
            'statut' => 'archive',
            'date_fermeture' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dossier archivé avec succès'
        ]);
    }

    /**
     * Résumé du dossier
     */
    public function resume(Request $request, $id)
    {
        $dossier = Dossier::with('patient.user')->find($id);

        if (!$dossier) {
            return response()->json([
                'success' => false,
                'message' => 'Dossier non trouvé'
            ], 404);
        }

        $dernieresConsultations = DossierAccess::applyReadableConsultations($request->user(), $dossier, $dossier->consultations())
            ->select('id', 'dossier_id', 'date_consultation', 'motif', 'diagnostic')
            ->latest('date_consultation')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'dossier' => [
                    'numero' => $dossier->numero_dossier,
                    'imu' => $dossier->imu,
                    'statut' => $dossier->statut,
                    'date_ouverture' => $dossier->date_ouverture,
                ],
                'patient' => [
                    'nom' => $dossier->patient->user->name,
                    'age' => $dossier->patient->age,
                    'sexe' => $dossier->patient->user->sexe,
                ],
                'statistiques' => [
                    'total_consultations' => $dossier->total_consultations,
                    'total_documents' => $dossier->total_documents,
                    'derniere_consultation' => $dossier->derniere_consultation,
                ],
                'dernieres_consultations' => $dernieresConsultations
            ]
        ]);
    }

    /**
     * Transférer un dossier vers un autre établissement
     */
    public function transferer(Request $request, $id)
    {
        $dossier = Dossier::find($id);
        if (!$dossier) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Dossier non trouvé',
            ], Response::HTTP_NOT_FOUND);
        }

        $validated = $request->validate([
            'etablissement_destination_id' => 'required|exists:users,id',
            'motif_transfert' => 'required|string'
        ]);
        $etablissementDestination = User::with('informationEtablissement')
            ->find($validated['etablissement_destination_id']);

        if (!$etablissementDestination?->isEtablissement() || !$etablissementDestination->informationEtablissement) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'L’établissement destinataire est invalide',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $dossier->update([
            'etablissement_destination_id' => $etablissementDestination->informationEtablissement->id,
            'statut_transfert' => 'demande',
            'notes_importantes' => ($dossier->notes_importantes ?? '') . " [Transfert demandé le " . now()->format('d/m/Y') . " : {$request->motif_transfert}]"
        ]);
        return response()->json([
            'success' => true, 'message' => 'Demande envoyée'
        ]);
    }
}
