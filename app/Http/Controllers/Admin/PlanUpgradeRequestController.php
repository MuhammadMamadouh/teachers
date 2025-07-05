<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanUpgradeRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PlanUpgradeRequestController extends Controller
{
    /**
     * Display a listing of plan upgrade requests.
     */
    public function index()
    {
        $requests = PlanUpgradeRequest::with(['user', 'currentPlan', 'requestedPlan', 'approvedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/PlanUpgradeRequests/Index', [
            'requests' => $requests,
        ]);
    }

    /**
     * Show the specified plan upgrade request.
     */
    public function show(PlanUpgradeRequest $planUpgradeRequest)
    {
        $planUpgradeRequest->load(['user', 'currentPlan', 'requestedPlan', 'approvedBy']);
        // dd($planUpgradeRequest->currentPlan);
        return Inertia::render('Admin/PlanUpgradeRequests/Show', [
            'request' => $planUpgradeRequest,
        ]);
    }

    /**
     * Approve a plan upgrade request.
     */
    public function approve(Request $request, PlanUpgradeRequest $planUpgradeRequest)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if (!$planUpgradeRequest->isPending()) {
            return redirect()->back()->withErrors(['status' => 'لا يمكن الموافقة على طلب تم التعامل معه بالفعل.']);
        }

        DB::transaction(function () use ($planUpgradeRequest, $request) {
            $admin = Auth::user();
            
            // Approve the request
            $planUpgradeRequest->approve($admin, $request->admin_notes);
            
            // Update the user's subscription
            $user = $planUpgradeRequest->user;
            $currentSubscription = $user->activeSubscription()->first();
            
            if ($currentSubscription) {
                $newPlan = $planUpgradeRequest->requestedPlan;
                $currentSubscription->update([
                    'plan_id' => $newPlan->id,
                    'max_students' => $newPlan->max_students, // Update for backward compatibility
                    'start_date' => now()->toDateString(),
                    'end_date' => now()->addDays($newPlan->duration_days)->toDateString(),
                ]);
            }
        });

        return redirect()->route('admin.plan-upgrade-requests.index')
            ->with('success', "تم الموافقة على طلب الترقية وتم تحديث خطة المستخدم بنجاح.");
    }

    /**
     * Reject a plan upgrade request.
     */
    public function reject(Request $request, PlanUpgradeRequest $planUpgradeRequest)
    {
        $request->validate([
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        if (!$planUpgradeRequest->isPending()) {
            return redirect()->back()->withErrors(['status' => 'لا يمكن رفض طلب تم التعامل معه بالفعل.']);
        }

        $admin = Auth::user();
        $planUpgradeRequest->reject($admin, $request->admin_notes);

        return redirect()->route('admin.plan-upgrade-requests.index')
            ->with('success', "تم رفض طلب الترقية.");
    }
}
