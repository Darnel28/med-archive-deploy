<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description'
    ];

    /**
     * Un type de document peut être attribué à plusieurs documents
     */
    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }
}
