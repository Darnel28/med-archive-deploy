<?php

namespace App\Http\Controllers;

use App\Models\AnalyseLaboratoire;
use App\Models\Consultation;
use App\Models\SystemNotification;
use App\Models\TransfertDossier;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SystemNotificationController extends Controller
{
    private array $adminTypes = [
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
        'login_success',
        'system_critical',
        'database_unavailable',
    ];

    private function scopedQuery(Request $request)
    {
        $user = $request->user();
        $query = SystemNotification::query();

        // Chat messages have their own endpoints and must never appear as system alerts.
        $query->where('type', '!=', 'chat_message');

        if ($user?->isAdmin()) {
            return $query->whereIn('type', $this->adminTypes);
        }

        $query->whereNotIn('type', $this->adminTypes);

        if ($user?->isService() && $user->service) {
            return $query->where(function ($q) use ($user) {
                $q->where('service_id', $user->service->id)
                    ->orWhere('user_id', $user->id);
            });
        }

        if ($user?->isMedecin() && $user->medecin) {
            return $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('service_id', $user->medecin->service_id);
            });
        }

        if ($user?->isEtablissement()) {
            return $query->where('etablissement_id', $user->id);
        }

        return $query->where('user_id', $user?->id);
    }

    private function createOnce(array $data): void
    {
        SystemNotification::firstOrCreate(
            ['event_key' => $data['event_key']],
            $data
        );
    }

    private function syncEvents(Request $request): void
    {
        $user = $request->user();

        if ($user?->isAdmin()) {
            return;
        }

        $transferQuery = TransfertDossier::with(['dossier.patient.user', 'serviceSource', 'serviceDestination']);
        if ($user?->isService() && $user->service) {
            $transferQuery->where(function ($q) use ($user) {
                $q->where('service_source_id', $user->service->id)
                    ->orWhere('service_destination_id', $user->service->id);
            });
        } elseif ($user?->isEtablissement()) {
            $transferQuery->where(function ($q) use ($user) {
                $q->where('etablissement_source_id', $user->id)
                    ->orWhere('etablissement_destination_id', $user->id);
            });
        }

        $transferQuery->latest('updated_at')->limit(50)->get()->each(function ($transfert) {
            $patientName = $transfert->dossier?->patient?->user?->name ?? 'Patient';
            $isPending = $transfert->statut === 'demande';
            $this->createOnce([
                'event_key' => "transfer:{$transfert->id}:{$transfert->statut}",
                'type' => $isPending ? 'transfert_demande' : "transfert_{$transfert->statut}",
                'title' => $isPending ? 'Nouvelle demande de transfert recue' : 'Transfert ' . $transfert->statut,
                'body' => "{$patientName} - {$transfert->serviceSource?->nom} vers {$transfert->serviceDestination?->nom}",
                'service_id' => $isPending ? $transfert->service_destination_id : $transfert->service_source_id,
                'etablissement_id' => $isPending ? $transfert->etablissement_destination_id : $transfert->etablissement_source_id,
                'meta' => ['transfert_id' => $transfert->id, 'dossier_id' => $transfert->dossier_id],
                'created_at' => $transfert->updated_at ?? $transfert->date_demande,
                'updated_at' => $transfert->updated_at ?? $transfert->date_demande,
            ]);
        });

        $consultationQuery = Consultation::with(['dossier.patient.user', 'medecin.user']);
        if ($user?->isService() && $user->service) {
            $consultationQuery->where('service_id', $user->service->id);
        } elseif ($user?->isMedecin() && $user->medecin) {
            $consultationQuery->where('medecin_id', $user->medecin->id);
        } elseif ($user?->isPatient()) {
            $consultationQuery->whereHas('dossier.patient', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $consultationQuery->latest('updated_at')->limit(50)->get()->each(function ($consultation) {
            $patientName = $consultation->dossier?->patient?->user?->name ?? 'Patient';
            $this->createOnce([
                'event_key' => "consultation:{$consultation->id}:{$consultation->statut}",
                'type' => $consultation->statut === 'annulee' ? 'consultation_annulee' : 'consultation_programmee',
                'title' => $consultation->statut === 'annulee' ? 'Consultation annulee' : 'Consultation programmee',
                'body' => "{$patientName} avec " . ($consultation->medecin?->user?->name ?? 'medecin non renseigne'),
                'user_id' => $consultation->dossier?->patient?->user_id,
                'service_id' => $consultation->service_id,
                'meta' => ['consultation_id' => $consultation->id, 'dossier_id' => $consultation->dossier_id],
                'created_at' => $consultation->updated_at,
                'updated_at' => $consultation->updated_at,
            ]);
        });

        $analyseQuery = AnalyseLaboratoire::with(['consultation.dossier.patient.user']);
        if ($user?->isService() && $user->service) {
            $analyseQuery->whereHas('consultation', function ($q) use ($user) {
                $q->where('service_id', $user->service->id);
            });
        } elseif ($user?->isPatient()) {
            $analyseQuery->whereHas('consultation.dossier.patient', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $analyseQuery->latest('updated_at')
            ->limit(50)
            ->get()
            ->each(function ($analyse) {
                $patientName = $analyse->consultation?->dossier?->patient?->user?->name ?? 'Patient';
                $this->createOnce([
                    'event_key' => "analyse:{$analyse->id}:{$analyse->statut}",
                    'type' => $analyse->statut === 'termine' ? 'resultat_examen' : 'demande_examen',
                    'title' => $analyse->statut === 'termine' ? 'Resultat examen disponible' : 'Demande examen creee',
                    'body' => "{$patientName} - {$analyse->type_analyse}",
                    'user_id' => $analyse->consultation?->dossier?->patient?->user_id,
                    'service_id' => $analyse->consultation?->service_id,
                    'meta' => ['analyse_id' => $analyse->id, 'consultation_id' => $analyse->consultation_id],
                    'created_at' => $analyse->updated_at,
                    'updated_at' => $analyse->updated_at,
                ]);
            });
    }

    public function index(Request $request)
    {
        $this->syncEvents($request);

        $query = $this->scopedQuery($request);
        if ($request->boolean('unread')) {
            $query->whereNull('read_at');
        }

        $notifications = $query->latest('created_at')->paginate($request->get('per_page', 25));

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $this->scopedQuery($request)->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $notification = $this->scopedQuery($request)->find($id);
        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification introuvable'], Response::HTTP_NOT_FOUND);
        }

        $notification->update(['read_at' => now()]);

        return response()->json(['success' => true, 'data' => $notification]);
    }

    public function markAllRead(Request $request)
    {
        $this->scopedQuery($request)->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}
