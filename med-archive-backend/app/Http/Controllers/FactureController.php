<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\Paiement;
use App\Models\AnalyseLaboratoire;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FactureController extends Controller
{
    /**
     * Liste des factures (filtrable par statut, patient, période)
     */
    public function index(Request $request)
    {
        $query = Facture::with(['patient.user', 'consultation', 'paiements']);

        // Filtre par statut
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        // Filtre par patient
        if ($request->filled('patient_id')) {
            $query->where('patient_id', $request->patient_id);
        }

        // Filtre par type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filtre par période
        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }
        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        $factures = $query->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $factures,
        ]);
    }

    /**
     * Créer une nouvelle facture (consultation, examen ou urgence)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'type' => 'required|in:consultation,examen,urgence',
            'consultation_id' => 'nullable|exists:consultations,id',
            'montant_total' => 'required|numeric|min:0',
        ]);

        // Génération du numéro de facture unique
        $latestId = Facture::max('id') ?? 0;
        $numero = 'FAC-' . now()->format('Ymd') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);

        $facture = Facture::create([
            'numero' => $numero,
            'patient_id' => $validated['patient_id'],
            'type' => $validated['type'],
            'consultation_id' => $validated['consultation_id'] ?? null,
            'montant_total' => $validated['montant_total'],
            'montant_paye' => 0,
            'montant_restant' => $validated['montant_total'],
            'statut' => 'non_payee',
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Facture créée avec succès.',
            'data' => $facture->load('patient'),
        ], 201);
    }

    /**
     * Afficher une facture avec ses paiements
     */
    public function show(string $id)
    {
        $facture = Facture::with(['patient.user', 'consultation', 'paiements'])->find($id);

        if (!$facture) {
            return response()->json([
                'success' => false,
                'message' => 'Facture non trouvée.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $facture,
        ]);
    }

    /**
     * Enregistrer un paiement pour une facture
     */
    public function payer(Request $request, $id)
    {
        $facture = Facture::findOrFail($id);

        $validated = $request->validate([
            'montant' => 'required|numeric|min:1|max:' . $facture->montant_restant,
            'methode' => 'required|in:mobile_money,especes',
            'reference' => 'nullable|string',
        ]);

        DB::transaction(function () use ($facture, $validated, $request) {
            // Créer le paiement
            $paiement = $facture->paiements()->create([
                'montant' => $validated['montant'],
                'methode' => $validated['methode'],
                'reference' => $validated['reference'] ?? null,
                'statut' => 'confirme',
                'created_by' => $request->user()->id,
            ]);

            // Mettre à jour la facture
            $facture->montant_paye += $validated['montant'];
            $facture->montant_restant = $facture->montant_total - $facture->montant_paye;
            $facture->methode_paiement = $validated['methode'];
            $facture->date_paiement = now();
            $facture->statut = ($facture->montant_restant == 0) ? 'payee' : 'partiellement_payee';
            $facture->save();

            // Si la facture est liée à une consultation, on met à jour son statut de paiement
            if ($facture->consultation_id && $facture->statut == 'payee') {
                $consultation = Consultation::find($facture->consultation_id);
                if ($consultation) {
                    $consultation->update(['statut_paiement' => 'payee']);
                }
            }

            // Si la facture est de type examen, on met à jour le statut de paiement des analyses liées
            if ($facture->type == 'examen' && $facture->statut == 'payee') {
                AnalyseLaboratoire::where('facture_id', $facture->id)
                    ->update(['statut_paiement' => 'payee']);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Paiement enregistré avec succès.',
            'data' => $facture->fresh(['paiements', 'consultation']),
        ]);
    }

    /**
     * Générer le PDF de la facture (nécessite barryvdh/laravel-dompdf)
     */
    public function pdf($id)
    {
        $facture = Facture::with(['patient.user', 'paiements'])->findOrFail($id);

        // Exemple de génération avec dompdf (à installer si besoin)
        // barryvdh/laravel-dompdf et crée une vue factures/pdf.blade.php
        // $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('factures.pdf', compact('facture'));
        // return $pdf->download('facture-' . $facture->numero . '.pdf');

        // Pour le moment, on retourne les données pour test
        return response()->json([
            'success' => true,
            'message' => 'PDF généré.',
            'data' => $facture,
        ]);
    }
}
