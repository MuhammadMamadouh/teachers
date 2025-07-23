<?php
namespace App\Http\Controllers\CenterOwner;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Center;
use Inertia\Inertia;

class AssistantController extends Controller
{
    public function assistants()
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        $center = $user->center;
        $assistants = $center->assistants()
            ->select(['id', 'name', 'email', 'phone', 'is_active', 'created_at'])
            ->orderBy('name')
            ->get();

        // Get subscription details to check assistant limits
        $subscription = $center->activeSubscription()->with('plan')->first();
        $maxAssistants = $subscription && $subscription->plan ? $subscription->plan->max_assistants : 0;
        $currentAssistants = $assistants->count();
        $canAddMore = !$subscription || $currentAssistants < $maxAssistants;

        return Inertia::render('CenterOwner/Assistants', [
            'center' => $center,
            'assistants' => $assistants,
            'assistantCount' => $assistants->count(),
            'maxAssistants' => $maxAssistants,
            'canAddMore' => $canAddMore,
        ]);
    }

    public function createAssistant(Request $request)
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'nullable|string|max:20',
        ]);

        $center = $user->center;
        $subscription = $center->activeSubscription;
        
        // Check subscription limits for assistants
        if ($subscription) {
            $currentAssistants = $center->assistants()->count();
            if ($currentAssistants >= $subscription->plan->max_assistants) {
                return back()->withErrors(['error' => 'لقد وصلت إلى الحد الأقصى لعدد المساعدين في خطتك الحالية']);
            }
        }

        try {
            DB::transaction(function () use ($request, $center) {
                $assistant = $center->assistants()->create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'role' => 'assistant',
                    'is_active' => true,
                    'password' => bcrypt('password'), // Default password
                ]);

                // Send welcome email with login credentials
                // TODO: Implement email notification
            });
            
            return redirect()->back()->with('success', 'تم إضافة المساعد بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء إضافة المساعد: ' . $e->getMessage()]);
        }
    }

    public function updateAssistant(Request $request, User $assistant)
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        if ($assistant->center_id !== $user->center_id) {
            abort(403, 'Assistant does not belong to your center');
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $assistant->id,
            'phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);
        
        try {
            DB::transaction(function () use ($request, $assistant) {
                $assistant->update([
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'is_active' => $request->boolean('is_active', true),
                ]);
            });
            
            return redirect()->back()->with('success', 'تم تحديث بيانات المساعد بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء تحديث المساعد: ' . $e->getMessage()]);
        }
    }

    public function deleteAssistant(User $assistant)
    {
        $user = Auth::user();
        if (!$user->center || $user->center->owner_id !== $user->id) {
            abort(403, 'Unauthorized - Center Owner access required');
        }
        
        if ($assistant->center_id !== $user->center_id) {
            abort(403, 'Assistant does not belong to your center');
        }
        
        try {
            DB::transaction(function () use ($assistant) {
                $assistant->delete();
            });
            
            return redirect()->back()->with('success', 'تم حذف المساعد بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'حدث خطأ أثناء حذف المساعد: ' . $e->getMessage()]);
        }
    }
}
