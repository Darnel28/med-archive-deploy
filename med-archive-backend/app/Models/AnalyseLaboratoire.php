<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyseLaboratoire extends Model
{
    use HasFactory;

    protected $table = 'analyses_laboratoire';

    protected $fillable = [
        'consultation_id',
        'laboratoire_id',
        'prescripteur_id',
        'type_analyse',
        'resultats',
        'date_prelevement',
        'date_resultat',
        'statut',
        'commentaires',
        'fichier_resultat',
        'statut_paiement',
        'montant_analyse',
        'facture_id'
    ];

    protected $casts = [
        'resultats' => 'array',
        'date_prelevement' => 'datetime',
        'date_resultat' => 'datetime'
    ];

    /**
     * Relations
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function laboratoire(): BelongsTo
    {
        return $this->belongsTo(Laboratoire::class);
    }

    public function prescripteur(): BelongsTo
    {
        return $this->belongsTo(Medecin::class, 'prescripteur_id');
    }

    public function facture()
    {
        return $this->belongsTo(Facture::class);
    }

    /**
     * Scope pour les analyses en attente
     */
    public function scopeEnAttente($query)
    {
        return $query->whereIn('statut', ['prescrit', 'preleve']);
    }

    /**
     * Scope pour les analyses terminées
     */
    public function scopeTerminees($query)
    {
        return $query->where('statut', 'termine');
    }

    /**
     * Vérifie si l'analyse est terminée
     */
    public function getEstTermineeAttribute(): bool
    {
        return $this->statut === 'termine';
    }

    /**
     * Temps de traitement en jours
     */
    public function getTempsTraitementAttribute(): ?int
    {
        if ($this->date_prelevement && $this->date_resultat) {
            return $this->date_prelevement->diffInDays($this->date_resultat);
        }
        return null;
    }
}
