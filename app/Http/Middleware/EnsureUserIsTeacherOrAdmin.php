<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsTeacherOrAdmin
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
            abort(403, 'Authentication required');
        }

        // Allow teachers, assistants, and admins
        if ($user->type === 'teacher' || $user->type === 'assistant' || $user->is_admin) {
            return $next($request);
        }

        abort(403, 'Only teachers, assistants, or admins can access this feature');
    }
}
