<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ScopeResourcesByTeacher
{
    /**
     * Scope resources by teacher for assistants.
     * Assistants can only access resources belonging to their teacher.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        // Attach the main teacher ID to the request for controllers to use
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;
        $request->attributes->add(['teacher_id' => $teacherId]);

        // Make the main teacher available to the request
        $mainTeacher = $user->type === 'assistant' ? $user->teacher : $user;
        $request->attributes->add(['main_teacher' => $mainTeacher]);

        return $next($request);
    }
}
