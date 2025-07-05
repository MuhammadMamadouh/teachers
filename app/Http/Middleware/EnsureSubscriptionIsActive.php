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

        // Check if user has an active subscription
        if (!$user || !$user->hasActiveSubscription()) {
            $subscription = $user ? $user->activeSubscription()->first() : null;
            
            // Mark subscription as expired if it exists but is past end date
            if ($subscription && $subscription->isExpired()) {
                $subscription->markAsExpired();
            }

            // Redirect to subscription expired page
            return redirect()->route('subscription.expired');
        }

        return $next($request);
    }
}
