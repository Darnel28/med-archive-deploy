<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Constante extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'tension_arterielle',
        'temperature',
        'poids',
        'taille',
        'frequence_cardiaque',
        'glycemie',
        'saturation_oxygene'
    ];

    protected $casts = [
        'temperature' => 'decimal:2',
        'poids' => 'decimal:2',
        'glycemie' => 'decimal:2',
        'saturation_oxygene' => 'decimal:2'
    ];

    /**
     * Relations
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    /**
     * Calcule l'IMC
     */
    public function getImcAttribute(): ?float
    {
        if ($this->poids && $this->taille && $this->taille > 0) {
            $tailleEnMetres = $this->taille / 100;
            return round($this->poids / ($tailleEnMetres * $tailleEnMetres), 2);
        }
        return null;
    }

    /**
     * Vérifie si la tension est normale
     */
    public function getTensionNormaleAttribute(): bool
    {
        if (!$this->tension_arterielle) {
            return true;
        }

        list($sys, $dia) = explode('/', $this->tension_arterielle);
        return $sys >= 90 && $sys <= 120 && $dia >= 60 && $dia <= 80;
    }
}
