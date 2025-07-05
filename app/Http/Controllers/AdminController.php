<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display the admin panel with unapproved users.
     */
    public function index(): Response
    {
        $unapprovedUsers = User::where('is_approved', false)
            ->where('is_admin', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/UserApproval', [
            'unapprovedUsers' => $unapprovedUsers
        ]);
    }

    /**
     * Approve a user.
     */
    public function approveUser(User $user): RedirectResponse
    {
        $user->update([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Ensure user has a default subscription if they don't have one
        if (!$user->subscriptions()->exists()) {
            Subscription::create([
                'user_id' => $user->id,
                'max_students' => 5,
                'is_active' => true,
                'start_date' => now(),
                'end_date' => null, // No end date for free tier
            ]);
        }

        return redirect()->back()->with('success', 'تم الموافقة على المستخدم بنجاح!');
    }

    /**
     * Reject a user (delete).
     */
    public function rejectUser(User $user): RedirectResponse
    {
        $user->delete();

        return redirect()->back()->with('success', 'تم رفض وحذف المستخدم بنجاح!');
    }
}
