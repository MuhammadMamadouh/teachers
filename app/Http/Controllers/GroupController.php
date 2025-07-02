<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class GroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $groups = Group::where('user_id', Auth::id())->with('schedules')->get();
        
        return Inertia::render('Groups/Index', [
            'groups' => $groups
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Groups/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'schedules' => 'required|array|min:1',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
        ]);

        $group = Group::create(array_merge(
            $request->only(['name', 'description', 'max_students', 'is_active']),
            ['user_id' => Auth::id()]
        ));

        foreach ($request->schedules as $schedule) {
            $group->schedules()->create($schedule);
        }

        return redirect()->route('groups.index')->with('success', 'تم إنشاء المجموعة بنجاح');
    }

    /**
     * Display the specified resource.
     */
    public function show(Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }
        
        $group->load('schedules', 'students');
        
        return Inertia::render('Groups/Show', [
            'group' => $group
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }
        
        $group->load('schedules');
        
        return Inertia::render('Groups/Edit', [
            'group' => $group
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'max_students' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'schedules' => 'required|array|min:1',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
        ]);

        $group->update($request->only(['name', 'description', 'max_students', 'is_active']));

        // Delete existing schedules and create new ones
        $group->schedules()->delete();
        foreach ($request->schedules as $schedule) {
            $group->schedules()->create($schedule);
        }

        return redirect()->route('groups.index')->with('success', 'تم تحديث المجموعة بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }
        
        $group->delete();
        
        return redirect()->route('groups.index')->with('success', 'تم حذف المجموعة بنجاح');
    }
}
