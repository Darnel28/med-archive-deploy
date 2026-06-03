<?php

namespace App\Http\Controllers;

use App\Models\Specialite;

class SpecialiteController extends Controller
{
    /**
     * Liste des spécialités pour les formulaires
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Specialite::query()
                ->select('id', 'nom')
                ->orderBy('nom')
                ->get(),
        ]);
    }
}
