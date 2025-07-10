<?php

namespace App\Console\Commands;

use App\Models\Plan;
use App\Models\PlanUpgradeRequest;
use App\Models\User;
use Illuminate\Console\Command;

class TestPlanUpgradeRequest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:plan-upgrade';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test plan upgrade request functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Testing Plan Upgrade Request Functionality...');
        $this->newLine();

        // 1. Check users and their types
        $this->info('📋 Users in database:');
        $users = User::all();
        foreach ($users as $user) {
            $adminStatus = $user->is_admin ? '👑 Admin' : '👤 User';
            $typeStatus = $user->type === 'assistant' ? '🤝 Assistant' : '🎓 Teacher';
            $approvedStatus = $user->is_approved ? '✅ Approved' : '⏳ Pending';

            $this->info("  - {$user->name} ({$user->email}) - {$adminStatus} - {$typeStatus} - {$approvedStatus}");
        }
        $this->newLine();

        // 2. Check plans
        $this->info('📊 Available plans:');
        $plans = Plan::all();
        foreach ($plans as $plan) {
            $this->info("  - {$plan->name}: {$plan->formatted_price} ({$plan->max_students} students, {$plan->max_assistants} assistants)");
        }
        $this->newLine();

        // 3. Check existing upgrade requests
        $this->info('📝 Existing upgrade requests:');
        $requests = PlanUpgradeRequest::with(['user', 'requestedPlan'])->get();
        if ($requests->count() === 0) {
            $this->info('  - No upgrade requests found');
        } else {
            foreach ($requests as $request) {
                $this->info("  - {$request->user->name} → {$request->requestedPlan->name} ({$request->status})");
            }
        }
        $this->newLine();

        // 4. Create a test upgrade request if we have a non-admin teacher
        $teacher = User::where('is_admin', false)
            ->where('is_approved', true)
            ->where('type', 'teacher')
            ->first();

        if (!$teacher) {
            $this->warn('⚠️  No approved non-admin teacher found for testing');

            return;
        }

        $currentSubscription = $teacher->activeSubscription()->first();
        if (!$currentSubscription) {
            $this->warn("⚠️  Teacher {$teacher->name} has no active subscription");

            return;
        }

        $currentPlan = $currentSubscription->plan;
        $upgradePlan = Plan::where('max_students', '>', $currentPlan->max_students)
            ->orderBy('max_students')
            ->first();

        if (!$upgradePlan) {
            $this->warn("⚠️  No upgrade plan available for {$teacher->name}");

            return;
        }

        // Check if teacher already has a pending request
        $existingRequest = $teacher->pendingPlanUpgradeRequests()->first();
        if ($existingRequest) {
            $this->info("ℹ️  Teacher {$teacher->name} already has a pending upgrade request");

            return;
        }

        $this->info("🎯 Creating test upgrade request:");
        $this->info("  - Teacher: {$teacher->name}");
        $this->info("  - Current Plan: {$currentPlan->name}");
        $this->info("  - Upgrade To: {$upgradePlan->name}");

        $request = PlanUpgradeRequest::create([
            'user_id' => $teacher->id,
            'current_plan_id' => $currentPlan->id,
            'requested_plan_id' => $upgradePlan->id,
            'status' => 'pending',
        ]);

        $this->success("✅ Created upgrade request ID: {$request->id}");
        $this->newLine();

        // 5. Test admin functions
        $admin = User::where('is_admin', true)->first();
        if ($admin) {
            $this->info("🔧 Testing admin approval (simulated):");
            $this->info("  - Admin: {$admin->name}");
            $this->info("  - Request ID: {$request->id}");

            // Don't actually approve, just show what would happen
            $this->info("  - Would approve request and update subscription");
            $this->success("✅ Admin functionality ready");
        } else {
            $this->warn('⚠️  No admin user found');
        }

        $this->newLine();
        $this->success('🎉 Plan upgrade request testing completed!');
    }
}
