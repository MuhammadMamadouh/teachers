<?php

namespace Tests\Unit\Middleware;

use Tests\TestCase;
use App\Http\Middleware\EnsureUserCanManageAssistants;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class EnsureUserCanManageAssistantsTest extends TestCase
{
    private $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new EnsureUserCanManageAssistants();
    }

    public function test_teacher_with_active_subscription_can_manage_assistants()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $this->createActiveSubscription($teacher);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $teacher);

        $response = $this->middleware->handle($request, fn() => new Response('OK'));

        $this->assertEquals('OK', $response->getContent());
    }

    public function test_teacher_without_active_subscription_cannot_manage_assistants()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $teacher);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        $this->middleware->handle($request, fn() => new Response('OK'));
    }

    public function test_assistant_cannot_manage_assistants()
    {
        $teacher = $this->createTeacher(['is_approved' => true]);
        $assistant = $this->createAssistant($teacher);
        $this->createActiveSubscription($teacher);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $assistant);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        $this->middleware->handle($request, fn() => new Response('OK'));
    }

    public function test_admin_cannot_manage_assistants()
    {
        $admin = $this->createAdmin();

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $admin);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        $this->middleware->handle($request, fn() => new Response('OK'));
    }

    public function test_unauthenticated_user_cannot_manage_assistants()
    {
        $request = Request::create('/test');
        $request->setUserResolver(fn() => null);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        $this->middleware->handle($request, fn() => new Response('OK'));
    }

    public function test_unapproved_teacher_cannot_manage_assistants()
    {
        $teacher = $this->createTeacher(['is_approved' => false]);
        $this->createActiveSubscription($teacher);

        $request = Request::create('/test');
        $request->setUserResolver(fn() => $teacher);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);

        $this->middleware->handle($request, fn() => new Response('OK'));
    }
}
