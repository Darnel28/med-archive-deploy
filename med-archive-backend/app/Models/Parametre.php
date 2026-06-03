<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parametre extends Model
{
    use HasFactory;

    protected $fillable = [
        'cle',
        'valeur',
        'description',
        'type',
    ];

    protected $table = 'parametres';

    /**
     * Obtenir la valeur convertie selon le type
     */
    public function getValeurTypee()
    {
        return match ($this->type) {
            'integer' => (int) $this->valeur,
            'boolean' => $this->valeur === '1' || $this->valeur === true,
            'json' => json_decode($this->valeur, true),
            default => $this->valeur,
        };
    }

    /**
     * Récupérer un paramètre par clé
     */
    public static function getByKey($cle, $default = null)
    {
        $param = self::where('cle', $cle)->first();
        return $param ? $param->getValeurTypee() : $default;
    }
}
