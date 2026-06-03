<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description'
    ];

    /**
     * Un rôle peut être attribué à plusieurs utilisateurs
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Vérifie si le rôle est un administrateur
     */
    public function isAdmin(): bool
    {
        return in_array($this->nom, ['Super Admin', 'Admin Regional', 'Administrateur'], true);
    }

    /**
     * Vérifie si le rôle est un médecin
     */
    public function isMedecin(): bool
    {
        return $this->nom === 'Medecin';
    }

    /**
     * Vérifie si le rôle est un patient
     */
    public function isPatient(): bool
    {
        return $this->nom === 'Patient';
    }

    /**
     * Vérifie si le rôle est un établissement
     */
    public function isEtablissement(): bool
    {
        return $this->nom === 'Responsable Etablissement';
    }

    /**
     * Vérifie si le rôle est un laborantin
     */
    public function isLaborantin(): bool
    {
        return $this->nom === 'Laborantin';
    }
}
