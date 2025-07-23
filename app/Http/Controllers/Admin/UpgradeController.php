<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Center;
use App\Models\Plan;
use App\Models\PlanUpgradeRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UpgradeController extends Controller
{
    /**
     * Show upgrade options and prompts.
     */
    public function index()
    {
        $user = Auth::user();
        $center = $user->center;
        
        if (!$center) {
            return redirect()->route('center.setup');
        }

        $currentSubscription = $center->activeSubscription;
        $availablePlans = $this->getAvailablePlans($center);
        $usageLimits = $this->getCurrentUsageLimits($center);
        $upgradePrompts = $this->getUpgradePrompts($center);

        return Inertia::render('Admin/Upgrade/Index', [
            'center' => $center,
            'currentSubscription' => $currentSubscription,
            'availablePlans' => $availablePlans,
            'usageLimits' => $usageLimits,
            'upgradePrompts' => $upgradePrompts,
        ]);
    }

    /**
     * Check if user can perform action or needs upgrade.
     */
    public function checkActionLimits(Request $request)
    {
        $user = Auth::user();
        $center = $user->center;
        
        $request->validate([
            'action' => 'required|string|in:add_teacher,add_assistant,add_student',
            'count' => 'integer|min:1|max:100',
        ]);

        $count = $request->count ?? 1;
        $result = $this->checkLimits($center, $request->action, $count);

        return response()->json($result);
    }

    /**
     * Create upgrade request.
     */
    public function requestUpgrade(Request $request)
    {
        $user = Auth::user();
        $center = $user->center;

        $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'reason' => 'required|string|max:500',
        ]);

        $plan = Plan::findOrFail($request->plan_id);
        $currentSubscription = $center->activeSubscription;

        // Check if already has pending upgrade request
        $existingRequest = PlanUpgradeRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return redirect()->back()->withErrors(['error' => 'You already have a pending upgrade request.']);
        }

        DB::transaction(function () use ($request, $user, $plan) {
            PlanUpgradeRequest::create([
                'user_id' => $user->id,
                'current_plan_id' => $user->center->activeSubscription->plan_id ?? null,
                'requested_plan_id' => $plan->id,
                'reason' => $request->reason,
                'status' => 'pending',
            ]);
        });

        return redirect()->back()->with('success', 'Upgrade request submitted successfully. You will be notified once approved.');
    }

    /**
     * Get available plans for upgrade.
     */
    private function getAvailablePlans(Center $center)
    {
        $currentSubscription = $center->activeSubscription;
        $currentPlan = $currentSubscription ? $currentSubscription->plan : null;

        return Plan::where('is_active', true)
            ->when($currentPlan, function ($query) use ($currentPlan) {
                return $query->where('max_students', '>', $currentPlan->max_students);
            })
            ->orderBy('max_students')
            ->get();
    }

    /**
     * Get current usage limits.
     */
    private function getCurrentUsageLimits(Center $center)
    {
        $subscription = $center->activeSubscription;
        $plan = $subscription ? $subscription->plan : null;

        return [
            'current_usage' => [
                'teachers' => $center->users()->role('teacher')->count(),
                'assistants' => $center->users()->role('assistant')->count(),
                'students' => $center->students()->count(),
            ],
            'limits' => [
                'max_teachers' => $plan ? $plan->max_teachers : 0,
                'max_assistants' => $plan ? $plan->max_assistants : 0,
                'max_students' => $plan ? $plan->max_students : 0,
            ],
            'usage_percentage' => [
                'teachers' => $plan && $plan->max_teachers > 0 ? 
                    round(($center->users()->role('teacher')->count() / $plan->max_teachers) * 100, 2) : 0,
                'assistants' => $plan && $plan->max_assistants > 0 ? 
                    round(($center->users()->role('assistant')->count() / $plan->max_assistants) * 100, 2) : 0,
                'students' => $plan && $plan->max_students > 0 ? 
                    round(($center->students()->count() / $plan->max_students) * 100, 2) : 0,
            ],
        ];
    }

    /**
     * Get upgrade prompts based on current usage.
     */
    private function getUpgradePrompts(Center $center)
    {
        $limits = $this->getCurrentUsageLimits($center);
        $prompts = [];

        foreach ($limits['usage_percentage'] as $type => $percentage) {
            if ($percentage >= 90) {
                $prompts[] = [
                    'type' => 'critical',
                    'message' => "You are using {$percentage}% of your {$type} limit. Upgrade now to avoid service interruption.",
                    'action' => 'upgrade_now',
                    'resource' => $type,
                ];
            } elseif ($percentage >= 75) {
                $prompts[] = [
                    'type' => 'warning',
                    'message' => "You are using {$percentage}% of your {$type} limit. Consider upgrading soon.",
                    'action' => 'consider_upgrade',
                    'resource' => $type,
                ];
            }
        }

        return $prompts;
    }

    /**
     * Check if action is allowed or needs upgrade.
     */
    private function checkLimits(Center $center, string $action, int $count = 1)
    {
        $subscription = $center->activeSubscription;
        $plan = $subscription ? $subscription->plan : null;

        if (!$plan) {
            return [
                'allowed' => false,
                'reason' => 'No active subscription',
                'requires_upgrade' => true,
                'suggested_plans' => $this->getAvailablePlans($center),
            ];
        }

        $currentUsage = $this->getCurrentUsageLimits($center)['current_usage'];

        switch ($action) {
            case 'add_teacher':
                $limit = $plan->max_teachers;
                $current = $currentUsage['teachers'];
                $resourceType = 'teachers';
                break;
            case 'add_assistant':
                $limit = $plan->max_assistants;
                $current = $currentUsage['assistants'];
                $resourceType = 'assistants';
                break;
            case 'add_student':
                $limit = $plan->max_students;
                $current = $currentUsage['students'];
                $resourceType = 'students';
                break;
            default:
                return ['allowed' => false, 'reason' => 'Invalid action'];
        }

        if ($current + $count > $limit) {
            return [
                'allowed' => false,
                'reason' => "Adding {$count} {$resourceType} would exceed your plan limit of {$limit}",
                'requires_upgrade' => true,
                'current_usage' => $current,
                'limit' => $limit,
                'suggested_plans' => $this->getAvailablePlans($center),
            ];
        }

        return [
            'allowed' => true,
            'remaining' => $limit - $current,
            'usage_after_action' => $current + $count,
            'limit' => $limit,
        ];
    }

    /**
     * Get upgrade suggestions based on current needs.
     */
    public function getUpgradeSuggestions(Request $request)
    {
        $user = Auth::user();
        $center = $user->center;

        $request->validate([
            'needed_teachers' => 'integer|min:0|max:100',
            'needed_assistants' => 'integer|min:0|max:100',
            'needed_students' => 'integer|min:0|max:100',
        ]);

        $currentUsage = $this->getCurrentUsageLimits($center)['current_usage'];
        $neededLimits = [
            'teachers' => $currentUsage['teachers'] + ($request->needed_teachers ?? 0),
            'assistants' => $currentUsage['assistants'] + ($request->needed_assistants ?? 0),
            'students' => $currentUsage['students'] + ($request->needed_students ?? 0),
        ];

        $suitablePlans = Plan::where('is_active', true)
            ->where('max_teachers', '>=', $neededLimits['teachers'])
            ->where('max_assistants', '>=', $neededLimits['assistants'])
            ->where('max_students', '>=', $neededLimits['students'])
            ->orderBy('price')
            ->get();

        return response()->json([
            'current_usage' => $currentUsage,
            'needed_limits' => $neededLimits,
            'suitable_plans' => $suitablePlans,
            'cost_analysis' => $this->calculateCostAnalysis($suitablePlans),
        ]);
    }

    /**
     * Calculate cost analysis for plans.
     */
    private function calculateCostAnalysis($plans)
    {
        return $plans->map(function ($plan) {
            return [
                'id' => $plan->id,
                'name' => $plan->name,
                'monthly_cost' => $plan->price,
                'yearly_cost' => $plan->price * 12,
                'cost_per_student' => $plan->max_students > 0 ? round($plan->price / $plan->max_students, 2) : 0,
                'features' => [
                    'max_teachers' => $plan->max_teachers,
                    'max_assistants' => $plan->max_assistants,
                    'max_students' => $plan->max_students,
                ],
            ];
        });
    }
}
