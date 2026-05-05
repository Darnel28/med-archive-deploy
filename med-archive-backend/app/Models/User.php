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
        'statut'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'date_naissance' => 'date',
        'password' => 'hashed',
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

        $medecinIds = $this->medecins()->pluck('id');

        return User::whereHas('patient.consultations', function($q) use ($medecinIds) {
            $q->whereIn('medecin_id', $medecinIds);
        })->whereHas('role', fn($q) => $q->where('nom', 'Patient'))
          ->with('patient')
          ->distinct();
    }

    public function mesConsultations()
    {
        if (!$this->isEtablissement()) {
            return collect();
        }

        $medecinIds = $this->medecins()->pluck('id');

        return Consultation::whereIn('medecin_id', $medecinIds)
                          ->with(['dossier.patient.user', 'medecin.user']);
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
