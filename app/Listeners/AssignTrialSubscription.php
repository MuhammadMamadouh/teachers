<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;

class AssignTrialSubscription
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Registered $event): void
    {
        $user = $event->user;

        // Only assign trial to regular users (not admins)
        // if ($user && !$user->is_admin) {
        //     $user->createTrialSubscription();
        // }
    }
}
