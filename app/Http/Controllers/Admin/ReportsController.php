<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Governorate;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ReportsController extends Controller
{
    /**
     * Display the governorates report.
     */
    public function governorates(): Response
    {
        $governoratesData = Governorate::with(['teachers' => function ($query) {
            $query->where('is_approved', true);
        }])
        ->withCount(['teachers as approved_teachers_count' => function ($query) {
            $query->where('is_approved', true);
        }])
        ->withCount(['teachers as pending_teachers_count' => function ($query) {
            $query->where('is_approved', false);
        }])
        ->withCount(['teachers as total_teachers_count'])
        ->orderBy('approved_teachers_count', 'desc')
        ->get();

        $totalTeachers = User::where('type', 'teacher')->where('is_admin', false)->count();
        $approvedTeachers = User::where('type', 'teacher')->where('is_admin', false)->where('is_approved', true)->count();
        $pendingTeachers = User::where('type', 'teacher')->where('is_admin', false)->where('is_approved', false)->count();

        return Inertia::render('Admin/Reports/Governorates', [
            'governorates' => $governoratesData,
            'statistics' => [
                'total_teachers' => $totalTeachers,
                'approved_teachers' => $approvedTeachers,
                'pending_teachers' => $pendingTeachers,
            ],
        ]);
    }
}
