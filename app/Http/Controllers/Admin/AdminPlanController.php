<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminPlanController extends Controller
{
    /**
     * Display a listing of the plans.
     */
    public function index()
    {
        $plans = Plan::withCount('subscriptions')
            ->orderBy('max_students')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'max_students' => $plan->max_students,
                    'max_assistants' => $plan->max_assistants,
                    'duration_days' => $plan->duration_days,
                    'price' => $plan->price,
                    'formatted_price' => $plan->formatted_price,
                    'formatted_duration' => $plan->formatted_duration,
                    'is_trial' => $plan->is_trial,
                    'is_default' => $plan->is_default,
                    'subscribers_count' => $plan->subscriptions_count,
                    'created_at' => $plan->created_at,
                ];
            });

        return Inertia::render('Admin/Plans/Index', [
            'plans' => $plans,
        ]);
    }

    /**
     * Show the form for creating a new plan.
     */
    public function create()
    {
        return Inertia::render('Admin/Plans/Create');
    }

    /**
     * Store a newly created plan in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:plans,name',
            'max_students' => 'required|integer|min:1|max:10000',
            'max_assistants' => 'required|integer|min:0|max:100',
            'duration_days' => 'required|integer|in:30,90,365',
            'price' => 'required|numeric|min:0|max:99999',
            'is_trial' => 'boolean',
            'is_default' => 'boolean',
        ]);

        // If this plan is being set as default, remove default from others
        if ($validated['is_default'] ?? false) {
            Plan::where('is_default', true)->update(['is_default' => false]);
        }

        // If this is a trial plan, ensure only one trial plan can be default
        if ($validated['is_trial'] ?? false) {
            if ($validated['is_default'] ?? false) {
                Plan::where('is_trial', true)->where('is_default', true)->update(['is_default' => false]);
            }
        }

        Plan::create($validated);

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'تم إنشاء الخطة بنجاح!');
    }

    /**
     * Display the specified plan.
     */
    public function show(Plan $plan)
    {
        $plan->load(['subscriptions.user:id,name,email']);
        
        return Inertia::render('Admin/Plans/Show', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'max_students' => $plan->max_students,
                'max_assistants' => $plan->max_assistants,
                'duration_days' => $plan->duration_days,
                'price' => $plan->price,
                'formatted_price' => $plan->formatted_price,
                'formatted_duration' => $plan->formatted_duration,
                'is_trial' => $plan->is_trial,
                'is_default' => $plan->is_default,
                'created_at' => $plan->created_at,
                'updated_at' => $plan->updated_at,
                'subscriptions' => $plan->subscriptions->map(function ($subscription) {
                    return [
                        'id' => $subscription->id,
                        'user' => $subscription->user,
                        'is_active' => $subscription->is_active,
                        'is_trial' => $subscription->is_trial,
                        'start_date' => $subscription->start_date,
                        'end_date' => $subscription->end_date,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified plan.
     */
    public function edit(Plan $plan)
    {
        return Inertia::render('Admin/Plans/Edit', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'max_students' => $plan->max_students,
                'max_assistants' => $plan->max_assistants,
                'duration_days' => $plan->duration_days,
                'price' => $plan->price,
                'is_trial' => $plan->is_trial,
                'is_default' => $plan->is_default,
            ],
        ]);
    }

    /**
     * Update the specified plan in storage.
     */
    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('plans')->ignore($plan->id)],
            'max_students' => 'required|integer|min:1|max:10000',
            'max_assistants' => 'required|integer|min:0|max:100',
            'duration_days' => 'required|integer|in:30,90,365',
            'price' => 'required|numeric|min:0|max:99999',
            'is_trial' => 'boolean',
            'is_default' => 'boolean',
        ]);

        // If this plan is being set as default, remove default from others
        if ($validated['is_default'] ?? false) {
            Plan::where('is_default', true)
                ->where('id', '!=', $plan->id)
                ->update(['is_default' => false]);
        }

        // If this is a trial plan, ensure only one trial plan can be default
        if ($validated['is_trial'] ?? false) {
            if ($validated['is_default'] ?? false) {
                Plan::where('is_trial', true)
                    ->where('is_default', true)
                    ->where('id', '!=', $plan->id)
                    ->update(['is_default' => false]);
            }
        }

        $plan->update($validated);

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'تم تحديث الخطة بنجاح!');
    }

    /**
     * Remove the specified plan from storage.
     */
    public function destroy(Plan $plan)
    {
        // Check if plan has active subscriptions
        $activeSubscriptions = $plan->subscriptions()->where('is_active', true)->count();
        
        if ($activeSubscriptions > 0) {
            return redirect()
                ->back()
                ->withErrors(['plan' => "لا يمكن حذف خطة تحتوي على {$activeSubscriptions} اشتراك نشط."]);
        }

        // Don't allow deleting the default plan if it's the only plan
        if ($plan->is_default && Plan::count() === 1) {
            return redirect()
                ->back()
                ->withErrors(['plan' => 'لا يمكن حذف الخطة الوحيدة المتبقية.']);
        }

        // If deleting the default plan, set another plan as default
        if ($plan->is_default) {
            $newDefault = Plan::where('id', '!=', $plan->id)->first();
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        $plan->delete();

        return redirect()
            ->route('admin.plans.index')
            ->with('success', 'تم حذف الخطة بنجاح!');
    }

    /**
     * Set a plan as the default plan.
     */
    public function setDefault(Plan $plan)
    {
        // Remove default from all plans
        Plan::where('is_default', true)->update(['is_default' => false]);
        
        // Set this plan as default
        $plan->update(['is_default' => true]);

        return redirect()
            ->back()
            ->with('success', "{$plan->name} أصبحت الآن الخطة الافتراضية!");
    }
}
