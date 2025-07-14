<?php

// Manual test script to verify schedule conflict validation
// Run this with: php manual_test_schedule_validation.php

require_once __DIR__ . '/../bootstrap/app.php';

use App\Models\User;
use App\Models\Group;
use App\Models\GroupSchedule;
use App\Models\AcademicYear;
use App\Http\Requests\StoreGroupRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

$app = require_once __DIR__ . '/../bootstrap/app.php';

// Create test user
$user = User::factory()->create([
    'name' => 'Test Teacher',
    'email' => 'teacher@test.com',
    'type' => 'teacher',
    'is_approved' => true,
]);

// Create academic year
$academicYear = AcademicYear::factory()->create([
    'name_ar' => 'الصف الأول',
    'code' => 'grade1',
]);

// Login user
Auth::login($user);

echo "=== Testing Schedule Conflict Validation ===\n\n";

// Create first group
$firstGroup = Group::create([
    'user_id' => $user->id,
    'name' => 'مجموعة الرياضيات',
    'description' => 'مجموعة تدريس الرياضيات',
    'max_students' => 15,
    'is_active' => true,
    'payment_type' => 'monthly',
    'student_price' => 100,
    'academic_year_id' => $academicYear->id,
]);

// Add schedule to first group
GroupSchedule::create([
    'group_id' => $firstGroup->id,
    'day_of_week' => 1, // Monday
    'start_time' => '10:00',
    'end_time' => '12:00',
]);

echo "✓ Created first group with schedule: Monday 10:00 - 12:00\n";

// Test 1: Try to create overlapping schedule (should fail)
echo "\n--- Test 1: Creating overlapping schedule ---\n";
$request = new StoreGroupRequest();
$request->setContainer($app);

$data = [
    'name' => 'مجموعة الفيزياء',
    'description' => 'مجموعة تدريس الفيزياء',
    'max_students' => 10,
    'is_active' => true,
    'payment_type' => 'monthly',
    'student_price' => 120,
    'academic_year_id' => $academicYear->id,
    'schedules' => [
        [
            'day_of_week' => 1, // Monday
            'start_time' => '11:00', // Overlaps with existing schedule
            'end_time' => '13:00',
        ]
    ]
];

$request->merge($data);
$validator = Validator::make($data, $request->rules());
$request->withValidator($validator);

if ($validator->fails()) {
    echo "✓ PASS: Validation correctly detected schedule conflict\n";
    echo "   Error: " . $validator->errors()->first('schedules.0.start_time') . "\n";
} else {
    echo "✗ FAIL: Validation should have detected schedule conflict\n";
}

// Test 2: Try to create consecutive schedule (should pass)
echo "\n--- Test 2: Creating consecutive schedule ---\n";
$request2 = new StoreGroupRequest();
$request2->setContainer($app);

$data2 = [
    'name' => 'مجموعة الكيمياء',
    'description' => 'مجموعة تدريس الكيمياء',
    'max_students' => 12,
    'is_active' => true,
    'payment_type' => 'monthly',
    'student_price' => 110,
    'academic_year_id' => $academicYear->id,
    'schedules' => [
        [
            'day_of_week' => 1, // Monday
            'start_time' => '12:00', // Starts exactly when first ends
            'end_time' => '14:00',
        ]
    ]
];

$request2->merge($data2);
$validator2 = Validator::make($data2, $request2->rules());
$request2->withValidator($validator2);

if ($validator2->fails()) {
    echo "✗ FAIL: Validation should have allowed consecutive schedule\n";
    echo "   Error: " . $validator2->errors()->first('schedules.0.start_time') . "\n";
} else {
    echo "✓ PASS: Validation correctly allowed consecutive schedule\n";
}

// Test 3: Try to create schedule on different day (should pass)
echo "\n--- Test 3: Creating schedule on different day ---\n";
$request3 = new StoreGroupRequest();
$request3->setContainer($app);

$data3 = [
    'name' => 'مجموعة الأحياء',
    'description' => 'مجموعة تدريس الأحياء',
    'max_students' => 8,
    'is_active' => true,
    'payment_type' => 'monthly',
    'student_price' => 130,
    'academic_year_id' => $academicYear->id,
    'schedules' => [
        [
            'day_of_week' => 2, // Tuesday
            'start_time' => '10:00', // Same time but different day
            'end_time' => '12:00',
        ]
    ]
];

$request3->merge($data3);
$validator3 = Validator::make($data3, $request3->rules());
$request3->withValidator($validator3);

if ($validator3->fails()) {
    echo "✗ FAIL: Validation should have allowed schedule on different day\n";
    echo "   Error: " . $validator3->errors()->first('schedules.0.start_time') . "\n";
} else {
    echo "✓ PASS: Validation correctly allowed schedule on different day\n";
}

echo "\n=== All tests completed ===\n";
