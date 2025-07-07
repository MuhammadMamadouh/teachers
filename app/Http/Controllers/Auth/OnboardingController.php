<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Display the onboarding page.
     */
    public function show(): Response
    {
        return Inertia::render('Auth/Onboarding', [
            'user' => Auth::user()
        ]);
    }

    /**
     * Mark onboarding as completed for the user.
     */
    public function complete(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Update user to mark onboarding as completed
        $user->onboarding_completed = true;
        $user->onboarding_completed_at = now();
        $user->save();

        // Redirect based on approval status
        if (!$user->is_approved && !$user->is_admin) {
            return redirect()->route('pending-approval')->with('success', 'تم إكمال الجولة التعريفية بنجاح! في انتظار موافقة الإدارة على حسابك.');
        }

        return redirect()->route('dashboard')->with('success', 'مرحباً بك! تم إكمال الجولة التعريفية بنجاح.');
    }

    /**
     * Check if user needs to see onboarding
     */
    public static function shouldShowOnboarding($user): bool
    {
        return !$user->onboarding_completed;
    }
}
