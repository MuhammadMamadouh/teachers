<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FilterByCenterScope
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->center_id) {
            return redirect()->route('center.setup');
        }

        // Add center-based filtering to all database queries
        $request->merge([
            'center_id' => $user->center_id,
            'teacher_id' => $user->isTeacher() && !$user->isAdmin() ? $user->id : null,
        ]);

        return $next($request);
    }
}
