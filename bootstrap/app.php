<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'approved' => \App\Http\Middleware\EnsureUserIsApproved::class,
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
            'system-admin' => \App\Http\Middleware\EnsureUserIsSystemAdmin::class,
            'not-admin' => \App\Http\Middleware\EnsureUserIsNotAdmin::class,
            'teacher-or-admin' => \App\Http\Middleware\EnsureUserIsTeacherOrAdmin::class,
            'scope-by-teacher' => \App\Http\Middleware\ScopeResourcesByTeacher::class,
            'subscription' => \App\Http\Middleware\EnsureSubscriptionIsActive::class,
            'onboarding' => \App\Http\Middleware\CheckOnboardingCompleted::class,
            'manage-assistants' => \App\Http\Middleware\EnsureUserCanManageAssistants::class,
            'assistant-ownership' => \App\Http\Middleware\EnsureAssistantOwnership::class,
            'assistant-limit' => \App\Http\Middleware\CheckAssistantLimit::class,
            'center-owner' => \App\Http\Middleware\EnsureCenterOwner::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
