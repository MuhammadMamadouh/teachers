<?php

namespace App\Http\Controllers\Auth;

use App\Enums\CenterType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Center;
use App\Models\Governorate;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
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
    public function create(Request $request): Response
    {
        $governorates = Governorate::where('is_active', true)
            ->orderBy('name_ar')
            ->get(['id', 'name_ar', 'name_en']);

        // Get all available plans for selection
        $plans = Plan::orderBy('max_students')->get();

        // Get the pre-selected plan if provided
        $selectedPlanId = $request->get('plan');
        $selectedPlan = null;
        if ($selectedPlanId) {
            $selectedPlan = Plan::find($selectedPlanId);
        }

        return Inertia::render('Auth/Register', [
            'governorates' => $governorates,
            'plans' => $plans,
            'selectedPlan' => $selectedPlan,
            'centerTypes' => CenterType::options(),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(RegisterRequest $request): RedirectResponse
    {


        // Create center first
        $center = Center::create([
            'name' => $request->center_name,
            'type' => $request->center_type,
            'address' => $request->center_address,
            'phone' => $request->phone,
            'email' => $request->email,
            'governorate_id' => $request->governorate_id,
            'is_active' => true,
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'subject' => $request->is_teacher ? $request->subject : null,
            'center_id' => $center->id,
            'type' => $request->is_teacher ? 'teacher' : 'center_owner',
            'is_approved' => false,
        ]);

        // Update center with owner
        $center->update(['owner_id' => $user->id]);

        // Assign roles - Center owners get center-admin role, not system admin
        $user->assignRole('center-admin'); // Center admin role (not system admin)
        
        // If user specified they are also a teacher, assign teacher role
        if ($request->is_teacher) {
            $user->assignRole('teacher');
        }

        // Create subscription for new user based on selected plan
        $selectedPlan = null;
        if ($request->plan_id) {
            $selectedPlan = Plan::find($request->plan_id);
        }

        // Fallback to default plan if no plan selected or plan not found
        if (!$selectedPlan) {
            $selectedPlan = Plan::where('is_default', true)->first();
        }

        Subscription::create([
            'user_id' => $user->id,
            'center_id' => $center->id,
            'plan_id' => $selectedPlan ? $selectedPlan->id : null,
            'max_students' => $selectedPlan ? $selectedPlan->max_students : 5, // Fallback to 5
            'is_active' => true,
            'start_date' => now(),
            'end_date' => now()->addDays($selectedPlan ? $selectedPlan->duration_days : 30), // Default to 30 days if no plan
            'is_trial' => $selectedPlan ? $selectedPlan->is_trial : false, // Use plan's trial status
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Redirect new users to pending approval page since they need approval first
        return redirect(route('pending-approval', absolute: false));
    }
}
