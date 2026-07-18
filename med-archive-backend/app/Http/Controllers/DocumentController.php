<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Consultation;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;

class DocumentController extends Controller
{
    /**
     * Liste des documents
     */
    public function index(Request $request)
    {
        $query = Document::with([
            'consultation.dossier.patient.user',
            'typeDocument'
        ]);

        // Filtre par type de document
        if ($request->has('type_document_id')) {
            $query->where('type_document_id', $request->type_document_id);
        }

        // Filtre par consultation
        if ($request->has('consultation_id')) {
            $query->where('consultation_id', $request->consultation_id);
        }

        // Filtre par patient
        if ($request->has('patient_id')) {
            $query->whereHas('consultation.dossier', function($q) use ($request) {
                $q->where('patient_id', $request->patient_id);
            });
        }

        $documents = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    /**
     * Uploader un nouveau document
     */
public function store(Request $request)
{
    $validated = $request->validate([
        'consultation_id' => 'required|exists:consultations,id',
        'type_document_id' => 'required|exists:type_documents,id',
        'titre' => 'required|string|max:255',
        'fichier' => 'required|file|mimes:pdf,jpeg,png,jpg,doc,docx|max:10240',
        'description' => 'nullable|string'
    ]);

    $consultation = Consultation::findOrFail($validated['consultation_id']);

    // Upload vers Cloudinary
    $uploadedFile = Cloudinary::upload(
        $request->file('fichier')->getRealPath(),
        [
            'folder' => 'med-archive/documents',
            'resource_type' => 'auto'
        ]
    );

    $url = $uploadedFile->getSecurePath();

    $taille = round($request->file('fichier')->getSize() / 1024, 2);

    $document = Document::create([
        'consultation_id' => $validated['consultation_id'],
        'type_document_id' => $validated['type_document_id'],
        'titre' => $validated['titre'],
        'chemin_fichier' => $url,
        'mime_type' => $request->file('fichier')->getMimeType(),
        'taille' => $taille,
        'description' => $validated['description'] ?? null
    ]);

    $consultation->dossier->updateStatistiques();

    return response()->json([
        'success' => true,
        'message' => 'Document uploadé avec succès',
        'data' => $document->load([
            'typeDocument',
            'consultation.dossier.patient.user'
        ])
    ], 201);
}

    /**
     * Télécharger un document
     */
    // public function download($id)
    // {
    //     $document = Document::find($id);

    //     if (!$document) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Document non trouvé'
    //         ], 404);
    //     }

    //     if (!Storage::disk('public')->exists($document->chemin_fichier)) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Fichier non trouvé sur le serveur'
    //         ], 404);
    //     }

    //     return response()->download(
    //         storage_path('app/public/' . $document->chemin_fichier),
    //         $document->titre . '.' . pathinfo($document->chemin_fichier, PATHINFO_EXTENSION)
    //     );
    // }
 public function download($id)
{
    $document = Document::findOrFail($id);

    return redirect()->away($document->chemin_fichier);
}

    /**
     * Voir un document (sans téléchargement)
     */
    // public function view($id)
    // {
    //     $document = Document::find($id);

    //     if (!$document) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Document non trouvé'
    //         ], 404);
    //     }

    //     if (!Storage::disk('public')->exists($document->chemin_fichier)) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Fichier non trouvé sur le serveur'
    //         ], 404);
    //     }

    //     return response()->file(storage_path('app/public/' . $document->chemin_fichier));
    // }
public function view($id)
{
    $document = Document::findOrFail($id);

    return redirect()->away($document->chemin_fichier);
}

    /**
     * Mettre à jour les informations d'un document
     */
    public function update(Request $request, $id)
    {
        $document = Document::find($id);

        if (!$document) {
            return response()->json([
                'success' => false,
                'message' => 'Document non trouvé'
            ], 404);
        }

        $validated = $request->validate([
            'titre' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type_document_id' => 'sometimes|exists:type_documents,id'
        ]);

        $document->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Document mis à jour avec succès',
            'data' => $document->fresh()
        ]);
    }

    /**
     * Supprimer un document
     */
    public function destroy($id)
{
    $document = Document::find($id);

    if (!$document) {
        return response()->json([
            'success' => false,
            'message' => 'Document non trouvé'
        ], 404);
    }

    $dossier = $document->consultation->dossier;

    $document->delete();

    $dossier->updateStatistiques();

    return response()->json([
        'success' => true,
        'message' => 'Document supprimé avec succès'
    ]);
}

    /**
     * Statistiques des documents
     */
    public function statistiques()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total' => Document::count(),
                'par_type' => Document::select('type_document_id', DB::raw('count(*) as total'))
                    ->with('typeDocument')
                    ->groupBy('type_document_id')
                    ->get()
                    ->map(function($item) {
                        return [
                            'type' => $item->typeDocument->nom,
                            'total' => $item->total
                        ];
                    }),
                'taille_totale' => Document::sum('taille') . ' Ko',
                'documents_mois' => Document::whereMonth('created_at', now()->month)->count()
            ]
        ]);
    }
}
