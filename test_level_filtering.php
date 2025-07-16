<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Student;
use App\Models\AcademicYear;

echo "Testing Level Filtering Implementation\n";
echo "=====================================\n\n";

// Check total students
$totalStudents = Student::count();
echo "Total Students: {$totalStudents}\n\n";

// Check students by level
$levels = ['ابتدائي', 'إعدادي', 'ثانوي', 'جامعي'];
foreach ($levels as $level) {
    $count = Student::where('level', $level)->count();
    echo "Students with level '{$level}': {$count}\n";
}

// Check students without level
$noLevelCount = Student::whereNull('level')->orWhere('level', '')->count();
echo "Students without level: {$noLevelCount}\n\n";

// Check academic years grouped by level
echo "Academic Years by Level:\n";
$academicYears = AcademicYear::getGroupedByLevel();
foreach ($academicYears as $level => $years) {
    echo "  {$level}: " . count($years) . " academic years\n";
}

echo "\nTest completed successfully!\n";
