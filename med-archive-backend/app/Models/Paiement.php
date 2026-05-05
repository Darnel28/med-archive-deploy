<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    protected $fillable = [
        'facture_id',
        'montant',
        'methode',
        'reference',
        'statut',
        'created_by'
    ];

    public function facture(): BelongsTo {
        return $this->belongsTo(Facture::class);
    }
    public function creePar(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }
}
