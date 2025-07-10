<?php

namespace Tests\Unit\Middleware;

use Tests\TestCase;
use App\Http\Middleware\CheckOnboardingCompleted;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class CheckOnboardingCompletedTest extends TestCase
{
    private $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new CheckOnboardingCompleted();
    }

    /**
     * Create a proper route mock for testing
     */
    private function createRouteMock($routeName = 'dashboard')
    {
        return new class($routeName) {
            private $routeName;

            public function __construct($routeName)
            {
                $this->routeName = $routeName;
            }

            public function getName()
            {
                return $this->routeName;
            }

            public function named(...$patterns)
            {
                foreach ($patterns as $pattern) {
                    if (fnmatch($pattern, $this->routeName)) {
                        return true;
                    }
                }
                return false;
            }
        };
    }

    public function test_unauthenticated_user_passes_through()
    {
        $request = Request::create('/test');
        
        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_admin_user_passes_through()
    {
        $admin = $this->createAdmin();
        $this->actingAs($admin);

        $request = Request::create('/test');

        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_teacher_with_completed_onboarding_passes_through()
    {
        $teacher = $this->createTeacher(['onboarding_completed' => true]);
        $this->actingAs($teacher);

        $request = Request::create('/test');

        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_teacher_without_completed_onboarding_redirects()
    {
        $teacher = $this->createTeacher(['onboarding_completed' => false]);
        $this->actingAs($teacher);

        $request = Request::create('/test');
        $request->setRouteResolver(fn() => $this->createRouteMock('dashboard'));

        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue(str_contains($response->headers->get('Location'), 'onboarding'));
    }

    public function test_assistant_with_teacher_having_completed_onboarding_passes_through()
    {
        $teacher = $this->createTeacher(['onboarding_completed' => true]);
        $assistant = $this->createAssistant($teacher);
        $this->actingAs($assistant);

        $request = Request::create('/test');
        $request->setRouteResolver(fn() => $this->createRouteMock('dashboard'));

        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_assistant_with_teacher_without_completed_onboarding_redirects()
    {
        $teacher = $this->createTeacher(['onboarding_completed' => false]);
        $assistant = $this->createAssistant($teacher);
        $this->actingAs($assistant);

        $request = Request::create('/test');
        $request->setRouteResolver(fn() => $this->createRouteMock('dashboard'));

        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue(str_contains($response->headers->get('Location'), 'onboarding'));
    }

    public function test_onboarding_routes_are_not_redirected()
    {
        $teacher = $this->createTeacher(['onboarding_completed' => false]);
        $this->actingAs($teacher);

        $request = Request::create('/onboarding');
        $request->setRouteResolver(fn() => $this->createRouteMock('onboarding.show'));

        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }
}
