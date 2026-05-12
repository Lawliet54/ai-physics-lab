<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! collect($roles)->contains(fn ($role) => $user->hasRole($role))) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
