<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'type_document_id',
        'titre',
        'chemin_fichier',
        'mime_type',
        'taille',
        'description'
    ];

    /**
     * Relations
     */
    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function typeDocument(): BelongsTo
    {
        return $this->belongsTo(TypeDocument::class);
    }

    /**
     * Formatte la taille du fichier
     */
    public function getTailleFormateeAttribute(): string
    {
        $bytes = $this->taille * 1024; // On stocke en Ko

        $units = ['octets', 'Ko', 'Mo', 'Go'];
        $i = 0;

        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Extension du fichier
     */
    public function getExtensionAttribute(): string
    {
        return pathinfo($this->chemin_fichier, PATHINFO_EXTENSION);
    }

    /**
     * Vérifie si c'est une image
     */
    public function getEstImageAttribute(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }

    /**
     * Vérifie si c'est un PDF
     */
    public function getEstPdfAttribute(): bool
    {
        return $this->mime_type === 'application/pdf';
    }
}
