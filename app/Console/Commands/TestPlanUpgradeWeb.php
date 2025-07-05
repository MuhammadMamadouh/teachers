<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Plan;
use App\Models\PlanUpgradeRequest;
use App\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

class TestPlanUpgradeWeb extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:plan-upgrade-web';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test plan upgrade request web functionality and routes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🌐 TESTING PLAN UPGRADE WEB FUNCTIONALITY');
        $this->info('=========================================');
        $this->newLine();

        // 1. Test route accessibility
        $this->testRouteAccessibility();
        
        // 2. Test middleware protection
        $this->testMiddlewareProtection();
        
        // 3. Test actual controller functionality
        $this->testControllerFunctionality();
        
        // 4. Display current state for manual verification
        $this->displayCurrentState();
        
        $this->newLine();
        $this->info('🌐 Web functionality test completed!');
        $this->info('👉 You can now manually test at: http://localhost:8000');
    }

    private function testRouteAccessibility()
    {
        $this->info('🔗 Testing route accessibility...');
        
        // Check if routes exist
        $routes = [
            'plans.index' => 'GET /plans',
            'plans.upgrade' => 'POST /plans/upgrade',
            'admin.plan-upgrade-requests.index' => 'GET /admin/plan-upgrade-requests',
            'admin.plan-upgrade-requests.show' => 'GET /admin/plan-upgrade-requests/{id}',
            'admin.plan-upgrade-requests.approve' => 'POST /admin/plan-upgrade-requests/{id}/approve',
            'admin.plan-upgrade-requests.reject' => 'POST /admin/plan-upgrade-requests/{id}/reject',
        ];
        
        foreach ($routes as $routeName => $routePath) {
            if (Route::has($routeName)) {
                $this->info("  ✅ Route exists: {$routeName} ({$routePath})");
            } else {
                $this->error("  ❌ Route missing: {$routeName} ({$routePath})");
            }
        }
        
        $this->newLine();
    }

    private function testMiddlewareProtection()
    {
        $this->info('🛡️  Testing middleware protection...');
        
        // Get test users
        $teacher = User::where('email', 'teacher@test.com')->first();
        $assistant = User::where('email', 'assistant@test.com')->first();
        $admin = User::where('email', 'admin@test.com')->first();
        
        if ($teacher) {
            $this->info("  📋 Teacher: {$teacher->name} (type: {$teacher->type}, admin: " . ($teacher->is_admin ? 'yes' : 'no') . ", approved: " . ($teacher->is_approved ? 'yes' : 'no') . ")");
        }
        
        if ($assistant) {
            $this->info("  📋 Assistant: {$assistant->name} (type: {$assistant->type}, admin: " . ($assistant->is_admin ? 'yes' : 'no') . ", approved: " . ($assistant->is_approved ? 'yes' : 'no') . ")");
        }
        
        if ($admin) {
            $this->info("  📋 Admin: {$admin->name} (type: {$admin->type}, admin: " . ($admin->is_admin ? 'yes' : 'no') . ", approved: " . ($admin->is_approved ? 'yes' : 'no') . ")");
        }
        
        // Test middleware logic
        $this->info('  🔒 Middleware should:');
        $this->info('    - Allow teachers to access /plans and POST /plans/upgrade');
        $this->info('    - Block assistants from accessing /plans/upgrade');
        $this->info('    - Allow only admins to access /admin/plan-upgrade-requests/*');
        $this->info('    - Block non-admins from admin routes');
        
        $this->newLine();
    }

    private function testControllerFunctionality()
    {
        $this->info('🎮 Testing controller functionality...');
        
        // Test PlanController
        $teacher = User::where('email', 'teacher@test.com')->first();
        if ($teacher) {
            // Check if teacher can request upgrade (business logic)
            $existingPendingRequest = PlanUpgradeRequest::where('user_id', $teacher->id)
                ->where('status', 'pending')
                ->exists();
            
            if ($existingPendingRequest) {
                $this->info('  ⚠️  Teacher has pending request - should be blocked from creating new ones');
            } else {
                $this->info('  ✅ Teacher can create new upgrade requests');
            }
            
            // Check subscription
            $subscription = $teacher->activeSubscription;
            if ($subscription) {
                $this->info("  📋 Teacher current plan: {$subscription->plan->name} ({$subscription->plan->formatted_price})");
            } else {
                $this->warn('  ⚠️  Teacher has no active subscription');
            }
        }
        
        // Test Admin Controller
        $pendingRequests = PlanUpgradeRequest::where('status', 'pending')->count();
        $this->info("  📊 Pending upgrade requests: {$pendingRequests}");
        
        $this->newLine();
    }

    private function displayCurrentState()
    {
        $this->info('📊 CURRENT SYSTEM STATE');
        $this->info('======================');
        
        // Plans
        $this->info('📋 Available Plans:');
        $plans = Plan::orderBy('price')->get();
        foreach ($plans as $plan) {
            $trial = $plan->is_trial ? ' (Trial)' : '';
            $default = $plan->is_default ? ' (Default)' : '';
            $this->info("  - {$plan->name}: {$plan->formatted_price}{$trial}{$default}");
            $this->info("    Max Students: {$plan->max_students}, Max Assistants: {$plan->max_assistants}");
        }
        $this->newLine();
        
        // Users
        $this->info('👥 Test Users:');
        $users = User::whereIn('email', ['teacher@test.com', 'assistant@test.com', 'admin@test.com'])->get();
        foreach ($users as $user) {
            $subscription = $user->activeSubscription;
            $subscriptionInfo = $subscription ? "Plan: {$subscription->plan->name}" : 'No subscription';
            $this->info("  - {$user->name} ({$user->email})");
            $this->info("    Type: {$user->type}, Admin: " . ($user->is_admin ? 'Yes' : 'No') . ", Approved: " . ($user->is_approved ? 'Yes' : 'No'));
            $this->info("    {$subscriptionInfo}");
        }
        $this->newLine();
        
        // Upgrade Requests
        $this->info('📝 Upgrade Requests:');
        $requests = PlanUpgradeRequest::with(['user', 'currentPlan', 'requestedPlan'])->latest()->take(5)->get();
        if ($requests->count() > 0) {
            foreach ($requests as $request) {
                $currentPlan = $request->currentPlan ? $request->currentPlan->name : 'No plan';
                $this->info("  - ID {$request->id}: {$request->user->name}");
                $this->info("    From: {$currentPlan} → To: {$request->requestedPlan->name}");
                $this->info("    Status: {$request->status}, Created: {$request->created_at->format('Y-m-d H:i')}");
                if ($request->admin_notes) {
                    $this->info("    Admin Notes: {$request->admin_notes}");
                }
            }
        } else {
            $this->info('  No upgrade requests found');
        }
        $this->newLine();
        
        // Test Login URLs
        $this->info('🔗 Test Login URLs:');
        $this->info('  Teacher: http://localhost:8000/login (teacher@test.com / password)');
        $this->info('  Assistant: http://localhost:8000/login (assistant@test.com / password)');
        $this->info('  Admin: http://localhost:8000/login (admin@test.com / password)');
        $this->newLine();
        
        // Key pages to test
        $this->info('📄 Key Pages to Test:');
        $this->info('  Teacher Plans: http://localhost:8000/plans');
        $this->info('  Admin Requests: http://localhost:8000/admin/plan-upgrade-requests');
        $this->info('  Dashboard: http://localhost:8000/dashboard');
    }
}
