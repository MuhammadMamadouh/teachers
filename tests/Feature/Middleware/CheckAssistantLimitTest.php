<?php

namespace Tests\Feature\Middleware;

use App\Http\Middleware\CheckAssistantLimit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Tests\TestCase;

class CheckAssistantLimitTest extends TestCase
{
    public function test_allows_teacher_with_available_assistant_slots()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 2]);
        $this->createActiveSubscription($teacher, $plan);

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(function () use ($teacher) {
            return $teacher;
        });
        
        // Mock the route
        $route = new \Illuminate\Routing\Route(['POST'], '/assistants', []);
        $route->name('assistants.store');
        $request->setRouteResolver(function () use ($route) {
            return $route;
        });

        $middleware = new CheckAssistantLimit();
        $response = $middleware->handle($request, function ($request) {
            return response('OK', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_blocks_teacher_when_assistant_limit_reached()
    {
        $teacher = $this->createTeacher();
        $plan = $this->createPlan(['max_assistants' => 1]);
        $this->createActiveSubscription($teacher, $plan);

        // Create one assistant to reach the limit
        $this->createAssistant($teacher);

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(function () use ($teacher) {
            return $teacher;
        });
        
        // Mock the route
        $route = new \Illuminate\Routing\Route(['POST'], '/assistants', []);
        $route->name('assistants.store');
        $request->setRouteResolver(function () use ($route) {
            return $route;
        });

        $middleware = new CheckAssistantLimit();
        $response = $middleware->handle($request, function ($request) {
            return response('OK', 200);
        });

        $this->assertEquals(302, $response->getStatusCode());
        // Check if it's a redirect response with errors
        $this->assertInstanceOf(\Illuminate\Http\RedirectResponse::class, $response);
    }

    public function test_allows_assistants_to_pass_through()
    {
        $teacher = $this->createTeacher();
        $assistant = $this->createAssistant($teacher);
        $plan = $this->createPlan(['max_assistants' => 1]);
        $this->createActiveSubscription($teacher, $plan);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(function () use ($assistant) {
            return $assistant;
        });

        $middleware = new CheckAssistantLimit();
        $response = $middleware->handle($request, function ($request) {
            return response('OK', 200);
        });

        $this->assertEquals(200, $response->getStatusCode());
    }

    public function test_blocks_when_no_subscription()
    {
        $teacher = $this->createTeacher();
        // No subscription created

        $request = Request::create('/assistants', 'POST');
        $request->setUserResolver(function () use ($teacher) {
            return $teacher;
        });
        
        // Mock the route
        $route = new \Illuminate\Routing\Route(['POST'], '/assistants', []);
        $route->name('assistants.store');
        $request->setRouteResolver(function () use ($route) {
            return $route;
        });

        $middleware = new CheckAssistantLimit();
        $response = $middleware->handle($request, function ($request) {
            return response('OK', 200);
        });

        $this->assertEquals(302, $response->getStatusCode());
        // Should redirect to login when no user is authenticated
        $this->assertInstanceOf(\Illuminate\Http\RedirectResponse::class, $response);
    }
}
