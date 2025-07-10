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
     * Plan Controller handles plan viewing and upgrade requests for teachers.
     *
     * For assistants:
     * - Shows their teacher's current plan and subscription data
     * - Allows assistants to view available plans but upgrade requests are created for the teacher
     * - All plan limits and restrictions are based on the teacher's subscription
     */

    /**
     * Show available plans for upgrade.
     */
    public function index()
    {
        $user = Auth::user();

        // For assistants, use the teacher's subscription and plan data
        $userToCheck = ($user->type === 'assistant') ? $user->teacher : $user;

        if (!$userToCheck) {
            return redirect()->back()->withErrors(['error' => 'لم يتم العثور على بيانات المعلم المرتبط.']);
        }

        $currentSubscription = $userToCheck->activeSubscription()->first();
        $currentPlan = $currentSubscription ? $currentSubscription->plan : null;

        // Get plans that are upgrades (more students than current plan)
        $availablePlans = Plan::where('is_trial', false) // Exclude trial plans
            ->when($currentPlan, function ($query) use ($currentPlan) {
                return $query->whereNot('id', $currentPlan->id);
            })
            ->orderBy('max_students')
            ->get();

        // Check if user has pending upgrade request (use the teacher for assistants)
        $pendingUpgradeRequest = $userToCheck->pendingPlanUpgradeRequests()->with('requestedPlan')->first();

        return Inertia::render('Plans/Index', [
            'currentPlan' => $currentPlan,
            'availablePlans' => $availablePlans,
            'currentStudentCount' => $userToCheck->students->count(),
            'pendingUpgradeRequest' => $pendingUpgradeRequest,
            'isAssistant' => $user->type === 'assistant',
            'teacherName' => ($user->type === 'assistant') ? $userToCheck->name : null,
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

        // For assistants, use the teacher's subscription and plan data
        $userToCheck = ($user->type === 'assistant') ? $user->teacher : $user;

        if (!$userToCheck) {
            return redirect()->back()->withErrors(['error' => 'لم يتم العثور على بيانات المعلم المرتبط.']);
        }

        $newPlan = Plan::findOrFail($request->plan_id);
        $currentSubscription = $userToCheck->activeSubscription()->first();

        if (!$currentSubscription) {
            return redirect()->back()->withErrors(['subscription' => 'لم يتم العثور على اشتراك نشط.']);
        }

        $currentPlan = $currentSubscription->plan;

        // Validate that this is actually an upgrade
        // if ($currentPlan && $newPlan->max_students <= $currentPlan->max_students) {
        //     return redirect()->back()->withErrors(['plan' => 'يمكنك فقط الترقية إلى خطة تحتوي على عدد أكبر من الطلاب.']);
        // }

        // Check if user already has a pending upgrade request (check the teacher for assistants)
        if ($userToCheck->hasPendingPlanUpgrade()) {
            return redirect()->back()->withErrors(['plan' => 'لديك بالفعل طلب ترقية قيد المراجعة. يرجى انتظار موافقة الإدارة.']);
        }

        // Create upgrade request (always use the teacher's ID for assistants)
        DB::transaction(function () use ($userToCheck, $currentPlan, $newPlan) {
            PlanUpgradeRequest::create([
                'user_id' => $userToCheck->id,
                'current_plan_id' => $currentPlan ? $currentPlan->id : null,
                'requested_plan_id' => $newPlan->id,
                'status' => 'pending',
            ]);
        });

        return back()->with('success', "تم إرسال طلب الترقية إلى خطة {$newPlan->name}. سيتم مراجعة الطلب من قبل الإدارة وسيتم إشعارك بالنتيجة.");
    }
}
