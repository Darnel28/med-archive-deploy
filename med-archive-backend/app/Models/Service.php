<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'etablissement_id',
        'nom',
        'description',
        'est_actif',
        'tarif_patient_simple',
        'tarif_patient_assure',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
        'tarif_patient_simple' => 'decimal:2',
        'tarif_patient_assure' => 'decimal:2',
    ];

    /**
     * Relations
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etablissement_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function medecins(): HasMany
    {
        return $this->hasMany(Medecin::class);
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function transfertsSource(): HasMany
    {
        return $this->hasMany(TransfertDossier::class, 'service_source_id');
    }

    public function transfertsDestination(): HasMany
    {
        return $this->hasMany(TransfertDossier::class, 'service_destination_id');
    }
}
