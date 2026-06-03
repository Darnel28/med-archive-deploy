<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Vérifie que l'utilisateur possède l'un des rôles spécifiés.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        $hasRole = $user && $user->role && in_array($user->role->nom, $roles, true);
        $acceptsAdminAlias = $user && in_array('Administrateur', $roles, true) && $user->isAdmin();

        if (!$hasRole && !$acceptsAdminAlias) {
            abort(403, 'Accès refusé.');
        }

        return $next($request);
    }
}
