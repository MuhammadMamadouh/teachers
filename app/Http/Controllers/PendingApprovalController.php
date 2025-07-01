<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PendingApprovalController extends Controller
{
    /**
     * Display the pending approval page.
     */
    public function index(): Response
    {
        return Inertia::render('Auth/PendingApproval');
    }
}
