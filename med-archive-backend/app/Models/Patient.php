<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'npi',
        'imu',
        'groupe_sanguin',
        'allergies',
        'antecedents_medicaux',
        'personne_contact',
        'telephone_contact',
        'profession',
        'nationalite',
        'lieu_naissance'
    ];

    /**
     * Génère un IMU unique
     */
    public static function generateIMU(): string
    {
        $prefix = 'IMU';
        $year = date('Y');
        $lastPatient = self::latest('id')->first();
        $nextNumber = $lastPatient ? intval(substr($lastPatient->imu, -7)) + 1 : 1;
        $sequence = str_pad($nextNumber, 7, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}-{$sequence}";
    }

    /**
     * Relations
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dossier(): HasOne
    {
        return $this->hasOne(Dossier::class);
    }

    public function factures()
    {
        return $this->hasMany(Facture::class);
    }

    public function consultations()
    {
        return $this->hasManyThrough(
            Consultation::class,
            Dossier::class,
            'patient_id',
            'dossier_id',
            'id',
            'id'
        );
    }

    /**
     * Récupère tous les médecins qui ont consulté ce patient
     */
    public function medecins()
    {
        return User::whereHas('medecin.consultations', function($q) {
            $q->whereIn('consultations.id', $this->consultations()->pluck('id'));
        })->distinct();
    }

    /**
     * Âge du patient
     */
    public function getAgeAttribute(): ?int
    {
        if ($this->user->date_naissance) {
            return $this->user->date_naissance->age;
        }
        return null;
    }
}
