<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Per-session groups:\n";
$perSessionGroups = \App\Models\Group::where('payment_type', 'per_session')->with('assignedStudents')->get();
foreach ($perSessionGroups as $group) {
    echo "- {$group->name} (Price: {$group->student_price}, Students: {$group->assignedStudents->count()})\n";
}

echo "\nMonthly groups:\n";
$monthlyGroups = \App\Models\Group::where('payment_type', 'monthly')->with('assignedStudents')->get();
foreach ($monthlyGroups as $group) {
    echo "- {$group->name} (Price: {$group->student_price}, Students: {$group->assignedStudents->count()})\n";
}

echo "\nExisting payments:\n";
$payments = \App\Models\Payment::with(['student', 'group'])->get();
foreach ($payments as $payment) {
    echo "- {$payment->student->name} in {$payment->group->name} ({$payment->payment_type}) - {$payment->related_date} - {$payment->amount} SAR - " . ($payment->is_paid ? 'PAID' : 'UNPAID') . "\n";
}
