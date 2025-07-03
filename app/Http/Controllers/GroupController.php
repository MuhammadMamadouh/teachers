<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupSchedule;
use App\Models\GroupSpecialSession;
use App\Models\Student;
use App\Rules\StudentNotInGroup;
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
        $groups = Group::where('user_id', Auth::id())->with(['schedules', 'assignedStudents'])->get();
        
        // Transform the data to ensure consistency
        $transformedGroups = $groups->map(function ($group) {
            return array_merge($group->toArray(), [
                'assigned_students' => $group->assignedStudents->toArray()
            ]);
        });
        
        return Inertia::render('Groups/Index', [
            'groups' => $transformedGroups
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
        
        $group->load(['schedules', 'assignedStudents', 'specialSessions']);
        
        // Get only students that are not assigned to any group
        $availableStudents = Student::where('user_id', Auth::id())
            ->whereNull('group_id')
            ->get();

            
        // Get payment summary for current month
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $paymentSummary = [
            'total_students' => $group->assignedStudents->count(),
            'paid_students' => $group->payments()
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->where('is_paid', true)
                ->count(),
            'unpaid_students' => $group->assignedStudents->count() - $group->payments()
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->where('is_paid', true)
                ->count(),
            'total_amount' => $group->payments()
                ->where('month', $currentMonth)
                ->where('year', $currentYear)
                ->where('is_paid', true)
                ->sum('amount'),
            'current_month' => now()->format('F Y'),
            'current_month_arabic' => now()->locale('ar')->monthName . ' ' . now()->year,
        ];
        
        return Inertia::render('Groups/Show', [
            'group' => array_merge($group->toArray(), [
                'assigned_students' => $group->assignedStudents->toArray()
            ]),
            'availableStudents' => $availableStudents,
            'paymentSummary' => $paymentSummary,
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

    /**
     * Assign students to a group
     */
    public function assignStudents(Request $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'student_ids' => ['required', 'array', new StudentNotInGroup],
            'student_ids.*' => 'exists:students,id'
        ]);

        // Verify that all students belong to the authenticated user
        $students = Student::where('user_id', Auth::id())
            ->whereIn('id', $request->student_ids)
            ->get();

        if ($students->count() !== count($request->student_ids)) {
            abort(403, 'يمكنك فقط تعيين طلابك الخاصين');
        }

        // Check if any of the students are already assigned to a group
        $alreadyAssignedStudents = $students->whereNotNull('group_id');
        if ($alreadyAssignedStudents->count() > 0) {
            $studentNames = $alreadyAssignedStudents->pluck('name')->join('، ');
            return back()->withErrors([
                'assignment' => "الطلاب التالية مُعينين بالفعل في مجموعات أخرى: {$studentNames}"
            ]);
        }

        // Check if adding these students would exceed the group's maximum capacity
        $currentStudentCount = $group->assignedStudents()->count();
        $newStudentCount = count($request->student_ids);
        
        if (($currentStudentCount + $newStudentCount) > $group->max_students) {
            return back()->withErrors([
                'capacity' => "لا يمكن إضافة {$newStudentCount} طلاب. الحد الأقصى للمجموعة {$group->max_students} والعدد الحالي {$currentStudentCount}"
            ]);
        }

        // Assign students to the group by updating their group_id
        Student::whereIn('id', $request->student_ids)
            ->where('user_id', Auth::id())
            ->whereNull('group_id') // Extra safety check
            ->update(['group_id' => $group->id]);

        return back()->with('success', 'تم تعيين الطلاب للمجموعة بنجاح');
    }

    /**
     * Remove a student from a group
     */
    public function removeStudent(Group $group, Student $student)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id() || $student->user_id !== Auth::id()) {
            abort(403);
        }

        // Remove student from group by setting group_id to null
        $student->group_id = null;
        $student->save();

        return back()->with('success', 'تم إزالة الطالب من المجموعة بنجاح');
    }

    /**
     * Display the calendar view for a group
     */
    public function calendar(Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $group->load(['schedules', 'specialSessions']);

        return Inertia::render('Groups/Calendar', [
            'group' => $group
        ]);
    }

    /**
     * Get calendar events for a group
     */
    public function getCalendarEvents(Request $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $start = $request->input('start');
        $end = $request->input('end');

        $events = [];

        // Add recurring schedule events
        if ($start && $end) {
            $startDate = new \DateTime($start);
            $endDate = new \DateTime($end);
            
            while ($startDate <= $endDate) {
                $dayOfWeek = (int) $startDate->format('w'); // 0 = Sunday, 6 = Saturday
                
                foreach ($group->schedules as $schedule) {
                    if ($schedule->day_of_week == $dayOfWeek) {
                        $events[] = [
                            'id' => 'schedule_' . $schedule->id . '_' . $startDate->format('Y-m-d'),
                            'title' => $group->name . ' - جلسة عادية',
                            'start' => $startDate->format('Y-m-d') . 'T' . $schedule->start_time,
                            'end' => $startDate->format('Y-m-d') . 'T' . $schedule->end_time,
                            'backgroundColor' => '#3b82f6',
                            'borderColor' => '#2563eb',
                            'type' => 'recurring',
                            'editable' => false
                        ];
                    }
                }
                
                $startDate->modify('+1 day');
            }
        }

        // Add special session events
        $specialSessions = $group->specialSessions()
            ->when($start, function($query) use ($start) {
                $query->where('date', '>=', $start);
            })
            ->when($end, function($query) use ($end) {
                $query->where('date', '<=', $end);
            })
            ->get();

        foreach ($specialSessions as $session) {
            $events[] = [
                'id' => 'special_' . $session->id,
                'title' => $group->name . ' - جلسة خاصة',
                'start' => $session->date->format('Y-m-d') . 'T' . $session->start_time,
                'end' => $session->date->format('Y-m-d') . 'T' . $session->end_time,
                'backgroundColor' => '#10b981',
                'borderColor' => '#059669',
                'extendedProps' => [
                    'description' => $session->description,
                    'type' => 'special',
                    'sessionId' => $session->id
                ],
                'editable' => true
            ];
        }

        return response()->json($events);
    }

    /**
     * Store a new special session
     */
    public function storeSpecialSession(Request $request, Group $group)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:255',
        ]);

        $specialSession = $group->specialSessions()->create($request->only([
            'date', 'start_time', 'end_time', 'description'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم إضافة الجلسة الخاصة بنجاح',
            'session' => $specialSession
        ]);
    }

    /**
     * Update a special session
     */
    public function updateSpecialSession(Request $request, Group $group, GroupSpecialSession $specialSession)
    {
        // Ensure the group and session belong to the authenticated user
        if ($group->user_id !== Auth::id() || $specialSession->group_id !== $group->id) {
            abort(403);
        }

        $request->validate([
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:255',
        ]);

        $specialSession->update($request->only([
            'date', 'start_time', 'end_time', 'description'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الجلسة الخاصة بنجاح',
            'session' => $specialSession
        ]);
    }

    /**
     * Delete a special session
     */
    public function destroySpecialSession(Group $group, GroupSpecialSession $specialSession)
    {
        // Ensure the group and session belong to the authenticated user
        if ($group->user_id !== Auth::id() || $specialSession->group_id !== $group->id) {
            abort(403);
        }

        $specialSession->delete();

        return response()->json([
            'success' => true,
            'message' => 'تم حذف الجلسة الخاصة بنجاح'
        ]);
    }
}
