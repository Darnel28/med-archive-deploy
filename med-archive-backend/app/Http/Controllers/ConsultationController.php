<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Dossier;
use App\Models\Constante;
use App\Models\Ordonnance;
use App\Models\Facture;
use App\Models\AnalyseLaboratoire;
use App\Models\Laboratoire;
use App\Models\Medecin;
use App\Models\Service;
use App\Support\DossierAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    /**
     * Liste des consultations
     */
    public function index(Request $request)
    {
        $query = Consultation::with([
            'dossier.patient.user',
            'medecin.user',
            'medecin.etablissement',
            'constantes'
        ]);

        // Filtre par médecin
        if ($request->has('medecin_id')) {
            $query->where('medecin_id', $request->medecin_id);
        }

        // Filtre par patient
        if ($request->has('patient_id')) {
            $query->whereHas('dossier', function($q) use ($request) {   // fait d'abord le lien avec le dossier pour ensuite filtrer par patient_id
                $q->where('patient_id', $request->patient_id);
            });
        }

        // Filtre par période
        if ($request->has('date_debut')) {
            $query->whereDate('date_consultation', '>=', $request->date_debut);
        }
        if ($request->has('date_fin')) {
            $query->whereDate('date_consultation', '<=', $request->date_fin);
        }

        // Filtre par motif
        if ($request->has('motif')) {
            $query->where('motif', 'like', "%{$request->motif}%");
        }

        if ($request->user()->isEtablissement()) {
            $etablissementId = $request->user()->id;
            $query->where(function ($hospitalQuery) use ($etablissementId) {
                $hospitalQuery->whereHas('service', fn ($serviceQuery) => $serviceQuery->where('etablissement_id', $etablissementId))
                    ->orWhereHas('medecin', fn ($medecinQuery) => $medecinQuery->where('etablissement_id', $etablissementId));
            });
            $query->whereDoesntHave('dossier.transferts', function ($transferQuery) use ($request) {   // l'ancien hopital ne voit plus les nouvellles consultaions 
                $transferQuery->where('statut', 'accepte')
                    ->where('etablissement_source_id', $request->user()->id)
                    ->whereColumn('date_approbation', '<', 'consultations.date_consultation');
            });
        }

        if ($request->user()->isService() && $request->user()->service) {
            $serviceId = $request->user()->service->id;

            $query->where(function ($serviceQuery) use ($serviceId) {
                $serviceQuery->where('service_id', $serviceId)
                    ->orWhereHas('medecin', function ($medecinQuery) use ($serviceId) {
                        $medecinQuery->where('service_id', $serviceId);
                    });
            });

            $query->whereDoesntHave('dossier.transferts', function ($transferQuery) use ($request) {
                $transferQuery->where('statut', 'accepte')
                    ->where('service_source_id', $request->user()->service->id)
                    ->whereColumn('date_approbation', '<', 'consultations.date_consultation');
            });
        }

        $consultations = $query->orderBy('date_consultation', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $consultations
        ]);
    }

    /**
     * Créer une nouvelle consultation
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'medecin_id' => 'required|exists:medecins,id',
            'service_id' => 'nullable|exists:services,id',
            'date_consultation' => 'required|date',
            'motif' => 'required|string|max:255',
            'diagnostic' => 'nullable|string',
            'observations' => 'nullable|string',
            'statut' => 'nullable|in:en_attente,en_cours,termine,absent',

            'constantes' => 'nullable|array',
            'constantes.tension_arterielle' => 'nullable|string',
            'constantes.temperature' => 'nullable|numeric|between:35,42',
            'constantes.poids' => 'nullable|numeric|between:20,300',
            'constantes.taille' => 'nullable|integer|between:100,250',
            'constantes.frequence_cardiaque' => 'nullable|integer|between:40,200',
            'constantes.glycemie' => 'nullable|numeric|between:2,30',
            'constantes.saturation_oxygene' => 'nullable|numeric|between:70,100',

            'ordonnance' => 'nullable|array',
            'ordonnance.medicaments' => 'required_with:ordonnance|array',
            'ordonnance.posologie' => 'nullable|string',
            'ordonnance.instructions' => 'nullable|string',
            'ordonnance.date_validite' => 'nullable|date',

            'montant_consultation' => 'nullable|numeric|min:0',
            'est_urgence' => 'nullable|boolean',

            'analyses' => 'nullable|array',
            'analyses.*.laboratoire_id' => 'required_with:analyses|exists:laboratoires,id',
            'analyses.*.type_analyse' => 'required_with:analyses|string|max:255',
            'analyses.*.date_prelevement' => 'nullable|date',
            'analyses.*.commentaires' => 'nullable|string',
            'analyses.*.montant_analyse' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $currentUser = $request->user();
            $medecin = $currentUser?->isMedecin()
                ? $currentUser->medecin
                : Medecin::findOrFail($validated['medecin_id']);

            if (!$medecin) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Profil medecin introuvable.',
                ], 403);
            }

            $validated['medecin_id'] = $medecin->id;
            $validated['service_id'] = $validated['service_id'] ?? $medecin->service_id;

            // Récupérer le dossier dès le début
            // $dossier = Dossier::findOrFail($validated['dossier_id']);
            $dossier = Dossier::where(
    'patient_id',
    $validated['patient_id']
)->firstOrFail();

            if (!DossierAccess::canScheduleConsultation($request->user(), $dossier)) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Ce patient a ete transfere vers un autre service. Vous ne pouvez plus lui programmer de rendez-vous.',
                ], 403);
            }

            // Créer la consultation
            $estUrgence = $request->boolean('est_urgence', false);
            $serviceId = $validated['service_id'] ?? null;

            $consultation = Consultation::create([
                'dossier_id' => $dossier->id,
                'medecin_id' => $validated['medecin_id'],
                'service_id' => $serviceId,
                'date_consultation' => $validated['date_consultation'],
                'motif' => $validated['motif'],
                'diagnostic' => $validated['diagnostic'] ?? null,
                'observations' => $validated['observations'] ?? null,
                'statut' => $validated['statut'] ?? 'en_attente',
                'montant_consultation' => $request->input('montant_consultation'),
                'est_urgence' => $estUrgence
            ]);

            if (!$estUrgence) {
                $service = $serviceId ? Service::find($serviceId) : null;
                $montant = $request->input('montant_consultation', $service?->tarif_patient_simple ?? 5000);
                $latestId = Facture::max('id') ?? 0;
                $numero = 'FAC-' . now()->format('Ymd') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);
                Facture::create([
                    'numero' => $numero,
                    'patient_id' => $dossier->patient_id, // Maintenant $dossier existe
                    'consultation_id' => $consultation->id,
                    'type' => 'consultation',
                    'montant_total' => $montant,
                    'montant_paye' => 0,
                    'montant_restant' => $montant,
                    'statut' => 'non_payee',
                    'created_by' => $request->user()->id
                ]);

                $consultation->update(['montant_consultation' => $montant]);
            } else {
                $consultation->update(['statut_paiement' => 'payee']);
            }

            // Ajouter les constantes
            if ($request->has('constantes')) {
                Constante::create([
                    'consultation_id' => $consultation->id,
                    'tension_arterielle' => $validated['constantes']['tension_arterielle'] ?? null,
                    'temperature' => $validated['constantes']['temperature'] ?? null,
                    'poids' => $validated['constantes']['poids'] ?? null,
                    'taille' => $validated['constantes']['taille'] ?? null,
                    'frequence_cardiaque' => $validated['constantes']['frequence_cardiaque'] ?? null,
                    'glycemie' => $validated['constantes']['glycemie'] ?? null,
                    'saturation_oxygene' => $validated['constantes']['saturation_oxygene'] ?? null
                ]);
            }

            // Ajouter l'ordonnance
            if ($request->has('ordonnance')) {
                Ordonnance::create([
                    'consultation_id' => $consultation->id,
                    'medicaments' => $validated['ordonnance']['medicaments'],
                    'posologie' => $validated['ordonnance']['posologie'] ?? null,
                    'instructions' => $validated['ordonnance']['instructions'] ?? null,
                    'date_validite' => $validated['ordonnance']['date_validite'] ?? null
                ]);
            }

            foreach ($validated['analyses'] ?? [] as $analyseData) {
                $laboratoire = Laboratoire::findOrFail($analyseData['laboratoire_id']);
                $montantAnalyse = $analyseData['montant_analyse'] ?? $laboratoire->tarif_patient_simple ?? 5000;

                $analyse = AnalyseLaboratoire::create([
                    'consultation_id' => $consultation->id,
                    'laboratoire_id' => $analyseData['laboratoire_id'],
                    'type_analyse' => $analyseData['type_analyse'],
                    'date_prelevement' => $analyseData['date_prelevement'] ?? now()->toDateString(),
                    'prescripteur_id' => $validated['medecin_id'],
                    'commentaires' => $analyseData['commentaires'] ?? null,
                    'statut' => 'prescrit',
                    'montant_analyse' => $montantAnalyse,
                ]);

                $latestId = Facture::max('id') ?? 0;
                $numero = 'FAC-' . now()->format('Ymd') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);
                $facture = Facture::create([
                    'numero' => $numero,
                    'patient_id' => $dossier->patient_id,
                    'type' => 'examen',
                    'montant_total' => $montantAnalyse,
                    'montant_paye' => 0,
                    'montant_restant' => $montantAnalyse,
                    'statut' => 'non_payee',
                    'created_by' => $request->user()->id,
                ]);

                $analyse->update(['facture_id' => $facture->id]);
            }

            // Mettre à jour les stats du dossier (on réutilise $dossier)
            $dossier->update([
                'medecin_referent_id' => $dossier->medecin_referent_id ?: $medecin->id,
                'service_proprietaire_id' => $dossier->service_proprietaire_id ?: $serviceId,
                'medecin_traitant' => $dossier->medecin_traitant ?: $medecin->user?->name,
                'derniere_consultation' => $consultation->date_consultation,
            ]);
            $dossier->patient?->update(['service_id' => $serviceId]);
            $dossier->updateStatistiques();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Consultation créée avec succès',
                'data' => $consultation->load(['dossier.patient.user', 'constantes', 'ordonnance', 'analyses.facture', 'facture', 'medecin.user', 'service'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Détails d'une consultation
     */
    public function show(Request $request, $id)
    {
        $consultation = Consultation::with([
            'dossier.patient.user',
            'medecin.user',
            'medecin.etablissement',
            'constantes',
            'ordonnance',
            'documents.typeDocument',
            'analyses.laboratoire.user'
        ])->find($id);

        if (!$consultation) {
            return response()->json([
                'success' => false,
                'message' => 'Consultation non trouvée'
            ], 404);
        }

        $visible = DossierAccess::applyReadableConsultations($request->user(), $consultation->dossier, $consultation->dossier->consultations())
            ->where('consultations.id', $consultation->id)
            ->exists();

        if (!$visible) {
            return response()->json([
                'success' => false,
                'message' => 'Consultation non accessible depuis votre établissement ou service.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $consultation
        ]);
    }

    /**
     * Mettre à jour une consultation
     */
    public function update(Request $request, $id)
    {
        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json([
                'success' => false,
                'message' => 'Consultation non trouvée'
            ], 404);
        }

        $validated = $request->validate([
            'diagnostic' => 'nullable|string',
            'observations' => 'nullable|string',
            'statut' => 'nullable|in:en_attente,en_cours,termine,absent',
            'date_consultation' => 'nullable|date',
            'prochain_rdv' => 'nullable|date|after:now',
            'constantes' => 'nullable|array',
            'constantes.tension_arterielle' => 'nullable|string',
            'constantes.temperature' => 'nullable|numeric|between:35,42',
            'constantes.poids' => 'nullable|numeric|between:20,300',
            'constantes.taille' => 'nullable|integer|between:100,250',
            'constantes.frequence_cardiaque' => 'nullable|integer|between:40,200',
            'constantes.glycemie' => 'nullable|numeric|between:2,30',
            'constantes.saturation_oxygene' => 'nullable|numeric|between:70,100',
            'ordonnance' => 'nullable|array',
            'ordonnance.medicaments' => 'required_with:ordonnance|array',
            'ordonnance.posologie' => 'nullable|string',
            'ordonnance.instructions' => 'nullable|string',
            'ordonnance.date_validite' => 'nullable|date',
            'analyses' => 'nullable|array',
            'analyses.*.laboratoire_id' => 'required_with:analyses|exists:laboratoires,id',
            'analyses.*.type_analyse' => 'required_with:analyses|string|max:255',
            'analyses.*.date_prelevement' => 'nullable|date',
            'analyses.*.commentaires' => 'nullable|string',
            'analyses.*.montant_analyse' => 'nullable|numeric|min:0',
        ]);

        if (!DossierAccess::canWrite($request->user(), $consultation->dossier)) {
            return response()->json([
                'success' => false,
                'message' => 'Ce dossier a ete transfere et vous ne pouvez plus le modifier.',
            ], 403);
        }

        if ($request->user()->isPatient()) {
            $patient = $request->user()->patient;

            if (!$patient || (int) $consultation->dossier?->patient_id !== (int) $patient->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ce rendez-vous ne vous appartient pas.',
                ], 403);
            }

            $validated = $request->validate([
                'date_consultation' => 'required|date|after:now',
            ]);
        }

        if (($validated['statut'] ?? null) === 'en_cours' && $consultation->statut_paiement !== 'payee' && !$consultation->est_urgence) {
            return response()->json([
                'success' => false,
                'message' => 'Le paiement doit etre valide avant de demarrer cette consultation.',
            ], 403);
        }

        DB::transaction(function () use ($consultation, $validated, $request) {
            $consultation->update(collect($validated)->only(['diagnostic', 'observations', 'statut', 'date_consultation'])->all());

            if (array_key_exists('constantes', $validated)) {
                $consultation->constantes()->updateOrCreate(
                    ['consultation_id' => $consultation->id],
                    $validated['constantes'] ?? []
                );
            }

            if (array_key_exists('ordonnance', $validated)) {
                $consultation->ordonnance()->updateOrCreate(
                    ['consultation_id' => $consultation->id],
                    [
                        'medicaments' => $validated['ordonnance']['medicaments'],
                        'posologie' => $validated['ordonnance']['posologie'] ?? null,
                        'instructions' => $validated['ordonnance']['instructions'] ?? null,
                        'date_validite' => $validated['ordonnance']['date_validite'] ?? null,
                    ]
                );
            }

            foreach ($validated['analyses'] ?? [] as $analyseData) {
                $laboratoire = Laboratoire::findOrFail($analyseData['laboratoire_id']);
                $montantAnalyse = $analyseData['montant_analyse'] ?? $laboratoire->tarif_patient_simple ?? 5000;

                $analyse = AnalyseLaboratoire::firstOrCreate(
                    [
                        'consultation_id' => $consultation->id,
                        'laboratoire_id' => $analyseData['laboratoire_id'],
                        'type_analyse' => $analyseData['type_analyse'],
                    ],
                    [
                        'date_prelevement' => $analyseData['date_prelevement'] ?? now()->toDateString(),
                        'prescripteur_id' => $consultation->medecin_id,
                        'commentaires' => $analyseData['commentaires'] ?? null,
                        'statut' => 'prescrit',
                        'statut_paiement' => 'non_payee',
                        'montant_analyse' => $montantAnalyse,
                    ]
                );

                if (!$analyse->facture_id) {
                    $latestId = Facture::max('id') ?? 0;
                    $numero = 'FAC-' . now()->format('Ymd') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);
                    $facture = Facture::create([
                        'numero' => $numero,
                        'patient_id' => $consultation->dossier->patient_id,
                        'type' => 'examen',
                        'montant_total' => $montantAnalyse,
                        'montant_paye' => 0,
                        'montant_restant' => $montantAnalyse,
                        'statut' => 'non_payee',
                        'created_by' => $request->user()->id,
                    ]);

                    $analyse->update(['facture_id' => $facture->id]);
                }
            }

            if (!empty($validated['prochain_rdv'])) {
                $prochainRdv = Consultation::create([
                    'dossier_id' => $consultation->dossier_id,
                    'medecin_id' => $consultation->medecin_id,
                    'service_id' => $consultation->service_id,
                    'date_consultation' => $validated['prochain_rdv'],
                    'motif' => 'Rendez-vous de suivi : ' . ($consultation->motif ?: 'consultation médicale'),
                    'statut' => 'en_attente',
                    'est_urgence' => false,
                ]);

                $service = $consultation->service_id ? Service::find($consultation->service_id) : null;
                $montant = $service?->tarif_patient_simple ?? 5000;
                $latestId = Facture::max('id') ?? 0;
                $numero = 'FAC-' . now()->format('Ymd') . '-' . str_pad($latestId + 1, 4, '0', STR_PAD_LEFT);

                Facture::create([
                    'numero' => $numero,
                    'patient_id' => $consultation->dossier->patient_id,
                    'consultation_id' => $prochainRdv->id,
                    'type' => 'consultation',
                    'montant_total' => $montant,
                    'montant_paye' => 0,
                    'montant_restant' => $montant,
                    'statut' => 'non_payee',
                    'created_by' => $request->user()->id,
                ]);

                $prochainRdv->update(['montant_consultation' => $montant]);
            }

            $consultation->dossier?->updateStatistiques();
        });

        return response()->json([
            'success' => true,
            'message' => 'Consultation mise à jour avec succès',
            'data' => $consultation->fresh(['constantes', 'ordonnance', 'analyses.facture'])
        ]);
    }

    /**
     * Ajouter des constantes à une consultation
     */
    public function ajouterConstantes(Request $request, $id)
    {
        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json([
                'success' => false,
                'message' => 'Consultation non trouvée'
            ], 404);
        }

        $validated = $request->validate([
            'tension_arterielle' => 'nullable|string',
            'temperature' => 'nullable|numeric|between:35,42',
            'poids' => 'nullable|numeric|between:20,300',
            'taille' => 'nullable|integer|between:100,250',
            'frequence_cardiaque' => 'nullable|integer|between:40,200',
            'glycemie' => 'nullable|numeric|between:2,30',
            'saturation_oxygene' => 'nullable|numeric|between:70,100'
        ]);

        $constantes = $consultation->constantes()
            ->updateOrCreate(
                ['consultation_id' => $consultation->id],
                $validated
            );

        return response()->json([
            'success' => true,
            'message' => 'Constantes ajoutées avec succès',
            'data' => $constantes
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $consultation = Consultation::with(['dossier', 'facture'])->find($id);

        if (!$consultation) {
            return response()->json([
                'success' => false,
                'message' => 'Consultation non trouvee'
            ], 404);
        }

        $user = $request->user();

        if (!$user->isAdmin() && (!$user->isMedecin() || (int) $consultation->medecin_id !== (int) $user->medecin?->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez supprimer que vos propres rendez-vous.'
            ], 403);
        }

        if (($consultation->statut && $consultation->statut !== 'en_attente') || $consultation->statut_paiement === 'payee') {
            return response()->json([
                'success' => false,
                'message' => 'Ce rendez-vous ne peut plus etre supprime.'
            ], 422);
        }

        if ($consultation->facture && $consultation->facture->statut !== 'non_payee') {
            return response()->json([
                'success' => false,
                'message' => 'Ce rendez-vous a deja un paiement associe et ne peut plus etre supprime.'
            ], 422);
        }

        DB::transaction(function () use ($consultation) {
            $consultation->facture()
                ->where('statut', 'non_payee')
                ->delete();

            $consultation->delete();
            $consultation->dossier?->updateStatistiques();
        });

        return response()->json([
            'success' => true,
            'message' => 'Rendez-vous supprime avec succes'
        ]);
    }

    /**
     * Statistiques des consultations
     */
    public function statistiques(Request $request)
    {
        $debut = $request->get('debut', now()->startOfMonth());
        $fin = $request->get('fin', now()->endOfMonth());

        $query = Consultation::whereBetween('date_consultation', [$debut, $fin]);

        return response()->json([
            'success' => true,
            'data' => [
                'periode' => [
                    'debut' => $debut,
                    'fin' => $fin
                ],
                'total' => $query->count(),
                'par_medecin' => $query->select('medecin_id', DB::raw('count(*) as total'))
                    ->with('medecin.user')
                    ->groupBy('medecin_id')
                    ->get()
                    ->map(function($item) {
                        return [
                            'medecin' => $item->medecin->user->name,
                            'total' => $item->total
                        ];
                    }),
                'par_motif' => $query->select('motif', DB::raw('count(*) as total'))
                    ->groupBy('motif')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get(),
                'evolution' => $query->select(
                        DB::raw('DATE(date_consultation) as date'),
                        DB::raw('count(*) as total')
                    )
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
            ]
        ]);
    }
}
