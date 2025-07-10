<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Test Coverage Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration file defines the test coverage requirements and
    | settings for the Teachers SaaS application.
    |
    */

    'coverage' => [
        'minimum_percentage' => 95,
        'report_format' => 'html',
        'output_directory' => 'tests/coverage',
    ],

    'test_suites' => [
        'unit' => [
            'Models' => [
                'User' => 'Tests\Unit\Models\UserTest',
                'Plan' => 'Tests\Unit\Models\PlanTest',
                'Subscription' => 'Tests\Unit\Models\SubscriptionTest',
                'Student' => 'Tests\Unit\Models\StudentTest',
                'Group' => 'Tests\Unit\Models\GroupTest',
                'Attendance' => 'Tests\Unit\Models\AttendanceTest',
                'Payment' => 'Tests\Unit\Models\PaymentTest',
                'PlanUpgradeRequest' => 'Tests\Unit\Models\PlanUpgradeRequestTest',
                'AcademicYear' => 'Tests\Unit\Models\AcademicYearTest',
                'Governorate' => 'Tests\Unit\Models\GovernorateTest',
                'Feedback' => 'Tests\Unit\Models\FeedbackTest',
            ],
            'Middleware' => [
                'EnsureSubscriptionIsActive' => 'Tests\Unit\Middleware\EnsureSubscriptionIsActiveTest',
                'EnsureUserIsApproved' => 'Tests\Unit\Middleware\EnsureUserIsApprovedTest',
                'CheckOnboardingCompleted' => 'Tests\Unit\Middleware\CheckOnboardingCompletedTest',
                'EnsureUserCanManageAssistants' => 'Tests\Unit\Middleware\EnsureUserCanManageAssistantsTest',
                'CheckAssistantLimit' => 'Tests\Unit\Middleware\CheckAssistantLimitTest',
                'EnsureAssistantOwnership' => 'Tests\Unit\Middleware\EnsureAssistantOwnershipTest',
                'EnsureUserIsTeacherOrAdmin' => 'Tests\Unit\Middleware\EnsureUserIsTeacherOrAdminTest',
                'ScopeResourcesByTeacher' => 'Tests\Unit\Middleware\ScopeResourcesByTeacherTest',
            ],
        ],
        'feature' => [
            'Controllers' => [
                'AdminController' => 'Tests\Feature\Controllers\AdminControllerTest',
                'PlanController' => 'Tests\Feature\Controllers\PlanControllerTest',
                'StudentController' => 'Tests\Feature\Controllers\StudentControllerTest',
                'AssistantController' => 'Tests\Feature\Controllers\AssistantControllerTest',
                'DashboardController' => 'Tests\Feature\Controllers\DashboardControllerTest',
                'GroupController' => 'Tests\Feature\Controllers\GroupControllerTest',
                'AttendanceController' => 'Tests\Feature\Controllers\AttendanceControllerTest',
                'PaymentController' => 'Tests\Feature\Controllers\PaymentControllerTest',
                'SubscriptionController' => 'Tests\Feature\Controllers\SubscriptionControllerTest',
                'FeedbackController' => 'Tests\Feature\Controllers\FeedbackControllerTest',
            ],
            'Authentication' => [
                'Login' => 'Tests\Feature\Auth\AuthenticationTest',
                'Registration' => 'Tests\Feature\Auth\RegistrationTest',
                'PasswordReset' => 'Tests\Feature\Auth\PasswordResetTest',
                'EmailVerification' => 'Tests\Feature\Auth\EmailVerificationTest',
            ],
        ],
        'integration' => [
            'AssistantWorkflow' => 'Tests\Integration\AssistantWorkflowTest',
            'SubscriptionWorkflow' => 'Tests\Integration\SubscriptionWorkflowTest',
            'PlanUpgradeWorkflow' => 'Tests\Integration\PlanUpgradeWorkflowTest',
            'StudentManagement' => 'Tests\Integration\StudentManagementTest',
            'PaymentWorkflow' => 'Tests\Integration\PaymentWorkflowTest',
        ],
    ],

    'test_commands' => [
        'run_all' => 'php artisan test --coverage',
        'run_unit' => 'php artisan test tests/Unit --coverage',
        'run_feature' => 'php artisan test tests/Feature --coverage',
        'run_integration' => 'php artisan test tests/Integration --coverage',
        'generate_coverage' => 'php artisan test --coverage-html tests/coverage',
    ],
];
