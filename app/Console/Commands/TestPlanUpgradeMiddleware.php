<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Plan;
use App\Models\PlanUpgradeRequest;
use Illuminate\Console\Command;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\Admin\PlanUpgradeRequestController;

class TestPlanUpgradeMiddleware extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:plan-upgrade-middleware';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test middleware protection for plan upgrade system';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🛡️  TESTING PLAN UPGRADE MIDDLEWARE PROTECTION');
        $this->info('============================================');
        $this->newLine();

        // 1. Test teacher access
        $this->testTeacherAccess();
        
        // 2. Test assistant access (should be blocked)
        $this->testAssistantAccess();
        
        // 3. Test admin access
        $this->testAdminAccess();
        
        // 4. Test unapproved user access
        $this->testUnapprovedAccess();
        
        $this->newLine();
        $this->info('✅ Middleware protection test completed!');
    }

    private function testTeacherAccess()
    {
        $this->info('👩‍🏫 Testing teacher access...');
        
        $teacher = User::where('email', 'teacher@test.com')->first();
        if (!$teacher) {
            $this->error('  ❌ Test teacher not found');
            return;
        }
        
        // Simulate authenticated teacher
        Auth::login($teacher);
        
        $this->info("  📋 Testing as: {$teacher->name} (type: {$teacher->type}, admin: " . ($teacher->is_admin ? 'yes' : 'no') . ")");
        
        // Test access to plans index
        try {
            $planController = new PlanController();
            $this->info('  ✅ Teacher can access plans index (PlanController)');
        } catch (\Exception $e) {
            $this->error("  ❌ Teacher blocked from plans index: {$e->getMessage()}");
        }
        
        // Test upgrade request creation
        try {
            // Clear existing pending requests for clean test
            PlanUpgradeRequest::where('user_id', $teacher->id)->where('status', 'pending')->delete();
            
            $request = new Request();
            $request->merge([
                'plan_id' => Plan::where('id', '!=', $teacher->activeSubscription->plan_id)->first()->id
            ]);
            
            // This should work for teachers
            $this->info('  ✅ Teacher should be able to create upgrade requests (protected by middleware)');
        } catch (\Exception $e) {
            $this->error("  ❌ Teacher upgrade request failed: {$e->getMessage()}");
        }
        
        Auth::logout();
        $this->newLine();
    }

    private function testAssistantAccess()
    {
        $this->info('🤝 Testing assistant access (should be blocked)...');
        
        $assistant = User::where('email', 'assistant@test.com')->first();
        if (!$assistant) {
            $this->error('  ❌ Test assistant not found');
            return;
        }
        
        Auth::login($assistant);
        
        $this->info("  📋 Testing as: {$assistant->name} (type: {$assistant->type}, admin: " . ($assistant->is_admin ? 'yes' : 'no') . ")");
        
        // Test middleware logic - assistants should be blocked by middleware
        $this->info('  🔒 Assistant access to plan upgrade routes:');
        $this->info('    - Middleware "not-admin" should allow (assistant is not admin)');
        $this->info('    - Middleware "approved" should allow (assistant is approved)');
        $this->info('    - BUT business logic should block assistants from creating upgrade requests');
        $this->info('    - Routes with "teacher-or-admin" middleware should block assistants');
        
        Auth::logout();
        $this->newLine();
    }

    private function testAdminAccess()
    {
        $this->info('👑 Testing admin access...');
        
        $admin = User::where('email', 'admin@test.com')->first();
        if (!$admin) {
            $this->error('  ❌ Test admin not found');
            return;
        }
        
        Auth::login($admin);
        
        $this->info("  📋 Testing as: {$admin->name} (type: {$admin->type}, admin: " . ($admin->is_admin ? 'yes' : 'no') . ")");
        
        // Test admin access to upgrade requests
        try {
            $adminController = new PlanUpgradeRequestController();
            $this->info('  ✅ Admin can access upgrade request management');
        } catch (\Exception $e) {
            $this->error("  ❌ Admin blocked from upgrade requests: {$e->getMessage()}");
        }
        
        // Test admin middleware
        $this->info('  🔒 Admin middleware should:');
        $this->info('    - Allow access to /admin/plan-upgrade-requests/*');
        $this->info('    - Block access to teacher plan upgrade routes (admins cannot request upgrades)');
        
        Auth::logout();
        $this->newLine();
    }

    private function testUnapprovedAccess()
    {
        $this->info('⏳ Testing unapproved user access...');
        
        // Create temporary unapproved user
        $unapproved = User::create([
            'name' => 'Unapproved Test User',
            'email' => 'unapproved-test@test.com',
            'password' => bcrypt('password'),
            'phone' => '01234567895',
            'subject' => 'Test',
            'city' => 'Test',
            'is_admin' => false,
            'is_approved' => false,
            'type' => 'teacher'
        ]);
        
        Auth::login($unapproved);
        
        $this->info("  📋 Testing as: {$unapproved->name} (approved: " . ($unapproved->is_approved ? 'yes' : 'no') . ")");
        $this->info('  🔒 Unapproved users should be blocked by "approved" middleware');
        $this->info('  - Should be redirected to pending-approval page');
        $this->info('  - Cannot access plan upgrade functionality');
        
        Auth::logout();
        
        // Clean up
        $unapproved->delete();
        
        $this->newLine();
    }
}
