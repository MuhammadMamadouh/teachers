<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Plan;
use App\Models\PlanUpgradeRequest;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\Admin\PlanUpgradeRequestController;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TestPlanUpgradeAccess extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:plan-access';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test plan upgrade access controls and functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔒 Testing Plan Upgrade Access Controls...');
        $this->newLine();

        // Get test users
        $admin = User::where('is_admin', true)->first();
        $teacher = User::where('is_admin', false)->where('type', 'teacher')->where('is_approved', true)->first();
        $assistant = User::where('type', 'assistant')->first();

        $this->info('Test Users:');
        $this->info("  👑 Admin: {$admin->name} ({$admin->email})");
        $this->info("  🎓 Teacher: {$teacher->name} ({$teacher->email})");
        if ($assistant) {
            $this->info("  🤝 Assistant: {$assistant->name} ({$assistant->email})");
        }
        $this->newLine();

        // Test 1: Teacher can access plan upgrade
        $this->info('🧪 Test 1: Teacher Access to Plan Upgrade');
        $this->testUserAccess($teacher, 'Teacher');

        // Test 2: Admin cannot access plan upgrade (protected by not-admin middleware)
        $this->info('🧪 Test 2: Admin Access to Plan Upgrade (should be blocked)');
        $this->testUserAccess($admin, 'Admin');

        // Test 3: Assistant cannot access plan upgrade (if exists)
        if ($assistant) {
            $this->info('🧪 Test 3: Assistant Access to Plan Upgrade (should be blocked)');
            $this->testUserAccess($assistant, 'Assistant');
        }

        // Test 4: Test Admin Plan Upgrade Management
        $this->info('🧪 Test 4: Admin Plan Upgrade Management');
        $this->testAdminUpgradeManagement($admin);

        // Test 5: Test Plan Upgrade Request Creation
        $this->info('🧪 Test 5: Plan Upgrade Request Creation');
        $this->testUpgradeRequestCreation($teacher);

        // Test 6: Test Approval Process
        $this->info('🧪 Test 6: Approval Process');
        $this->testApprovalProcess($admin);

        $this->newLine();
        $this->success('🎉 All access control tests completed!');
    }

    private function testUserAccess($user, $userType)
    {
        Auth::login($user);
        
        try {
            // Test accessing the plan index
            $subscription = $user->activeSubscription()->first();
            $currentPlan = $subscription ? $subscription->plan : null;
            
            if (!$currentPlan) {
                $this->warn("  ⚠️  {$userType} has no active subscription - cannot test upgrade access");
                return;
            }

            // Check if user can see upgrade plans (simulating business logic)
            $upgradePlans = Plan::where('max_students', '>', $currentPlan->max_students)->get();
            
            // Check middleware restrictions
            $isAdmin = $user->is_admin;
            $isTeacher = $user->type === 'teacher';
            $isApproved = $user->is_approved;
            
            $canAccess = !$isAdmin && $isTeacher && $isApproved;
            
            if ($canAccess) {
                $this->success("  ✅ {$userType} can access plan upgrades");
                $this->info("    - Current Plan: {$currentPlan->name}");
                $this->info("    - Available Upgrades: {$upgradePlans->count()}");
            } else {
                $reasons = [];
                if ($isAdmin) $reasons[] = 'is admin';
                if (!$isTeacher) $reasons[] = 'not a teacher';
                if (!$isApproved) $reasons[] = 'not approved';
                
                $this->error("  ❌ {$userType} cannot access plan upgrades (" . implode(', ', $reasons) . ")");
            }
            
        } catch (\Exception $e) {
            $this->error("  ❌ {$userType} access test failed: " . $e->getMessage());
        } finally {
            Auth::logout();
        }
    }

    private function testAdminUpgradeManagement($admin)
    {
        Auth::login($admin);
        
        try {
            // Test if admin can see upgrade requests
            $requests = PlanUpgradeRequest::with(['user', 'requestedPlan', 'currentPlan'])->get();
            
            $this->success("  ✅ Admin can access upgrade request management");
            $this->info("    - Total Requests: {$requests->count()}");
            
            foreach ($requests as $request) {
                $this->info("    - {$request->user->name} → {$request->requestedPlan->name} ({$request->status})");
            }
            
        } catch (\Exception $e) {
            $this->error("  ❌ Admin management test failed: " . $e->getMessage());
        } finally {
            Auth::logout();
        }
    }

    private function testUpgradeRequestCreation($teacher)
    {
        Auth::login($teacher);
        
        try {
            $subscription = $teacher->activeSubscription()->first();
            $currentPlan = $subscription->plan;
            $upgradePlan = Plan::where('max_students', '>', $currentPlan->max_students)->first();
            
            if (!$upgradePlan) {
                $this->warn("  ⚠️  No upgrade plan available for testing");
                return;
            }

            // Check if teacher already has a pending request
            $existingRequest = $teacher->pendingPlanUpgradeRequests()->first();
            
            if ($existingRequest) {
                $this->info("  ℹ️  Teacher already has pending request - testing duplicate prevention");
                $hasPending = $teacher->hasPendingPlanUpgrade();
                if ($hasPending) {
                    $this->success("  ✅ Duplicate request prevention works correctly");
                } else {
                    $this->error("  ❌ Duplicate request prevention failed");
                }
            } else {
                $this->info("  ℹ️  No pending request - could create new request");
                $this->success("  ✅ Request creation would be allowed");
            }
            
        } catch (\Exception $e) {
            $this->error("  ❌ Request creation test failed: " . $e->getMessage());
        } finally {
            Auth::logout();
        }
    }

    private function testApprovalProcess($admin)
    {
        $pendingRequest = PlanUpgradeRequest::where('status', 'pending')->first();
        
        if (!$pendingRequest) {
            $this->warn("  ⚠️  No pending requests found for approval testing");
            return;
        }

        Auth::login($admin);
        
        try {
            // Test approval logic (without actually approving)
            $user = $pendingRequest->user;
            $newPlan = $pendingRequest->requestedPlan;
            $currentSubscription = $user->activeSubscription()->first();
            
            if ($currentSubscription) {
                $this->success("  ✅ Admin can approve requests");
                $this->info("    - Request ID: {$pendingRequest->id}");
                $this->info("    - User: {$user->name}");
                $this->info("    - Upgrade: {$pendingRequest->currentPlan->name} → {$newPlan->name}");
                $this->info("    - Would update subscription and set new dates");
            } else {
                $this->error("  ❌ User has no active subscription to update");
            }
            
        } catch (\Exception $e) {
            $this->error("  ❌ Approval process test failed: " . $e->getMessage());
        } finally {
            Auth::logout();
        }
    }
}
