<?php

namespace App\Support;

use App\Models\Dossier;
use App\Models\User;

class DossierAccess
{
    public static function latestAcceptedTransfer(Dossier $dossier)
    {
        return $dossier->transferts()
            ->where('statut', 'accepte')
            ->latest('date_approbation')
            ->first();
    }

    public static function canWrite(User $user, Dossier $dossier): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($dossier->service_proprietaire_id) {
            if ($user->isService() && $user->service) {
                return (int) $dossier->service_proprietaire_id === (int) $user->service->id;
            }

            if ($user->isMedecin() && $user->medecin) {
                return (int) $dossier->medecin_referent_id === (int) $user->medecin->id
                    || $dossier->consultations()->where('medecin_id', $user->medecin->id)->exists();
            }
        }

        $acceptedTransfer = self::latestAcceptedTransfer($dossier);

        if (!$acceptedTransfer) {
            return true;
        }

        if ($user->isEtablissement()) {
            return (int) $acceptedTransfer->etablissement_destination_id === (int) $user->id;
        }

        if ($user->isService() && $user->service) {
            return (int) $acceptedTransfer->service_destination_id === (int) $user->service->id;
        }

        return false;
    }

    public static function canScheduleConsultation(User $user, Dossier $dossier): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if (!$user->isMedecin() || !$user->medecin) {
            return self::canWrite($user, $dossier);
        }

        if ($dossier->service_proprietaire_id && $user->medecin->service_id) {
            return (int) $dossier->service_proprietaire_id === (int) $user->medecin->service_id;
        }

        if ((int) $dossier->medecin_referent_id === (int) $user->medecin->id) {
            return true;
        }

        $acceptedTransfer = self::latestAcceptedTransfer($dossier);

        return !$acceptedTransfer;
    }

    public static function canRead(User $user, Dossier $dossier): bool
    {
        if ($user->isAdmin() || $user->isPatient()) {
            return true;
        }

        if (self::canWrite($user, $dossier)) {
            return true;
        }

        if ($user->isService() && $user->service) {
            return $dossier->transferts()
                ->where(function ($query) use ($user) {
                    $query->where('service_source_id', $user->service->id)
                        ->orWhere('service_destination_id', $user->service->id);
                })
                ->exists()
                || $dossier->consultations()->where('service_id', $user->service->id)->exists();
        }

        if ($user->isMedecin() && $user->medecin) {
            return $dossier->consultations()->where('medecin_id', $user->medecin->id)->exists()
                || (int) $dossier->medecin_referent_id === (int) $user->medecin->id;
        }

        if ($user->isEtablissement()) {
            return $dossier->transferts()
                ->where('statut', 'accepte')
                ->where(fn ($query) => $query->where('etablissement_source_id', $user->id)->orWhere('etablissement_destination_id', $user->id))
                ->exists()
                || $dossier->consultations()->whereHas('service', fn ($query) => $query->where('etablissement_id', $user->id))->exists()
                || $dossier->consultations()->whereHas('medecin', fn ($query) => $query->where('etablissement_id', $user->id))->exists();
        }

        return false;
    }

    public static function applyReadableConsultations(User $user, Dossier $dossier, $query)
    {
        if ($user->isAdmin() || $user->isPatient()) {
            return $query;
        }

        if ($user->isEtablissement()) {
            return $query->where(function ($hospitalQuery) use ($user) {
                $hospitalQuery->whereHas('service', fn ($serviceQuery) => $serviceQuery->where('etablissement_id', $user->id))
                    ->orWhereHas('medecin', fn ($medecinQuery) => $medecinQuery->where('etablissement_id', $user->id));
            });
        }

        if ($user->isService() && $user->service) {
            $hasLeftService = $dossier->transferts()->where('statut', 'accepte')
                ->where('service_source_id', $user->service->id)->exists();
            return $hasLeftService ? $query->where('service_id', $user->service->id) : $query;
        }

        if ($user->isMedecin() && (int) $dossier->medecin_referent_id === (int) $user->medecin?->id) {
            return $query;
        }

        $acceptedTransfer = self::latestAcceptedTransfer($dossier);
        return $acceptedTransfer?->date_approbation
            ? $query->where('date_consultation', '<=', $acceptedTransfer->date_approbation)
            : $query;
    }
}
