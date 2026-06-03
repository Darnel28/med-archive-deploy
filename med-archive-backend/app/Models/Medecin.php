<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Medecin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'etablissement_id',
        'service_id',
        'specialite_id',
        'numero_professionnel',
        'diplome',
        'annees_experience'
    ];

    protected $casts = [
        'annees_experience' => 'integer'
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

    public function specialite(): BelongsTo
    {
        return $this->belongsTo(Specialite::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function analysesPrescrites(): HasMany
    {
        return $this->hasMany(AnalyseLaboratoire::class, 'prescripteur_id');
    }

    /**
     * Récupère tous les patients de ce médecin
     */
    public function patients()
    {
        return User::whereHas('patient.consultations', function($q) {
            $q->where('medecin_id', $this->id);
        })->whereHas('role', fn($q) => $q->where('nom', 'Patient'))
          ->distinct();
    }

    /**
     * Statistiques du médecin
     */
    public function statistiques()
    {
        return [
            'total_consultations' => $this->consultations()->count(),
            'total_patients' => $this->patients()->count(),
            'consultations_ce_mois' => $this->consultations()
                ->whereMonth('date_consultation', now()->month)
                ->count(),
        ];
    }
}
