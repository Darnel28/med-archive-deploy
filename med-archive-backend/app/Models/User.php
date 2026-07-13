<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'telephone',
        'adresse',
        'ville',
        'date_naissance',
        'sexe',
        'role_id',
        'etablissement_id',
        'statut',
        'must_change_password',
        'temporary_password_expires_at'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_naissance' => 'date',
        'password' => 'hashed',
        'must_change_password' => 'boolean',
        'temporary_password_expires_at' => 'datetime',
    ];

    /**
     * Relations de base
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Si cet user est un médecin, l'établissement où il travaille
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etablissement_id');
    }

    /**
     * Si cet user est un établissement, tous les médecins qui y travaillent
     */
    public function medecins()
    {
        return $this->hasMany(User::class, 'etablissement_id')
                    ->whereHas('role', fn($q) => $q->where('nom', 'Medecin'));
    }

    /**
     * Si cet user est un établissement, tous les laborantins qui y travaillent
     */
    public function laborantins()
    {
        return $this->hasMany(User::class, 'etablissement_id')
                    ->whereHas('role', fn($q) => $q->where('nom', 'Laborantin'));
    }

    /**
     * Informations spécifiques selon le rôle
     */
    public function informationEtablissement(): HasOne
    {
        return $this->hasOne(Etablissement::class);
    }

    public function medecin(): HasOne
    {
        return $this->hasOne(Medecin::class);
    }

    public function patient(): HasOne
    {
        return $this->hasOne(Patient::class);
    }

    public function service(): HasOne
    {
        return $this->hasOne(Service::class);
    }

    public function laboratoire(): HasOne
    {
        return $this->hasOne(Laboratoire::class);
    }

    /**
     * Vérifications de rôle
     */
    public function isAdmin(): bool
    {
        return $this->role?->isAdmin() ?? false;
    }

    public function isMedecin(): bool
    {
        return $this->role?->isMedecin() ?? false;
    }

    public function isPatient(): bool
    {
        return $this->role?->isPatient() ?? false;
    }

    public function isService(): bool
    {
        return $this->role?->isService() ?? false;
    }

    public function isEtablissement(): bool
    {
        return $this->role?->isEtablissement() ?? false;
    }

    public function isLaborantin(): bool
    {
        return $this->role?->isLaborantin() ?? false;
    }

    /**
     * Méthodes pour les établissements
     */
    public function mesPatients()
    {
        if (!$this->isEtablissement()) {
            return collect();
        }

        $medecinIds = Medecin::where('etablissement_id', $this->id)->pluck('id');
        $etablissementId = $this->id;

        return User::whereHas('patient')
          ->where(function ($query) use ($medecinIds, $etablissementId) {
               $query->where('etablissement_id', $etablissementId)
               ->orWhereHas('patient.consultations', function($q) use ($medecinIds) {
                   $q->whereIn('medecin_id', $medecinIds);
               })
               ->orWhereHas('patient.service', fn($q) => $q->where('etablissement_id', $etablissementId))
               ->orWhereHas('patient.dossier.serviceProprietaire', fn($q) => $q->where('etablissement_id', $etablissementId))
               ->orWhereHas('patient.dossier.transferts', function ($q) use ($etablissementId) {
                   $q->where('statut', 'accepte')
                     ->where(function ($transferQuery) use ($etablissementId) {
                         $transferQuery->where('etablissement_source_id', $etablissementId)
                             ->orWhere('etablissement_destination_id', $etablissementId);
                     });
               });
           })
          ->with('patient')
          ->distinct();
    }

    public function mesConsultations()
    {
        if (!$this->isEtablissement()) {
            return collect();
        }

        $medecinIds = $this->medecins()->pluck('id');

        return Consultation::where(function ($query) use ($medecinIds) {
                $query->whereIn('medecin_id', $medecinIds)
                    ->orWhereHas('service', fn ($serviceQuery) => $serviceQuery->where('etablissement_id', $this->id));
            })
            ->with(['dossier.patient.user', 'medecin.user', 'service']);
    }

    public function statistiquesEtablissement()
    {
        if (!$this->isEtablissement()) {
            return null;
        }

        return [
            'total_medecins' => $this->medecins()->count(),
            'total_patients' => $this->mesPatients()->count(),
            'total_consultations' => $this->mesConsultations()->count(),
            'consultations_aujourd_hui' => $this->mesConsultations()
                ->whereDate('date_consultation', today())
                ->count(),
        ];
    }
}
