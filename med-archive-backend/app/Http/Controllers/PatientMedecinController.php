<?php

namespace App\Http\Controllers;

use App\Models\Patient;

class PatientMedecinController extends Controller
{
    /**
     * Liste des patients pour les formulaires
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Patient::query()
                ->select('id', 'nom', 'prenom')
                ->orderBy('nom')
                ->get(),
        ]);
    }
    public function getPatientsByMedecin($medecinId)
{
    $patients = Patient::whereHas('dossier', function ($q) use ($medecinId) {
        $q->where('medecin_id', $medecinId);
    })->get(['id', 'nom', 'prenom', 'numero_dossier']);

    return response()->json(['success' => true, 'data' => $patients]);
}
}
