<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanManageAssistants
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
            abort(401, 'غير مصرح لك بالوصول');
        }
        
        // Only teachers can manage assistants
        if ($user->type !== 'teacher') {
            abort(403, 'يمكن للمعلمين فقط إدارة المساعدين');
        }
        
        // Check if user is approved
        if (!$user->is_approved) {
            abort(403, 'يجب الموافقة على حسابك أولاً لإدارة المساعدين');
        }
        
        // Check if user has an active subscription
        if (!$user->hasActiveSubscription()) {
            abort(403, 'يجب أن يكون لديك اشتراك فعال لإدارة المساعدين');
        }
        
        return $next($request);
    }
}
