<?php

namespace App\Http\Controllers;

use App\Models\AnalyseLaboratoire;
use App\Models\Consultation;
use App\Models\Laboratoire;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyseController extends Controller
{
    /**
     * Liste des analyses
     */
    public function index(Request $request)
    {
        $query = AnalyseLaboratoire::with([
            'consultation.dossier.patient.user',
            'laboratoire.user',
            'prescripteur.user',
            'facture'
        ]);

        if ($request->user()->isMedecin()) {
            $query->where('prescripteur_id', $request->user()->medecin?->id);
        } elseif ($request->user()->isLaborantin()) {
            $query->where('laboratoire_id', $request->user()->laboratoire?->id);
        } elseif ($request->has('prescripteur_id')) {
            $query->where('prescripteur_id', $request->prescripteur_id);
        }

        if ($request->filled('statut_paiement')) {
            $query->where('statut_paiement', $request->statut_paiement);
        }

        // Filtre par statut
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par laboratoire
        if ($request->has('laboratoire_id')) {
            $query->where('laboratoire_id', $request->laboratoire_id);
        }

        // Filtre par patient
        if ($request->has('patient_id')) {
            $query->whereHas('consultation.dossier', function($q) use ($request) {
                $q->where('patient_id', $request->patient_id);
            });
        }

        // Filtre par période
        if ($request->has('date_debut')) {
            $query->whereDate('date_prelevement', '>=', $request->date_debut);
        }
        if ($request->has('date_fin')) {
            $query->whereDate('date_prelevement', '<=', $request->date_fin);
        }

        $analyses = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $analyses
        ]);
    }

    /**
     * Créer une nouvelle analyse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'consultation_id' => 'required|exists:consultations,id',
            'laboratoire_id' => 'required|exists:laboratoires,id',
            'type_analyse' => 'required|string|max:255',
            'date_prelevement' => 'required|date',
            'prescripteur_id' => 'required|exists:medecins,id',
            'commentaires' => 'nullable|string',
            'montant_analyse' => 'nullable|numeric|min:0'
        ]);

        if ($request->user()->isMedecin()) {
            $validated['prescripteur_id'] = $request->user()->medecin?->id;
        }

        $laboratoire = Laboratoire::findOrFail($validated['laboratoire_id']);
        $montant = $validated['montant_analyse'] ?? $laboratoire->tarif_patient_simple ?? 10000;

        $analyse = AnalyseLaboratoire::create([
            'consultation_id' => $validated['consultation_id'],
            'laboratoire_id' => $validated['laboratoire_id'],
            'type_analyse' => $validated['type_analyse'],
            'date_prelevement' => $validated['date_prelevement'],
            'prescripteur_id' => $validated['prescripteur_id'],
            'commentaires' => $validated['commentaires'] ?? null,
            'statut' => 'prescrit',
            'montant_analyse' => $montant
        ]);

        $latestId = Facture::max('id') ?? 0;
        $numero = 'FAC-' . now()->format('Ymd') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);
        $facture = Facture::create([
            'numero' => $numero,
            'patient_id' => $analyse->consultation->dossier->patient_id,
            'type' => 'examen',
            'montant_total' => $montant,
            'montant_paye' => 0,
            'montant_restant' => $montant,
            'statut' => 'non_payee',
            'created_by' => $request->user()->id
        ]);
        $analyse->facture_id = $facture->id;
        $analyse->save();

        return response()->json([
            'success' => true,
            'message' => 'Analyse créée avec succès',
            'data' => $analyse->load(['consultation.dossier.patient.user', 'laboratoire.user'])
        ], 201);
    }

    /**
     * Détails d'une analyse
     */
    public function show($id)
    {
        $analyse = AnalyseLaboratoire::with([
            'consultation.dossier.patient.user',
            'laboratoire.user',
            'prescripteur.user'
        ])->find($id);

        if (!$analyse) {
            return response()->json([
                'success' => false,
                'message' => 'Analyse non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $analyse
        ]);
    }

    /**
     * Mettre à jour le statut d'une analyse
     */
    public function updateStatut(Request $request, $id)
    {
        $analyse = AnalyseLaboratoire::find($id);

        if (!$analyse) {
            return response()->json([
                'success' => false,
                'message' => 'Analyse non trouvée'
            ], 404);
        }

        $validated = $request->validate([
            'statut' => 'required|in:prescrit,preleve,en_cours,termine'
        ]);

        $data = ['statut' => $validated['statut']];

        // Vérifier que l'analyse est payée avant de passer à "en_cours" ou "termine"
        if (in_array($validated['statut'], ['en_cours', 'termine']) && $analyse->statut_paiement !== 'payee') {
            return response()->json(['success' => false, 'message' => 'Analyse non payée.'], 403);
        }

        // Si le statut passe à "termine", ajouter la date du résultat
        if ($validated['statut'] === 'termine' && !$analyse->date_resultat) {
            $data['date_resultat'] = now();
        }

        $analyse->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $analyse
        ]);
    }

    /**
     * Ajouter les résultats d'une analyse
     */
    public function ajouterResultats(Request $request, $id)
    {
        $analyse = AnalyseLaboratoire::find($id);

        if (!$analyse) {
            return response()->json([
                'success' => false,
                'message' => 'Analyse non trouvée'
            ], 404);
        }

        if ($analyse->statut_paiement !== 'payee') {
            return response()->json([
                'success' => false,
                'message' => 'Analyse non payee.',
            ], 403);
        }

        $validated = $request->validate([
            'resultats' => 'required|array',
            'resultats.valeur' => 'required|numeric',
            'resultats.unite' => 'required|string',
            'resultats.normale' => 'required|boolean',
            'resultats.commentaire' => 'nullable|string',
            'fichier_resultat' => 'nullable|file|mimes:pdf|max:5120' // 5MB max
        ]);

        $data = [
            'resultats' => $validated['resultats'],
            'statut' => 'termine',
            'date_resultat' => now()
        ];

        // Gérer l'upload du fichier
        if ($request->hasFile('fichier_resultat')) {
            $path = $request->file('fichier_resultat')->store('analyses', 'public');
            $data['fichier_resultat'] = $path;
        }

        $analyse->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Résultats ajoutés avec succès',
            'data' => $analyse
        ]);
    }

    /**
     * Statistiques des analyses
     */
    public function statistiques(Request $request)
    {
        $debut = $request->get('debut', now()->startOfMonth());
        $fin = $request->get('fin', now()->endOfMonth());

        $query = AnalyseLaboratoire::whereBetween('created_at', [$debut, $fin]);

        return response()->json([
            'success' => true,
            'data' => [
                'periode' => [
                    'debut' => $debut,
                    'fin' => $fin
                ],
                'total' => $query->count(),
                'par_statut' => $query->select('statut', DB::raw('count(*) as total'))
                    ->groupBy('statut')
                    ->get(),
                'par_type' => $query->select('type_analyse', DB::raw('count(*) as total'))
                    ->groupBy('type_analyse')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get(),
                'temps_moyen_traitement' => $query->whereNotNull('date_resultat')
                    ->select(DB::raw('AVG(EXTRACT(DAY FROM (date_resultat - date_prelevement))) as jours_moyens'))
                    ->first()
                    ->jours_moyens ?? 0
            ]
        ]);
    }
}
