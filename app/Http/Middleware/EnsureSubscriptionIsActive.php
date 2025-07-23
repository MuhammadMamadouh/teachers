<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionIsActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Allow access if user is admin
        if ($user && $user->is_admin) {
            return $next($request);
        }

        // For assistants, check their teacher's subscription
        if ($user && $user->type === 'assistant') {
            $teacher = $user->teacher;

            if (!$teacher) {
                // Assistant has no teacher - this shouldn't happen, but handle gracefully
                return redirect()->route('subscription.expired');
            }

            // Check if the teacher has an active subscription (this will check center subscription if applicable)
            if (!$teacher->hasActiveSubscription()) {
                return redirect()->route('subscription.expired');
            }

            return $next($request);
        }

        // For all other users (including center-based teachers), check their subscription
        if (!$user || !$user->hasActiveSubscription()) {
            // Redirect to subscription expired page
            return redirect()->route('subscription.expired');
        }

        return $next($request);
    }
}
