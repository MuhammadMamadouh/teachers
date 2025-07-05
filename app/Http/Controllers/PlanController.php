<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\PlanUpgradeRequest;
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
       
        $availablePlans = Plan::whereNot('id', $currentPlan->id)
        ->where('is_trial', false) // Exclude trial plans
            // ->where('max_students', '>', $currentMaxStudents)
            ->orderBy('max_students')
            ->get();
        
        // Check if user has pending upgrade request
        $pendingUpgradeRequest = $user->pendingPlanUpgradeRequests()->with('requestedPlan')->first();
        
        return Inertia::render('Plans/Index', [
            'currentPlan' => $currentPlan,
            'availablePlans' => $availablePlans,
            'currentStudentCount' => $user->students->count(),
            'pendingUpgradeRequest' => $pendingUpgradeRequest,
        ]);
    }
    
    /**
     * Create a plan upgrade request (requires admin approval).
     */
    public function upgrade(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:plans,id',
        ]);

        
        $user = Auth::user();
        $newPlan = Plan::findOrFail($request->plan_id);
        $currentSubscription = $user->activeSubscription()->first();
        // dd($currentSubscription);
        if (!$currentSubscription) {
            return redirect()->back()->withErrors(['subscription' => 'لم يتم العثور على اشتراك نشط.']);
        }
        
        $currentPlan = $currentSubscription->plan;
        
        // Validate that this is actually an upgrade
        // if ($currentPlan && $newPlan->max_students <= $currentPlan->max_students) {
        //     return redirect()->back()->withErrors(['plan' => 'يمكنك فقط الترقية إلى خطة تحتوي على عدد أكبر من الطلاب.']);
        // }
        
        // Check if user already has a pending upgrade request
        if ($user->hasPendingPlanUpgrade()) {
            return redirect()->back()->withErrors(['plan' => 'لديك بالفعل طلب ترقية قيد المراجعة. يرجى انتظار موافقة الإدارة.']);
        }
        
        // Create upgrade request
        DB::transaction(function () use ($user, $currentPlan, $newPlan) {
            PlanUpgradeRequest::create([
                'user_id' => $user->id,
                'current_plan_id' => $currentPlan ? $currentPlan->id : null,
                'requested_plan_id' => $newPlan->id,
                'status' => 'pending',
            ]);
        });
        
        return back()->with('success', "تم إرسال طلب الترقية إلى خطة {$newPlan->name}. سيتم مراجعة الطلب من قبل الإدارة وسيتم إشعارك بالنتيجة.");
    }
}
