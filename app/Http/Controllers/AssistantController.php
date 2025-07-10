<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use App\Mail\AssistantInvitation;

class AssistantController extends Controller
{
    /**
     * Display a listing of the assistants.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $assistants = $user->assistants()
            ->select(['id', 'name', 'phone', 'created_at'])
            ->orderBy('name')
            ->get();

        $subscription = $user->activeSubscription()->with('plan')->first();
        $canAddMore = $user->canAddAssistants();
        
        return Inertia::render('Assistants/Index', [
            'assistants' => $assistants,
            'assistantCount' => count($assistants),
            'maxAssistants' => $subscription && $subscription->plan ? $subscription->plan->max_assistants : 0,
            'canAddMore' => $canAddMore,
        ]);
    }

    /**
     * Store a newly created assistant in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'email' => 'nullable|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'notes' => 'nullable|string',
        ]);
        
        $assistant = new User([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
            'notes' => $validated['notes'] ?? null,
            'type' => 'assistant',
            'teacher_id' => $user->id,
            'is_approved' => true, // Assistants are auto-approved
            'onboarding_completed' => true, // Assume onboarding is completed for assistants
            'onboarding_completed_at' => now(),
        ]);
        
        $assistant->save();
        
        // Send invitation SMS with password (to be implemented)
       
        // if ($assistant->email) {
        //     Mail::to($assistant->email)->send(new AssistantInvitation($user, $assistant, $validated['password']));
        // }
        
        return redirect()->route('assistants.index')->with('success', 'تم إضافة المساعد بنجاح يمكنه الآن تسجيل الدخول باستخدام بياناته');
    }

    /**
     * Remove the specified assistant from storage.
     */
    public function destroy(Request $request, User $assistant)
    {
        $assistant->delete();
        
        return redirect()->route('assistants.index')->with('success', 'تم إزالة المساعد بنجاح');
    }
    
    /**
     * Resend invitation to the assistant.
     */
    public function resendInvitation(Request $request, User $assistant)
    {
        $user = $request->user();
        
        // Generate a new temporary password
        $password = Str::random(10);
        $assistant->password = Hash::make($password);
        $assistant->save();
        
        // Send invitation SMS with temporary password (to be implemented)
        // For now, we'll still use email if available
        if ($assistant->email) {
            Mail::to($assistant->email)->send(new AssistantInvitation($user, $assistant, $password));
        }
        
        return redirect()->route('assistants.index')->with('success', 'تم إعادة إرسال الدعوة بنجاح');
    }

    /**
     * Show the form for editing the specified assistant.
     */
    public function edit(Request $request, User $assistant)
    {
        return Inertia::render('Assistants/Edit', [
            'assistant' => $assistant->only(['id', 'name', 'phone', 'email', 'subject', 'city', 'notes']),
        ]);
    }

    /**
     * Update the specified assistant in storage.
     */
    public function update(Request $request, User $assistant)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'phone' => ['required', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($assistant->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($assistant->id)],
            'notes' => 'nullable|string',
        ];
        
        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8|confirmed';
        }
        
        $validated = $request->validate($rules);
        
        // Update basic info
        $assistant->name = $validated['name'];
        $assistant->phone = $validated['phone'];
        $assistant->email = $validated['email'] ?? null;
        $assistant->notes = $validated['notes'] ?? null;
        
        // Update password if provided
        if ($request->filled('password')) {
            $assistant->password = Hash::make($validated['password']);
        }
        
        $assistant->save();
        
        return redirect()->route('assistants.index')->with('success', 'تم تحديث بيانات المساعد بنجاح');
    }
}
