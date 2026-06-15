<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Laboratoire extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'etablissement_id',
        'nom_laboratoire',
        'agrement',
        'specialites_analyse',
        'est_actif',
        'tarif_patient_simple',
        'tarif_patient_assure'
    ];

    protected $casts = [
        'specialites_analyse' => 'array',
        'est_actif' => 'boolean',
        'tarif_patient_simple' => 'decimal:2',
        'tarif_patient_assure' => 'decimal:2'
    ];

    /**
     * Relations
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etablissement_id');
    }

    public function analyses(): HasMany
    {
        return $this->hasMany(AnalyseLaboratoire::class);
    }

    /**
     * Analyses en attente
     */
    public function analysesEnAttente()
    {
        return $this->analyses()->whereIn('statut', ['prescrit', 'preleve']);
    }

    /**
     * Statistiques du laboratoire
     */
    public function statistiques()
    {
        return [
            'total_analyses' => $this->analyses()->count(),
            'analyses_en_attente' => $this->analysesEnAttente()->count(),
            'analyses_terminees' => $this->analyses()->where('statut', 'termine')->count(),
        ];
    }
}
