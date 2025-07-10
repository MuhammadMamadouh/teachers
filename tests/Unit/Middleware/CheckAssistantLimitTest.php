<?php

namespace Tests\Unit\Middleware;

use App\Http\Middleware\CheckAssistantLimit;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class CheckAssistantLimitTest extends TestCase
{
    private $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new CheckAssistantLimit();
    }

    /**
     * Create a proper route mock for testing
     */
    private function createRouteMock($routeName = 'assistants.store')
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
        };
    }

    public function test_teacher_can_add_assistant_within_limit()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 3]);
        $this->createActiveSubscription($teacher, $plan);

        // Create 2 assistants (below limit)
        $this->createAssistant($teacher);
        $this->createAssistant($teacher);

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(fn () => $teacher);

        $route = $this->createRouteMock();
        $request->setRouteResolver(fn () => $route);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_teacher_cannot_add_assistant_when_limit_reached()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 2]);
        $this->createActiveSubscription($teacher, $plan);

        // Create assistants up to limit
        $this->createAssistant($teacher);
        $this->createAssistant($teacher);

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(fn () => $teacher);

        $route = $this->createRouteMock();
        $request->setRouteResolver(fn () => $route);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
    }

    public function test_teacher_without_active_subscription_cannot_add_assistant()
    {
        $teacher = $this->createTeacher();

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(fn () => $teacher);

        $route = $this->createRouteMock();
        $request->setRouteResolver(fn () => $route);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
    }

    public function test_assistant_cannot_add_assistant()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_assistants' => 5]);
        $this->createActiveSubscription($teacher, $plan);

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(fn () => $assistant);

        $route = $this->createRouteMock();
        $request->setRouteResolver(fn () => $route);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
    }

    public function test_admin_cannot_add_assistant()
    {
        $admin = $this->createAdmin();

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(fn () => $admin);

        $route = $this->createRouteMock();
        $request->setRouteResolver(fn () => $route);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
    }

    public function test_unauthenticated_user_cannot_add_assistant()
    {
        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(fn () => null);

        $route = $this->createRouteMock();
        $request->setRouteResolver(fn () => $route);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals(302, $response->getStatusCode());
        $this->assertTrue(str_contains($response->headers->get('Location'), 'login'));
    }

    public function test_non_post_request_passes_through()
    {
        $teacher = $this->createTeacher();

        $request = Request::create('/assistants', 'GET');
        $request->setUserResolver(fn () => $teacher);

        $response = $this->middleware->handle($request, fn () => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }
}
