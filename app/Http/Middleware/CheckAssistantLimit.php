<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAssistantLimit
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Only check limit for POST requests (creating assistants)
        if ($request->isMethod('POST') && $request->route()->getName() === 'assistants.store') {
            
            // Check if user can add more assistants
            if (!$user->canAddAssistants()) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'لقد وصلت إلى الحد الأقصى لعدد المساعدين',
                        'errors' => [
                            'limit' => 'لقد وصلت إلى الحد الأقصى لعدد المساعدين. يرجى ترقية خطتك لإضافة المزيد من المساعدين.'
                        ]
                    ], 422);
                }
                
                return back()->withErrors([
                    'limit' => 'لقد وصلت إلى الحد الأقصى لعدد المساعدين. يرجى ترقية خطتك لإضافة المزيد من المساعدين.'
                ])->withInput();
            }
        }
        
        return $next($request);
    }
}
