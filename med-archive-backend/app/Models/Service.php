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
        'etablissement_id',
        'nom',
        'description',
        'est_actif',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
    ];

    /**
     * Relations
     */
    public function etablissement(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etablissement_id');
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
