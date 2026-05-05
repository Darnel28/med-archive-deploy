<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Specialite extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description'
    ];

    /**
     * Une spécialité peut avoir plusieurs médecins
     */
    public function medecins(): HasMany
    {
        return $this->hasMany(Medecin::class);
    }
}
