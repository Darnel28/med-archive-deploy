<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ordonnance extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'medicaments',
        'posologie',
        'instructions',
        'date_validite',
        'est_executee'
    ];

    protected $casts = [
        'medicaments' => 'array',
        'date_validite' => 'date',
        'est_executee' => 'boolean'
    ];

    /**
     * Relations
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    /**
     * Vérifie si l'ordonnance est encore valide
     */
    public function getEstValideAttribute(): bool
    {
        if (!$this->date_validite) {
            return true;
        }
        return now()->lessThanOrEqualTo($this->date_validite);
    }

    /**
     * Liste des médicaments formatée
     */
    public function getListeMedicamentsAttribute(): string
    {
        if (is_array($this->getAttribute('medicaments'))) {
            return implode(', ', $this->getAttribute('medicaments'));
        }
        return (string) $this->getAttribute('medicaments');
    }
}
