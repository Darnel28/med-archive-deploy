<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facture extends Model
{
    protected $fillable = [
        'numero',
        'patient_id',
        'consultation_id',
        'type',
        'montant_total',
        'montant_paye',
        'montant_restant',
        'statut',
        'methode_paiement',
        'date_paiement',
        'created_by'
    ];

    public function patient(): BelongsTo {
        return $this->belongsTo(Patient::class);
    }
    public function consultation(): BelongsTo {
        return $this->belongsTo(Consultation::class);
    }
    public function paiements(): HasMany {
        return $this->hasMany(Paiement::class);
    }
    public function creePar(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }
}
