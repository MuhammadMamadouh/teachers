<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckOnboardingCompleted
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip check for admin users or if user is not authenticated
        if (!Auth::check() || Auth::user()->is_admin) {
            return $next($request);
        }

        $user = Auth::user();
        
        // For assistants, check the teacher's onboarding status
        $userToCheck = $user->is_assistant ? $user->teacher : $user;
        
        // If user hasn't completed onboarding, redirect to onboarding page
        if (!$userToCheck->onboarding_completed) {
            // Don't redirect if already on onboarding routes
            if (!$request->routeIs('onboarding.*')) {
                return redirect()->route('onboarding.show');
            }
        }

        return $next($request);
    }
}
