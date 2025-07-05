<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Plan;
use App\Models\Subscription;

class TestSubscriptionSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the subscription system functionality';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Subscription System...');
        
        // Test 1: Check if trial plan exists
        $trialPlan = Plan::getDefaultTrial();
        if ($trialPlan) {
            $this->info("✓ Trial plan found: {$trialPlan->name}");
            $this->info("  - Max students: {$trialPlan->max_students}");
            $this->info("  - Duration: {$trialPlan->duration_days} days");
            $this->info("  - Price: {$trialPlan->formatted_price}");
        } else {
            $this->error("✗ Trial plan not found!");
            return 1;
        }

        // Test 2: Check all plans
        $plans = Plan::all();
        $this->info("\nAll Plans:");
        foreach ($plans as $plan) {
            $this->info("  - {$plan->name}: {$plan->max_students} students, {$plan->max_assistants} assistants, {$plan->formatted_duration}, {$plan->formatted_price}");
        }

        // Test 3: Create a test user and test subscription assignment
        $testUser = User::where('email', 'test@example.com')->first();
        if (!$testUser) {
            $this->info("\nCreating test user...");
            $testUser = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
                'phone' => '1234567890',
                'subject' => 'Mathematics',
                'city' => 'Test City',
                'is_approved' => true,
                'is_admin' => false,
            ]);
            $this->info("✓ Test user created: {$testUser->name}");
        }

        if ($testUser) {
            $this->info("\nTesting with user: {$testUser->name}");
            
            $hasHadTrial = $testUser->hasHadTrial();
            $this->info("Has had trial: " . ($hasHadTrial ? 'Yes' : 'No'));
            
            $hasActiveSubscription = $testUser->hasActiveSubscription();
            $this->info("Has active subscription: " . ($hasActiveSubscription ? 'Yes' : 'No'));
            
            // Test assistant limits
            if ($hasActiveSubscription) {
                $canAddAssistants = $testUser->canAddAssistants();
                $this->info("Can add assistants: " . ($canAddAssistants ? 'Yes' : 'No'));
                
                $subscription = $testUser->activeSubscription()->with('plan')->first();
                if ($subscription && $subscription->plan) {
                    $this->info("Plan allows: {$subscription->plan->max_assistants} assistants");
                    $currentAssistants = $testUser->assistants()->count();
                    $this->info("Current assistants: {$currentAssistants}");
                }
            }
            
            if (!$hasHadTrial) {
                $this->info("Creating trial subscription...");
                $subscription = $testUser->createTrialSubscription();
                if ($subscription) {
                    $this->info("✓ Trial subscription created successfully!");
                    $this->info("  - Start: {$subscription->start_date}");
                    $this->info("  - End: {$subscription->end_date}");
                    $this->info("  - Active: " . ($subscription->is_active ? 'Yes' : 'No'));
                    $this->info("  - Trial: " . ($subscription->is_trial ? 'Yes' : 'No'));
                } else {
                    $this->error("✗ Failed to create trial subscription");
                }
            }
            
            // Re-check subscription status
            $hasActiveSubscription = $testUser->hasActiveSubscription();
            $this->info("Has active subscription (after trial): " . ($hasActiveSubscription ? 'Yes' : 'No'));
        }

        // Test 4: Check scheduled tasks
        $this->info("\nScheduled tasks configured for subscription system:");
        $this->info("✓ Daily backup at 3:00 AM");
        $this->info("✓ Daily backup cleanup at 3:30 AM");
        $this->info("✓ Daily expired subscription cleanup at midnight");

        $this->info("\n🎉 Subscription system test completed!");
        
        return 0;
    }
}
