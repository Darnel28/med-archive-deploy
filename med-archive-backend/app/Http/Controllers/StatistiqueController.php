<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Patient;
use App\Models\Medecin;
use App\Models\Service;
use App\Models\SystemNotification;
use App\Models\Consultation;
use App\Models\AnalyseLaboratoire;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatistiqueController extends Controller
{
    /**
     * Dashboard principal
     */
    public function dashboard(Request $request)
    {
        $user = $request->user();

        // Statistiques globales pour l'admin
        if ($user->isAdmin()) {
            return $this->dashboardAdmin();
        }

        // Statistiques pour l'établissement
        if ($user->isEtablissement()) {
            return $this->dashboardEtablissement($user);
        }

        // Statistiques pour le médecin
        if ($user->isMedecin()) {
            return $this->dashboardMedecin($user);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Tableau de bord patient en construction'
            ]
        ]);
    }

    /**
     * Dashboard administrateur
     */
    private function dashboardAdmin()
    {
        $now = now();
        $debutMois = $now->copy()->startOfMonth();
        $finMois = $now->copy()->endOfMonth();

        return response()->json([
            'success' => true,
            'data' => [
                'utilisateurs' => [
                    'total' => User::count(),
                    'nouveaux_mois' => User::whereBetween('created_at', [$debutMois, $finMois])->count(),
                    'repartition_par_role' => User::select('role_id', DB::raw('count(*) as total'))
                        ->with('role')
                        ->groupBy('role_id')
                        ->get()
                        ->map(function($item) {
                            return [
                                'role' => $item->role->nom,
                                'total' => $item->total
                            ];
                        })
                ],
                'patients' => [
                    'total' => Patient::count(),
                    'avec_dossier' => Patient::has('dossier')->count(),
                    'repartition_groupe_sanguin' => Patient::select('groupe_sanguin', DB::raw('count(*) as total'))
                        ->whereNotNull('groupe_sanguin')
                        ->groupBy('groupe_sanguin')
                        ->get()
                ],
                'consultations' => [
                    'total' => Consultation::count(),
                    'mois' => Consultation::whereBetween('date_consultation', [$debutMois, $finMois])->count(),
                    'aujourdhui' => Consultation::whereDate('date_consultation', today())->count()
                ],
                'analyses' => [
                    'total' => AnalyseLaboratoire::count(),
                    'en_attente' => AnalyseLaboratoire::whereIn('statut', ['prescrit', 'preleve', 'en_cours'])->count(),
                    'terminees_mois' => AnalyseLaboratoire::where('statut', 'termine')
                        ->whereBetween('date_resultat', [$debutMois, $finMois])
                        ->count()
                ],
                'documents' => [
                    'total' => Document::count(),
                    'taille_totale' => round(Document::sum('taille') / 1024, 2) . ' Mo' // Conversion en Mo
                ]
            ]
        ]);
    }

    /**
     * Dashboard établissement
     */
    private function dashboardEtablissement($user)
    {
        $medecinIds = $user->medecins()->pluck('id');

        $debutMois = now()->startOfMonth();
        $finMois = now()->endOfMonth();

        $consultations = Consultation::whereIn('medecin_id', $medecinIds);

        return response()->json([
            'success' => true,
            'data' => [
                'medecins' => [
                    'total' => $user->medecins()->count(),
                    'actifs' => $user->medecins()
                        ->whereHas('medecin.consultations', function($q) {
                            $q->whereDate('date_consultation', today());
                        })
                        ->count()
                ],
                'patients' => [
                    'total' => $user->mesPatients()->count(),
                    'nouveaux_mois' => $user->mesPatients()
                        ->whereBetween('created_at', [$debutMois, $finMois])
                        ->count()
                ],
                'consultations' => [
                    'total' => (clone $consultations)->count(),
                    'mois' => (clone $consultations)->whereBetween('date_consultation', [$debutMois, $finMois])->count(),
                    'aujourdhui' => (clone $consultations)->whereDate('date_consultation', today())->count(),
                    'par_motif' => (clone $consultations)->select('motif', DB::raw('count(*) as total'))
                        ->whereNotNull('motif')
                        ->groupBy('motif')
                        ->orderBy('total', 'desc')
                        ->limit(5)
                        ->get()
                ],
                'analyses' => [
                    'en_attente' => AnalyseLaboratoire::whereIn('prescripteur_id', $medecinIds)
                        ->whereIn('statut', ['prescrit', 'preleve', 'en_cours'])
                        ->count()
                ]
            ]
        ]);
    }

    /**
     * Dashboard médecin
     */
    private function dashboardMedecin($user)
    {
        $medecin = $user->medecin;

        if (!$medecin) {
            return response()->json([
                'success' => false,
                'message' => 'Profil médecin incomplet'
            ], 404);
        }

        $debutMois = now()->startOfMonth();
        $finMois = now()->endOfMonth();

        $consultations = Consultation::where('medecin_id', $medecin->id);

        return response()->json([
            'success' => true,
            'data' => [
                'patients' => [
                    'total' => $medecin->patients()->count(),
                    'vus_mois' => $medecin->consultations()
                        ->whereBetween('date_consultation', [$debutMois, $finMois])
                        ->distinct('dossier_id')
                        ->count('dossier_id')
                ],
                'consultations' => [
                    'total' => (clone $consultations)->count(),
                    'mois' => (clone $consultations)->whereBetween('date_consultation', [$debutMois, $finMois])->count(),
                    'aujourdhui' => (clone $consultations)->whereDate('date_consultation', today())->count(),
                    'prochaines' => (clone $consultations)->whereDate('date_consultation', '>', today())
                        ->with(['dossier.patient.user'])
                        ->orderBy('date_consultation')
                        ->limit(5)
                        ->get()
                ],
                'analyses' => [
                    'prescrites' => $medecin->analysesPrescrites()->count(),
                    'en_attente' => $medecin->analysesPrescrites()
                        ->whereIn('statut', ['prescrit', 'preleve', 'en_cours'])
                        ->count()
                ]
            ]
        ]);
    }

    /**
     * Statistiques avancées
     */
    public function avancees(Request $request)
    {
        $debut = $request->get('debut', now()->subMonths(6));
        $fin = $request->get('fin', now());

        return response()->json([
            'success' => true,
            'data' => [
                'evolution_consultations' => Consultation::select(
                        DB::raw('DATE_TRUNC(\'month\', date_consultation) as mois'),
                        DB::raw('count(*) as total')
                    )
                    ->whereBetween('date_consultation', [$debut, $fin])
                    ->groupBy('mois')
                    ->orderBy('mois')
                    ->get(),
                'top_motifs' => Consultation::select('motif', DB::raw('count(*) as total'))
                    ->whereBetween('date_consultation', [$debut, $fin])
                    ->whereNotNull('motif')
                    ->groupBy('motif')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->get(),
                'taux_analyse' => [
                    'consultations_avec_analyse' => Consultation::whereHas('analyses')
                        ->whereBetween('date_consultation', [$debut, $fin])
                        ->count(),
                    'total_consultations' => Consultation::whereBetween('date_consultation', [$debut, $fin])->count(),
                ],
                'activite_etablissements' => User::whereHas('role', function($q) {
                        $q->where('nom', 'Responsable Etablissement');
                    })
                    ->withCount(['medecins', 'mesPatients as patients_count'])
                    ->get()
                    ->map(function($etablissement) {
                        return [
                            'nom' => $etablissement->name,
                            'medecins' => $etablissement->medecins_count,
                            'patients' => $etablissement->patients_count ?? 0
                        ];
                    })
            ]
        ]);
    }

    public function rapportsAdmin(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Acces reserve aux administrateurs',
            ], 403);
        }

        $weekStart = now()->startOfWeek();
        $platformTypes = [
            'service_created',
            'etablissement_created',
            'etablissement_updated',
            'etablissement_disabled',
            'user_created',
            'user_activated',
            'user_disabled',
            'role_updated',
            'laboratoire_disabled',
            'security_alert',
            'admin_login_failed',
            'system_critical',
            'database_unavailable',
        ];
        $securityTypes = ['security_alert', 'admin_login_failed', 'system_critical', 'database_unavailable'];
        $securityJournalTypes = array_merge(['login_success'], $securityTypes);

        $roles = User::select('role_id', DB::raw('count(*) as total'))
            ->with('role')
            ->groupBy('role_id')
            ->get()
            ->map(fn ($item) => [
                'role' => $item->role?->nom ?? 'Non renseigne',
                'total' => (int) $item->total,
            ])
            ->values();

        $hospitals = User::whereHas('role', fn ($q) => $q->where('nom', 'Responsable Etablissement'))
            ->latest('updated_at')
            ->limit(8)
            ->get()
            ->map(function ($hospital) {
                $lastServiceActivity = Service::where('etablissement_id', $hospital->id)->max('updated_at');
                $lastUserActivity = User::where('etablissement_id', $hospital->id)->max('updated_at');
                $lastActivity = collect([$hospital->updated_at, $lastServiceActivity, $lastUserActivity])
                    ->filter()
                    ->max();

                return [
                    'id' => $hospital->id,
                    'nom' => $hospital->name,
                    'statut' => $hospital->statut === 'actif' ? 'En ligne' : 'Hors ligne',
                    'utilisateurs' => User::where('etablissement_id', $hospital->id)->count(),
                    'derniere_activite' => $lastActivity,
                ];
            })
            ->values();

        $adminActivities = SystemNotification::whereIn('type', $platformTypes)
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'date' => $notification->created_at,
                'administrateur' => $notification->meta['admin_name'] ?? $notification->meta['created_by_name'] ?? 'Systeme',
                'action' => $notification->title,
                'details' => $notification->body,
                'type' => $notification->type,
            ])
            ->values();

        $hospitalActions = SystemNotification::whereIn('type', ['service_created', 'etablissement_created', 'etablissement_updated', 'etablissement_disabled'])
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'date' => $notification->created_at,
                'action' => $notification->title,
                'etablissement' => $notification->body,
                'realise_par' => $notification->meta['created_by_name'] ?? 'Systeme',
            ])
            ->values();

        $securityJournal = SystemNotification::whereIn('type', $securityJournalTypes)
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'date' => $notification->created_at,
                'evenement' => $notification->title,
                'utilisateur' => $notification->meta['user_name'] ?? 'Systeme',
                'resultat' => $notification->type === 'login_success' ? 'Succes' : ($notification->type === 'admin_login_failed' ? 'Echec' : 'Securite'),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'date' => now(),
                'kpis' => [
                    'utilisateurs_crees' => User::count(),
                    'utilisateurs_crees_semaine' => User::where('created_at', '>=', $weekStart)->count(),
                    'hopitaux_connectes' => User::whereHas('role', fn ($q) => $q->where('nom', 'Responsable Etablissement'))->count(),
                    'connexions_aujourdhui' => SystemNotification::where('type', 'login_success')->whereDate('created_at', today())->count(),
                    'alertes_securite' => SystemNotification::whereIn('type', $securityTypes)->whereNull('read_at')->count(),
                ],
                'activites_administratives' => $adminActivities,
                'etablissements' => $hospitals,
                'activite_utilisateurs' => $roles,
                'journal_securite' => $securityJournal,
                'gestion_hopitaux' => $hospitalActions,
                'alertes_systeme' => SystemNotification::whereIn('type', $securityTypes)
                    ->whereNull('read_at')
                    ->latest('created_at')
                    ->limit(6)
                    ->get(['id', 'title', 'body', 'type', 'created_at']),
            ],
        ]);
    }
}
