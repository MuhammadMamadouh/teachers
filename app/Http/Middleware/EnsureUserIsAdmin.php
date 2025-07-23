<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            abort(403, 'Unauthorized access');
        }

        // Check if user is either a system admin or center admin
        if (!$user->hasRole('system-admin') && !$user->hasRole('center-admin')) {
            abort(403, 'Admin access required');
        }

        return $next($request);
    }
}
