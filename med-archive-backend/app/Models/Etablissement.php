<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Etablissement extends Model
{
    use HasFactory;

    protected $table = 'etablissements';

    protected $fillable = [
        'user_id',
        'type_etablissement',
        'code_etablissement',
        'registre_commerce',
        'directeur_nom'
    ];

    /**
     * L'utilisateur (établissement) auquel appartiennent ces informations
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope pour filtrer par type d'établissement
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type_etablissement', $type);
    }
}
