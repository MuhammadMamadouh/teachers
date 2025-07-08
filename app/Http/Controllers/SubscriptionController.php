<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Show subscription expired page.
     */
    public function expired()
    {
        $user = Auth::user();
        $plans = Plan::where('is_trial', false)->orderBy('price')->get();
        $currentSubscription = $user ? $user->activeSubscription()->first() : null;
       

        // if the user's plan is not expired, redirect to status page
        if ($currentSubscription && $currentSubscription->is_active && $currentSubscription->end_date && $currentSubscription->end_date > now()) {
            return redirect()->route('subscription.status');
        }
//  $currentSubscription->load('plan'); // Ensure plan details are loaded
        return Inertia::render('Subscription/Expired', [
            'plans' => $plans,
            'currentSubscription' => $currentSubscription,
            'hasHadTrial' => $user ? $user->hasHadTrial() : false,
        ]);
    }

    /**
     * Show all available plans.
     */
    public function plans()
    {
        $user = Auth::user();
        $plans = Plan::where('is_trial', false)->orderBy('price')->get();
        $currentSubscription = $user->activeSubscription()->with('plan')->first();

        return Inertia::render('Subscription/Plans', [
            'plans' => $plans,
            'currentSubscription' => $currentSubscription,
            'currentStudentCount' => $user->students->count(),
            'hasHadTrial' => $user->hasHadTrial(),
        ]);
    }

    /**
     * Subscribe to a plan (admin only for now).
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'plan_id' => 'required|exists:plans,id',
        ]);

        // Only admins can manually assign subscriptions for now
        if (!Auth::user()->is_admin) {
            return redirect()->back()->withErrors(['permission' => 'يمكن للمشرفين فقط تخصيص الاشتراكات.']);
        }

        $user = \App\Models\User::findOrFail($request->user_id);
        $plan = Plan::findOrFail($request->plan_id);

        // Deactivate any existing subscriptions
        $user->subscriptions()->update(['is_active' => false]);

        // Create new subscription
        DB::transaction(function () use ($user, $plan) {
            $user->subscriptions()->create([
                'plan_id' => $plan->id,
                'max_students' => $plan->max_students,
                'is_active' => true,
                'is_trial' => $plan->is_trial,
                'start_date' => now(),
                'end_date' => now()->addDays($plan->duration_days),
            ]);
        });

        return redirect()->back()->with('success', "تم تخصيص خطة {$plan->name} بنجاح للمستخدم {$user->name}!");
    }

    /**
     * Show subscription status and details.
     */
    public function status()
    {
        $user = Auth::user();
        $subscription = $user->activeSubscription()->with('plan')->first();
        $limits = $user->getSubscriptionLimits();

        return Inertia::render('Subscription/Status', [
            'subscription' => $subscription,
            'limits' => $limits,
            'daysRemaining' => $subscription ? $subscription->days_remaining : 0,
        ]);
    }
}
