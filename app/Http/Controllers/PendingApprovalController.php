<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class PendingApprovalController extends Controller
{
    /**
     * Display the pending approval page.
     */
    public function index()
    {

        // check if the user is pending approval
        if (!auth()->check() || (auth()->user()->is_approved && !auth()->user()->is_admin)) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/PendingApproval');
    }
}
