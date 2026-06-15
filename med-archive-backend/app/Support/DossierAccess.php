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
            return (int) $acceptedTransfer->etablissement_destination_id === (int) $user->medecin?->etablissement_id;
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

        if ($user->isMedecin() && (int) $acceptedTransfer->etablissement_destination_id === (int) $user->medecin?->etablissement_id) {
            return $query;
        }

        return $query->where('date_consultation', '<=', $acceptedTransfer->date_approbation);
    }
}
