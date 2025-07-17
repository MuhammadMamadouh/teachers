<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCenterOwner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Check if user is authenticated
        if (!$user) {
            return redirect()->route('login');
        }
        
        // Check if user has a center
        if (!$user->center_id || !$user->center) {
            abort(403, 'Unauthorized - No center associated with this user');
        }
        
        // Check if user is the owner of the center
        if ($user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        return $next($request);
    }
}
