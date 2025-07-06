<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Group;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    /**
     * Display attendance interface
     */
    public function index(Request $request)
    {
        $groups = Group::where('user_id', Auth::id())->with('assignedStudents')->get();

        $selectedGroup = null;
        $selectedDate = $request->get('date', now()->format('Y-m-d'));
        $attendances = collect();
        
        if ($request->has('group_id')) {
            $selectedGroup = Group::where('user_id', Auth::id())
                ->where('id', $request->group_id)
                ->with('assignedStudents')
                ->first();
                
            if ($selectedGroup) {
                $attendances = Attendance::where('group_id', $selectedGroup->id)
                    ->where('date', $selectedDate)
                    ->with('student')
                    ->get()
                    ->keyBy('student_id');
            }
        }
        
        return Inertia::render('Attendance/Index', [
            'groups' => $groups,
            'selectedGroup' => $selectedGroup,
            'selectedDate' => $selectedDate,
            'attendances' => $attendances
        ]);
    }

    /**
     * Store attendance records
     */
    public function store(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.is_present' => 'required|boolean',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $group = Group::where('user_id', Auth::id())
            ->where('id', $request->group_id)
            ->first();

        if (!$group) {
            abort(403);
        }

        foreach ($request->attendances as $attendanceData) {
            // Verify student belongs to the authenticated user
            $student = Student::where('user_id', Auth::id())
                ->where('id', $attendanceData['student_id'])
                ->first();

            if (!$student) {
                continue;
            }

            Attendance::updateOrCreate(
                [
                    'student_id' => $attendanceData['student_id'],
                    'group_id' => $request->group_id,
                    'date' => $request->date,
                ],
                [
                    'is_present' => $attendanceData['is_present'],
                    'notes' => $attendanceData['notes'] ?? null,
                ]
            );
        }

        return back()->with('success', 'تم حفظ سجل الحضور بنجاح');
    }

    /**
     * Show attendance summary for a group
     */
    public function summary(Group $group, Request $request)
    {
        // Ensure the group belongs to the authenticated user
        if ($group->user_id !== Auth::id()) {
            abort(403);
        }

        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));

        $attendances = Attendance::where('group_id', $group->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->with('student')
            ->orderBy('date', 'desc')
            ->get()
            ->groupBy('date');

        $group->load('students');

        return Inertia::render('Attendance/Summary', [
            'group' => $group,
            'attendances' => $attendances,
            'startDate' => $startDate,
            'endDate' => $endDate
        ]);
    }
}
