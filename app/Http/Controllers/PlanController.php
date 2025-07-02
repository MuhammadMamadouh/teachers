<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Show available plans for upgrade.
     */
    public function index()
    {
        $user = Auth::user();
        $currentSubscription = $user->activeSubscription()->first();
        $currentPlan = $currentSubscription ? $currentSubscription->plan : null;
        
        // Get plans that are upgrades (more students than current plan)
        $currentMaxStudents = $currentPlan ? $currentPlan->max_students : 0;
        $availablePlans = Plan::where('max_students', '>', $currentMaxStudents)
            ->orderBy('max_students')
            ->get();
        
        return Inertia::render('Plans/Index', [
            'currentPlan' => $currentPlan,
            'availablePlans' => $availablePlans,
            'currentStudentCount' => $user->students->count(),
        ]);
    }
    
    /**
     * Upgrade user to a new plan.
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);
        
        $user = Auth::user();
        $newPlan = Plan::findOrFail($request->plan_id);
        $currentSubscription = $user->activeSubscription()->first();
        
        if (!$currentSubscription) {
            return redirect()->back()->withErrors(['subscription' => 'No active subscription found.']);
        }
        
        $currentPlan = $currentSubscription->plan;
        
        // Validate that this is actually an upgrade
        if ($currentPlan && $newPlan->max_students <= $currentPlan->max_students) {
            return redirect()->back()->withErrors(['plan' => 'You can only upgrade to a plan with more students.']);
        }
        
        // Update the subscription
        DB::transaction(function () use ($currentSubscription, $newPlan) {
            $currentSubscription->update([
                'plan_id' => $newPlan->id,
                'max_students' => $newPlan->max_students, // Update for backward compatibility
            ]);
        });
        
        return redirect()->route('dashboard')->with('success', "Successfully upgraded to {$newPlan->name} plan!");
    }
}
