<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Governorate;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        $governorates = Governorate::where('is_active', true)
            ->orderBy('name_ar')
            ->get(['id', 'name_ar', 'name_en']);
            
        return Inertia::render('Auth/Register', [
            'governorates' => $governorates
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'required|string|max:20',
            'subject' => 'required|string|max:255',
            'governorate_id' => 'required|exists:governorates,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'subject' => $request->subject,
            'governorate_id' => $request->governorate_id,
            'is_approved' => false,
        ]);

        // Create default subscription for new user
        $defaultPlan = Plan::where('is_default', true)->first();
        
        Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $defaultPlan ? $defaultPlan->id : null,
            'max_students' => $defaultPlan ? $defaultPlan->max_students : 5, // Fallback to 5
            'is_active' => true,
            'start_date' => now(),
            'end_date' => null, // No end date for basic plan
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('pending-approval', absolute: false));
    }
}
