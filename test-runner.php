#!/usr/bin/env php
<?php

/**
 * Test Coverage Report Generator for Teachers SaaS Application
 * 
 * This script runs comprehensive tests and generates coverage reports
 * to ensure 100% test coverage across the application.
 */

// Set up Laravel environment
$autoloader = require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;

$app = new Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

// Colors for terminal output
$colors = [
    'green' => "\033[32m",
    'red' => "\033[31m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'reset' => "\033[0m"
];

function colorOutput($text, $color = 'reset') {
    global $colors;
    return $colors[$color] . $text . $colors['reset'];
}

echo colorOutput("🧪 Teachers SaaS Test Suite Runner\n", 'blue');
echo colorOutput("=====================================\n", 'blue');

// Test suites to run
$testSuites = [
    'Unit Tests' => [
        'path' => 'tests/Unit',
        'description' => 'Testing individual components in isolation'
    ],
    'Feature Tests' => [
        'path' => 'tests/Feature',
        'description' => 'Testing complete user workflows and API endpoints'
    ],
    'Integration Tests' => [
        'path' => 'tests/Integration',
        'description' => 'Testing component interactions and data flow'
    ]
];

$totalTests = 0;
$passedTests = 0;
$failedTests = 0;

foreach ($testSuites as $suiteName => $suite) {
    echo colorOutput("\n📋 Running {$suiteName}\n", 'yellow');
    echo colorOutput("Description: {$suite['description']}\n", 'yellow');
    echo colorOutput(str_repeat('-', 50) . "\n", 'yellow');
    
    if (is_dir($suite['path'])) {
        $command = "php artisan test {$suite['path']} --stop-on-failure";
        $output = [];
        $returnCode = 0;
        
        exec($command, $output, $returnCode);
        
        if ($returnCode === 0) {
            echo colorOutput("✅ {$suiteName} PASSED\n", 'green');
            $passedTests++;
        } else {
            echo colorOutput("❌ {$suiteName} FAILED\n", 'red');
            $failedTests++;
            echo implode("\n", $output) . "\n";
        }
    } else {
        echo colorOutput("⚠️  Directory {$suite['path']} not found, skipping...\n", 'yellow');
    }
    
    $totalTests++;
}

// Generate coverage report
echo colorOutput("\n📊 Generating Coverage Report\n", 'blue');
echo colorOutput(str_repeat('=', 50) . "\n", 'blue');

$coverageCommand = "php artisan test --coverage-html=tests/coverage --coverage-clover=tests/coverage/clover.xml";
$coverageOutput = [];
$coverageReturn = 0;

exec($coverageCommand, $coverageOutput, $coverageReturn);

if ($coverageReturn === 0) {
    echo colorOutput("✅ Coverage report generated in tests/coverage/\n", 'green');
} else {
    echo colorOutput("❌ Failed to generate coverage report\n", 'red');
}

// Summary
echo colorOutput("\n📈 Test Summary\n", 'blue');
echo colorOutput(str_repeat('=', 50) . "\n", 'blue');
echo colorOutput("Total Test Suites: {$totalTests}\n", 'blue');
echo colorOutput("Passed: {$passedTests}\n", 'green');
echo colorOutput("Failed: {$failedTests}\n", 'red');

$successRate = $totalTests > 0 ? round(($passedTests / $totalTests) * 100, 2) : 0;
echo colorOutput("Success Rate: {$successRate}%\n", $successRate >= 95 ? 'green' : 'red');

if ($successRate >= 95) {
    echo colorOutput("\n🎉 Excellent! Test coverage meets the 95% threshold!\n", 'green');
} else {
    echo colorOutput("\n⚠️  Test coverage below 95% threshold. Please add more tests.\n", 'yellow');
}

// Test guidelines
echo colorOutput("\n📚 Test Coverage Guidelines\n", 'blue');
echo colorOutput(str_repeat('=', 50) . "\n", 'blue');
echo "1. All models should have comprehensive unit tests\n";
echo "2. All controllers should have feature tests\n";
echo "3. All middleware should have unit tests\n";
echo "4. All API endpoints should have integration tests\n";
echo "5. All user workflows should have feature tests\n";
echo "6. Edge cases and error scenarios should be tested\n";
echo "7. Database relationships should be tested\n";
echo "8. Authentication and authorization should be tested\n";

echo colorOutput("\n🏁 Test suite completed!\n", 'blue');

exit($failedTests > 0 ? 1 : 0);
