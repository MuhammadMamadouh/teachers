<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\EnsureSubscriptionIsActive;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class EnsureSubscriptionIsActiveTest extends TestCase
{
    private $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new EnsureSubscriptionIsActive();
    }

    /**
     * Create a proper route mock for testing
     */
    private function createRouteMock($routeName = 'dashboard')
    {
        return new class ($routeName) {
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

    public function test_admin_user_passes_through()
    {
        $admin = $this->createAdmin();
        $request = Request::create('/test');
        $request->setUserResolver(fn () => $admin);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_teacher_with_active_subscription_passes_through()
    {
        $teacher = $this->createTeacher();
        $this->createActiveSubscription($teacher);

        $request = Request::create('/test');
        $request->setUserResolver(fn () => $teacher);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_teacher_without_active_subscription_redirects()
    {
        $teacher = $this->createTeacher();

        $request = Request::create('/test');
        $request->setUserResolver(fn () => $teacher);
        $request->setRouteResolver(fn () => $this->createRouteMock('dashboard'));

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue(str_contains($response->headers->get('Location'), 'subscription'));
    }

    public function test_assistant_with_teacher_having_active_subscription_passes_through()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $request = Request::create('/test');
        $request->setUserResolver(fn () => $assistant);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_assistant_with_teacher_without_active_subscription_redirects()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);

        $request = Request::create('/test');
        $request->setUserResolver(fn () => $assistant);
        $request->setRouteResolver(fn () => $this->createRouteMock('dashboard'));

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue(str_contains($response->headers->get('Location'), 'subscription'));
    }

    public function test_assistant_without_teacher_redirects()
    {
        $assistant = User::factory()->assistant()->create([
            'teacher_id' => null,
        ]);

        $request = Request::create('/test');
        $request->setUserResolver(fn () => $assistant);
        $request->setRouteResolver(fn () => $this->createRouteMock('dashboard'));

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue(str_contains($response->headers->get('Location'), 'subscription'));
    }

    public function test_unauthenticated_user_redirects()
    {
        $request = Request::create('/test');
        $request->setUserResolver(fn () => null);
        $request->setRouteResolver(fn () => $this->createRouteMock('dashboard'));

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue(str_contains($response->headers->get('Location'), 'subscription'));
    }
}
