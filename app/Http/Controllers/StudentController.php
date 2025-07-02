<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    /**
     * Display a listing of the students.
     */
    public function index(): Response
    {
        $user = Auth::user();
        $students = Student::where('user_id', $user->id)->with('group')->orderBy('name')->get();
        $subscriptionLimits = $user->getSubscriptionLimits();
        $currentStudentCount = $user->getStudentCount();

        return Inertia::render('Students/Index', [
            'students' => $students,
            'subscriptionLimits' => $subscriptionLimits,
            'currentStudentCount' => $currentStudentCount,
            'canAddStudents' => $user->canAddStudents(),
        ]);
    }

    /**
     * Show the form for creating a new student.
     */
    public function create(): Response
    {
        $user = Auth::user();
        
        if (!$user->canAddStudents()) {
            return redirect()->route('students.index')
                ->with('error', 'You have reached your subscription limit for students.');
        }

        $groups = Group::where('user_id', $user->id)->where('is_active', true)->get();

        return Inertia::render('Students/Create', [
            'groups' => $groups
        ]);
    }

    /**
     * Store a newly created student in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();
        
        // Check subscription limit before creating
        if (!$user->canAddStudents()) {
            throw ValidationException::withMessages([
                'subscription' => 'You have reached your subscription limit for students.',
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'guardian_name' => 'required|string|max:255',
            'guardian_phone' => 'required|string|max:20',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        // Add user_id to the validated data
        $validated['user_id'] = $user->id;

        Student::create($validated);

        return redirect()->route('students.index')
            ->with('success', 'Student added successfully!');
    }

    /**
     * Display the specified student.
     */
    public function show(Student $student): Response
    {
        // Ensure the student belongs to the authenticated user
        if ($student->user_id !== Auth::id()) {
            abort(403);
        }

        $student->load('group');

        return Inertia::render('Students/Show', [
            'student' => $student,
        ]);
    }

    /**
     * Show the form for editing the specified student.
     */
    public function edit(Student $student): Response
    {
        // Ensure the student belongs to the authenticated user
        if ($student->user_id !== Auth::id()) {
            abort(403);
        }

        $groups = Group::where('user_id', Auth::id())->where('is_active', true)->get();

        return Inertia::render('Students/Edit', [
            'student' => $student,
            'groups' => $groups
        ]);
    }

    /**
     * Update the specified student in storage.
     */
    public function update(Request $request, Student $student): RedirectResponse
    {
        // Ensure the student belongs to the authenticated user
        if ($student->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'guardian_name' => 'required|string|max:255',
            'guardian_phone' => 'required|string|max:20',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        $student->update($validated);

        return redirect()->route('students.index')
            ->with('success', 'Student updated successfully!');
    }

    /**
     * Remove the specified student from storage.
     */
    public function destroy(Student $student): RedirectResponse
    {
        // Ensure the student belongs to the authenticated user
        if ($student->user_id !== Auth::id()) {
            abort(403);
        }

        $student->delete();

        return redirect()->route('students.index')
            ->with('success', 'Student deleted successfully!');
    }
}
