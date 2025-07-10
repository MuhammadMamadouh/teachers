<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsApproved
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return $next($request);
        }
        
        // Admin users always pass
        if ($user->is_admin) {
            return $next($request);
        }
        
        // For assistants, check if their teacher is approved
        if ($user->type === 'assistant') {
            $teacher = $user->teacher;
            
            if (!$teacher || !$teacher->is_approved) {
                return redirect()->route('pending-approval');
            }
            
            return $next($request);
        }
        
        // For teachers and other users, check their own approval status
        if (!$user->is_approved) {
            return redirect()->route('pending-approval');
        }

        return $next($request);
    }
}
