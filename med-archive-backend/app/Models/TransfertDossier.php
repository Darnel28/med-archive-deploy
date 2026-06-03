<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransfertDossier extends Model
{
    use HasFactory;

    protected $fillable = [
        'dossier_id',
        'service_source_id',
        'service_destination_id',
        'etablissement_source_id',
        'etablissement_destination_id',
        'statut',
        'motif',
        'observations',
        'demandeur_id',
        'approbateur_id',
        'date_demande',
        'date_approbation',
    ];

    protected $casts = [
        'date_demande' => 'datetime',
        'date_approbation' => 'datetime',
    ];

    protected $table = 'transfert_dossiers';

    /**
     * Relations
     */
    public function dossier(): BelongsTo
    {
        return $this->belongsTo(Dossier::class);
    }

    public function serviceSource(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_source_id');
    }

    public function serviceDestination(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_destination_id');
    }

    public function etablissementSource(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etablissement_source_id');
    }

    public function etablissementDestination(): BelongsTo
    {
        return $this->belongsTo(User::class, 'etablissement_destination_id');
    }

    public function demandeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'demandeur_id');
    }

    public function approbateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approbateur_id');
    }
}
