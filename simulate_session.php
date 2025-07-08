<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Simulating attendance marking for per-session group...\n\n";

$perSessionGroup = \App\Models\Group::where('payment_type', 'per_session')->first();
$testStudent = $perSessionGroup->assignedStudents->first();
$testDate = now()->format('Y-m-d');

echo "Group: {$perSessionGroup->name}\n";
echo "Student: {$testStudent->name}\n";
echo "Date: {$testDate}\n";
echo "Session price: {$perSessionGroup->student_price} SAR\n\n";

echo "Step 1: Creating attendance record (student present)...\n";

// Create attendance record (simulating what the AttendanceController does)
$attendance = \App\Models\Attendance::updateOrCreate(
    [
        'student_id' => $testStudent->id,
        'group_id' => $perSessionGroup->id,
        'date' => $testDate,
    ],
    [
        'is_present' => true,
        'notes' => 'Test attendance - present',
    ]
);

echo "✅ Attendance created: " . ($attendance->is_present ? 'PRESENT' : 'ABSENT') . "\n\n";

echo "Step 2: Creating per-session payment (automatic)...\n";

// Create payment record (simulating what happens when student is present in per-session group)
if ($perSessionGroup->payment_type === 'per_session' && $attendance->is_present) {
    $payment = \App\Models\Payment::updateOrCreate(
        [
            'group_id' => $perSessionGroup->id,
            'student_id' => $testStudent->id,
            'related_date' => $testDate,
        ],
        [
            'payment_type' => 'per_session',
            'amount' => $perSessionGroup->student_price,
            'is_paid' => false,
        ]
    );
    
    echo "✅ Payment created automatically:\n";
    echo "   - Type: {$payment->payment_type}\n";
    echo "   - Amount: {$payment->amount} SAR\n";
    echo "   - Date: {$payment->related_date}\n";
    echo "   - Status: " . ($payment->is_paid ? 'PAID' : 'UNPAID') . "\n";
} else {
    echo "❌ No payment created (conditions not met)\n";
}

echo "\nStep 3: Teacher can later mark payment as received...\n";

// Simulate teacher marking payment as paid
$payment->update([
    'is_paid' => true,
    'paid_at' => now(),
]);

echo "✅ Payment marked as PAID at " . $payment->paid_at . "\n";

echo "\nFinal verification:\n";
echo "Total payments for this student in this group: " . 
    \App\Models\Payment::where('student_id', $testStudent->id)
        ->where('group_id', $perSessionGroup->id)
        ->count() . "\n";

echo "Total unpaid sessions: " . 
    \App\Models\Payment::where('student_id', $testStudent->id)
        ->where('group_id', $perSessionGroup->id)
        ->where('is_paid', false)
        ->count() . "\n";

echo "Total revenue from this student: " . 
    \App\Models\Payment::where('student_id', $testStudent->id)
        ->where('group_id', $perSessionGroup->id)
        ->where('is_paid', true)
        ->sum('amount') . " SAR\n";
