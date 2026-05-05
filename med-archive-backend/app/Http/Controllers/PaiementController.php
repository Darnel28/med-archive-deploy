<?php

namespace App\Http\Controllers;

use App\Models\Paiement;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    /**
     * Liste des paiements (filtrable par facture)
     */
    public function index(Request $request)
    {
        $query = Paiement::with(['facture.patient.user']);

        if ($request->filled('facture_id')) {
            $query->where('facture_id', $request->facture_id);
        }

        if ($request->filled('methode')) {
            $query->where('methode', $request->methode);
        }

        if ($request->filled('date_debut')) {
            $query->whereDate('created_at', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->whereDate('created_at', '<=', $request->date_fin);
        }

        $paiements = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $paiements,
        ]);
    }

    /**
     * Afficher les détails d'un paiement
     */
    public function show(string $id)
    {
        $paiement = Paiement::with(['facture.patient.user', 'creePar'])->find($id);

        if (!$paiement) {
            return response()->json([
                'success' => false,
                'message' => 'Paiement non trouvé.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $paiement,
        ]);
    }
}
