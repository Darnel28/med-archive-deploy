<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'medecin_id',
        'service_id',
        'date_consultation',
        'motif',
        'diagnostic',
        'observations',
        'statut',
        'statut_paiement',
        'montant_consultation',
        'est_urgence'
    ];

    protected $casts = [
        'date_consultation' => 'datetime'
    ];

    /**
     * Relations
     */
    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function medecin(): BelongsTo
    {
        return $this->belongsTo(Medecin::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function constantes(): HasOne
    {
        return $this->hasOne(Constante::class);
    }

    public function ordonnance(): HasOne
    {
        return $this->hasOne(Ordonnance::class);
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(AnalyseLaboratoire::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }

    /**
     * Scope pour les consultations récentes
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('date_consultation', '>=', now()->subDays($days));
    }

    /**
     * Scope pour un médecin spécifique
     */
    public function scopeForMedecin($query, $medecinId)
    {
        return $query->where('medecin_id', $medecinId);
    }
}
