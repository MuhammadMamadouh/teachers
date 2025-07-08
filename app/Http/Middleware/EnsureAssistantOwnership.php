<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class EnsureAssistantOwnership
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $assistant = $request->route('assistant');
        
        // If there's no assistant in the route, continue
        if (!$assistant) {
            return $next($request);
        }
        
        // If assistant is passed as ID, get the model
        if (!$assistant instanceof User) {
            $assistant = User::findOrFail($assistant);
        }
        
        // Verify this is actually an assistant
        if ($assistant->type !== 'assistant') {
            abort(404, 'المساعد غير موجود');
        }
        
        // Verify the assistant belongs to the current teacher
        if ($assistant->teacher_id !== $user->id) {
            abort(403, 'يمكنك فقط إدارة مساعديك الخاصين');
        }
        
        // Replace the route parameter with the loaded model
        $request->route()->setParameter('assistant', $assistant);
        
        return $next($request);
    }
}
