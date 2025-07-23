<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing subscription statistics...\n\n";

// Check centers and their subscriptions
$centers = \App\Models\Center::with('activeSubscription.plan')->get();

foreach ($centers as $center) {
    echo "Center: {$center->name}\n";
    
    $subscription = $center->activeSubscription;
    if ($subscription) {
        echo "  Subscription: Active\n";
        echo "  Status: " . ($subscription->is_active ? 'Active' : 'Inactive') . "\n";
        
        if ($subscription->plan) {
            echo "  Plan: {$subscription->plan->name}\n";
            echo "  Max Students: {$subscription->plan->max_students}\n";
            echo "  Price: {$subscription->plan->price} EGP\n";
        }
        
        if ($subscription->end_date) {
            $daysRemaining = $subscription->getDaysRemainingAttribute();
            echo "  Days Remaining: {$daysRemaining}\n";
            echo "  Expires: {$subscription->end_date->toDateString()}\n";
        }
    } else {
        echo "  Subscription: None\n";
    }
    echo "\n";
}

// Check available plans
echo "Available Plans:\n";
$plans = \App\Models\Plan::all();
foreach ($plans as $plan) {
    echo "  - {$plan->name}: {$plan->max_students} students, {$plan->price} EGP\n";
}
