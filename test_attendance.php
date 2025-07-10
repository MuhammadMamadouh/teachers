<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing per-session payment creation...\n\n";

$perSessionGroup = \App\Models\Group::where('payment_type', 'per_session')->first();
echo "Group: {$perSessionGroup->name}\n";
echo "Price per session: {$perSessionGroup->student_price} SAR\n";
echo "Students in group:\n";

foreach ($perSessionGroup->assignedStudents as $student) {
    echo "- {$student->name} (ID: {$student->id})\n";
}

// Test creating attendance for today (should create a payment)
$testDate = now()->format('Y-m-d');
$testStudent = $perSessionGroup->assignedStudents->first();

echo "\nTesting attendance creation for {$testStudent->name} on {$testDate}...\n";

// Check if attendance already exists
$existingAttendance = \App\Models\Attendance::where([
    'student_id' => $testStudent->id,
    'group_id' => $perSessionGroup->id,
    'date' => $testDate,
])->first();

if ($existingAttendance) {
    echo "Attendance already exists: " . ($existingAttendance->is_present ? 'PRESENT' : 'ABSENT') . "\n";
} else {
    echo "No attendance record exists for today\n";
}

// Check if payment already exists for today
$existingPayment = \App\Models\Payment::where([
    'student_id' => $testStudent->id,
    'group_id' => $perSessionGroup->id,
    'related_date' => $testDate,
])->first();

if ($existingPayment) {
    echo "Payment already exists for today: {$existingPayment->amount} SAR - " . ($existingPayment->is_paid ? 'PAID' : 'UNPAID') . "\n";
} else {
    echo "No payment record exists for today\n";
}
