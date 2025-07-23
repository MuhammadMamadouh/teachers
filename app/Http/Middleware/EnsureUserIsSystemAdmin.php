<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSystemAdmin
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

        // Check if user is a system admin (has the 'system-admin' role)
        if (!$user->hasRole('system-admin')) {
            abort(403, 'Only system administrators can access this resource');
        }

        return $next($request);
    }
}
