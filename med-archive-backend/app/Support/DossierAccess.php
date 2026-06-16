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
                return (int) $dossier->medecin_referent_id === (int) $user->medecin->id;
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

        if ($user->isMedecin()) {
            return (int) $acceptedTransfer->medecin_referent_destination_id === (int) $user->medecin?->id;
        }

        return false;
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

        return false;
    }

    public static function applyReadableConsultations(User $user, Dossier $dossier, $query)
    {
        if ($user->isAdmin() || $user->isPatient()) {
            return $query;
        }

        $acceptedTransfer = self::latestAcceptedTransfer($dossier);

        if (!$acceptedTransfer?->date_approbation) {
            return $query;
        }

        if ($user->isEtablissement()) {
            if ((int) $acceptedTransfer->etablissement_destination_id === (int) $user->id) {
                return $query;
            }

            if ((int) $acceptedTransfer->etablissement_source_id === (int) $user->id) {
                return $query->where('date_consultation', '<=', $acceptedTransfer->date_approbation);
            }
        }

        if ($user->isService() && $user->service) {
            if ((int) $acceptedTransfer->service_destination_id === (int) $user->service->id) {
                return $query;
            }

            if ((int) $acceptedTransfer->service_source_id === (int) $user->service->id) {
                return $query->where('date_consultation', '<=', $acceptedTransfer->date_approbation);
            }
        }

        if ($user->isMedecin() && (int) $acceptedTransfer->medecin_referent_destination_id === (int) $user->medecin?->id) {
            return $query;
        }

        return $query->where('date_consultation', '<=', $acceptedTransfer->date_approbation);
    }
}
