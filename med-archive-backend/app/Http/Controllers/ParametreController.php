<?php

namespace App\Http\Controllers;

use App\Models\Parametre;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ParametreController extends Controller
{
    private function success($data = null, string $message = 'OK', int $status = Response::HTTP_OK)
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $status);
    }

    private function error(string $message, int $status, $data = null)
    {
        return response()->json([
            'success' => false,
            'data' => $data,
            'message' => $message,
        ], $status);
    }

    private function authorizeAdmin(Request $request)
    {
        if (!$request->user()?->isAdmin()) {
            return $this->error('Seuls les administrateurs peuvent gérer les paramètres', Response::HTTP_FORBIDDEN);
        }

        return null;
    }

    public function index(Request $request)
    {
        if ($response = $this->authorizeAdmin($request)) {
            return $response;
        }

        return $this->success(
            Parametre::paginate($request->get('per_page', 50)),
            'Paramètres récupérés avec succès'
        );
    }

    public function store(Request $request)
    {
        if ($response = $this->authorizeAdmin($request)) {
            return $response;
        }

        $data = $request->validate([
            'cle' => 'required|string|unique:parametres,cle',
            'valeur' => 'required',
            'description' => 'nullable|string',
            'type' => 'in:string,integer,boolean,json',
        ]);

        $param = Parametre::create($data);

        return $this->success($param, 'Paramètre créé avec succès', Response::HTTP_CREATED);
    }

    public function show(Request $request, $id)
    {
        if ($response = $this->authorizeAdmin($request)) {
            return $response;
        }

        $param = Parametre::find($id);

        if (!$param) {
            return $this->error('Paramètre non trouvé', Response::HTTP_NOT_FOUND);
        }

        return $this->success($param, 'Paramètre récupéré avec succès');
    }

    public function update(Request $request, $id)
    {
        if ($response = $this->authorizeAdmin($request)) {
            return $response;
        }

        $param = Parametre::find($id);

        if (!$param) {
            return $this->error('Paramètre non trouvé', Response::HTTP_NOT_FOUND);
        }

        $data = $request->validate([
            'valeur' => 'sometimes',
            'description' => 'nullable|string',
            'type' => 'in:string,integer,boolean,json',
        ]);

        $param->update($data);

        return $this->success($param->fresh(), 'Paramètre mis à jour avec succès');
    }

    public function destroy(Request $request, $id)
    {
        if ($response = $this->authorizeAdmin($request)) {
            return $response;
        }

        $param = Parametre::find($id);

        if (!$param) {
            return $this->error('Paramètre non trouvé', Response::HTTP_NOT_FOUND);
        }

        $param->delete();

        return $this->success(null, 'Paramètre supprimé avec succès');
    }
}
