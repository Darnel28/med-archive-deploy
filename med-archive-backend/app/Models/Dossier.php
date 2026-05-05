<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dossier extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'patient_id',
        'numero_dossier',
        'imu',
        'statut',
        'date_ouverture',
        'date_fermeture',
        'medecin_traitant',
        'diagnostics_principaux',
        'traitements_en_cours',
        'allergies_importantes',
        'notes_importantes',
        'total_consultations',
        'total_documents',
        'total_analyses',
        'total_ordonnances',
        'derniere_consultation',
        'dernier_document',
        'derniere_analyse',
        'etablissement_destination_id',
        'statut_transfert'
    ];

    protected $casts = [
        'date_ouverture' => 'date',
        'date_fermeture' => 'date',
        'derniere_consultation' => 'datetime',
        'dernier_document' => 'datetime',
        'derniere_analyse' => 'datetime'
    ];

    /**
     * Génère un numéro de dossier unique
     */
    public static function generateNumeroDossier(): string
    {
        $prefix = 'DOS';
        $year = date('Y');
        $month = date('m');
        $random = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);

        return "{$prefix}-{$year}{$month}-{$random}";
    }

    /**
     * Relations - TOUT ce qui appartient au dossier
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function etablissementDestination()
    {
        return $this->belongsTo(Etablissement::class, 'etablissement_destination_id');
    }

    /**
     * Tous les documents à travers les consultations
     */
    public function documents(): HasManyThrough
    {
        return $this->hasManyThrough(
            Document::class,
            Consultation::class,
            'dossier_id',
            'consultation_id',
            'id',
            'id'
        );
    }

    /**
     * Toutes les analyses à travers les consultations
     */
    public function analyses(): HasManyThrough
    {
        return $this->hasManyThrough(
            AnalyseLaboratoire::class,
            Consultation::class,
            'dossier_id',
            'consultation_id',
            'id',
            'id'
        );
    }

    /**
     * Toutes les ordonnances à travers les consultations
     */
    public function ordonnances(): HasManyThrough
    {
        return $this->hasManyThrough(
            Ordonnance::class,
            Consultation::class,
            'dossier_id',
            'consultation_id',
            'id',
            'id'
        );
    }

    /**
     * Toutes les constantes à travers les consultations
     */
    public function constantes(): HasManyThrough
    {
        return $this->hasManyThrough(
            Constante::class,
            Consultation::class,
            'dossier_id',
            'consultation_id',
            'id',
            'id'
        );
    }

    /**
     * Met à jour les statistiques du dossier
     */
    public function updateStatistiques(): void
    {
        $this->update([
            'total_consultations' => $this->consultations()->count(),
            'total_documents' => $this->documents()->count(),
            'total_analyses' => $this->analyses()->count(),
            'total_ordonnances' => $this->ordonnances()->count(),
            'derniere_consultation' => $this->consultations()->max('date_consultation'),
            'dernier_document' => $this->documents()
                ->select('documents.created_at')
                ->orderBy('documents.created_at', 'desc')
                ->value('documents.created_at'),
            'derniere_analyse' => $this->analyses()
                ->select('analyses_laboratoire.created_at')
                ->orderBy('analyses_laboratoire.created_at', 'desc')
                ->value('analyses_laboratoire.created_at'),
        ]);
    }

    /**
     * Récupère le dossier complet avec tout son contenu
     */
    public function getContenuCompletAttribute()
    {
        return [
            'dossier' => $this,
            'patient' => $this->patient->load('user'),
            'consultations' => $this->consultations()
                ->with(['medecin.user', 'constantes'])
                ->latest('date_consultation')
                ->get(),
            'documents' => $this->documents()
                ->with('typeDocument')
                ->latest()
                ->get(),
            'analyses' => $this->analyses()
                ->with(['laboratoire.user', 'prescripteur.user'])
                ->latest('date_prelevement')
                ->get(),
            'statistiques' => [
                'total_consultations' => $this->total_consultations,
                'total_documents' => $this->total_documents,
                'total_analyses' => $this->total_analyses,
                'derniere_activite' => $this->derniere_consultation ?? $this->dernier_document
            ]
        ];
    }
}
