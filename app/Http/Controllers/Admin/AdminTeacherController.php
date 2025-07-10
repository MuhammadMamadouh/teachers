<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Governorate;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AdminTeacherController extends Controller
{
    /**
     * Display a listing of teachers.
     */
    public function index(Request $request): Response
    {
        $query = User::where('is_admin', false)
            ->where('type', 'teacher')
            ->with(['activeSubscription.plan', 'students', 'groups', 'governorate']);

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'approved') {
                $query->where('is_approved', true);
            } elseif ($request->status === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->status === 'active') {
                $query->where('is_approved', true)->whereHas('activeSubscription');
            } elseif ($request->status === 'inactive') {
                $query->where('is_approved', false)->orWhereDoesntHave('activeSubscription');
            }
        }

        // Search by name or email
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $teachers = $query->paginate(15)->withQueryString();

        // Add computed fields
        $teachers->getCollection()->transform(function ($teacher) {
            $teacher->students_count = $teacher->students->count();
            $teacher->groups_count = $teacher->groups->count();
            $teacher->subscription_status = $teacher->activeSubscription ? 'active' : 'inactive';
            $teacher->plan_name = $teacher->activeSubscription?->plan?->name ?? 'No Plan';

            return $teacher;
        });

        return Inertia::render('Admin/Teachers/Index', [
            'teachers' => $teachers,
            'filters' => $request->only(['status', 'search', 'sort_by', 'sort_order']),
            'stats' => [
                'total' => User::where('is_admin', false)->where('type', 'teacher')->count(),
                'approved' => User::where('is_admin', false)->where('type', 'teacher')->where('is_approved', true)->count(),
                'pending' => User::where('is_admin', false)->where('type', 'teacher')->where('is_approved', false)->count(),
                'active' => User::where('is_admin', false)->where('type', 'teacher')->where('is_approved', true)->whereHas('activeSubscription')->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new teacher.
     */
    public function create(): Response
    {
        $plans = Plan::orderBy('max_students')->get();
        $governorates = Governorate::where('is_active', true)
            ->orderBy('name_ar')
            ->get(['id', 'name_ar', 'name_en']);

        return Inertia::render('Admin/Teachers/Create', [
            'plans' => $plans,
            'governorates' => $governorates,
        ]);
    }

    /**
     * Store a newly created teacher.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'governorate_id' => 'nullable|exists:governorates,id',
            'is_approved' => 'boolean',
            'plan_id' => 'nullable|exists:plans,id',
        ], [
            'name.required' => 'اسم المعلم مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'البريد الإلكتروني مُستخدم بالفعل',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
        ]);

        DB::transaction(function () use ($request) {
            // Create the teacher
            $teacher = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'subject' => $request->subject,
                'governorate_id' => $request->governorate_id,
                'type' => 'teacher',
                'is_approved' => $request->boolean('is_approved', true),
                'approved_at' => $request->boolean('is_approved', true) ? now() : null,
            ]);

            // Create subscription if plan is selected
            if ($request->plan_id) {
                $plan = Plan::findOrFail($request->plan_id);
                Subscription::create([
                    'user_id' => $teacher->id,
                    'plan_id' => $plan->id,
                    'max_students' => $plan->max_students,
                    'is_active' => true,
                    'start_date' => now(),
                    'end_date' => null,
                ]);
            } else {
                // Create default free subscription
                Subscription::create([
                    'user_id' => $teacher->id,
                    'max_students' => 5,
                    'is_active' => true,
                    'start_date' => now(),
                    'end_date' => null,
                ]);
            }
        });

        return redirect()->route('admin.teachers.index')->with('success', 'تم إنشاء المعلم بنجاح!');
    }

    /**
     * Display the specified teacher.
     */
    public function show(User $teacher): Response
    {
        $teacher->load([
            'activeSubscription.plan',
            'students',
            'groups.assignedStudents',
            'groups.payments' => function ($query) {
                $query->where('is_paid', true)->orderBy('paid_at', 'desc')->limit(10);
            },
        ]);

        // Calculate statistics
        $stats = [
            'students_count' => $teacher->students->count(),
            'groups_count' => $teacher->groups->count(),
            'total_revenue' => $teacher->groups->sum(function ($group) {
                return $group->payments->sum('amount');
            }),
            'active_subscriptions' => $teacher->activeSubscription ? 1 : 0,
        ];

        // Get recent activity
        $recentPayments = DB::table('payments')
            ->join('students', 'payments.student_id', '=', 'students.id')
            ->join('groups', 'payments.group_id', '=', 'groups.id')
            ->where('students.user_id', $teacher->id)
            ->where('payments.is_paid', true)
            ->orderBy('payments.paid_at', 'desc')
            ->limit(10)
            ->select('students.name as student_name', 'groups.name as group_name', 'payments.amount', 'payments.paid_at', 'payments.related_date')
            ->get()
            ->map(function ($payment) {
                return [
                    'student_name' => $payment->student_name,
                    'group_name' => $payment->group_name,
                    'amount' => $payment->amount,
                    'paid_at' => $payment->paid_at,
                    'month_year' => \Carbon\Carbon::parse($payment->related_date)->format('F Y'),
                ];
            });

        return Inertia::render('Admin/Teachers/Show', [
            'teacher' => $teacher,
            'stats' => $stats,
            'recentPayments' => $recentPayments,
        ]);
    }

    /**
     * Show the form for editing the teacher.
     */
    public function edit(User $teacher): Response
    {
        $teacher->load('activeSubscription.plan', 'governorate');
        $plans = Plan::orderBy('max_students')->get();
        $governorates = Governorate::where('is_active', true)
            ->orderBy('name_ar')
            ->get(['id', 'name_ar', 'name_en']);

        return Inertia::render('Admin/Teachers/Edit', [
            'teacher' => $teacher,
            'plans' => $plans,
            'governorates' => $governorates,
        ]);
    }

    /**
     * Update the specified teacher.
     */
    public function update(Request $request, User $teacher): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $teacher->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'subject' => 'nullable|string|max:255',
            'governorate_id' => 'nullable|exists:governorates,id',
            'is_approved' => 'boolean',
            'plan_id' => 'nullable|exists:plans,id',
        ], [
            'name.required' => 'اسم المعلم مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'email.unique' => 'البريد الإلكتروني مُستخدم بالفعل',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',
        ]);

        DB::transaction(function () use ($request, $teacher) {
            // Update teacher data
            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'subject' => $request->subject,
                'governorate_id' => $request->governorate_id,
                'is_approved' => $request->boolean('is_approved'),
                'approved_at' => $request->boolean('is_approved') ? ($teacher->approved_at ?? now()) : null,
            ];

            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $teacher->update($updateData);

            // Update subscription if plan is changed
            if ($request->plan_id) {
                $plan = Plan::findOrFail($request->plan_id);

                // Deactivate current subscription
                $teacher->subscriptions()->update(['is_active' => false]);

                // Create new subscription
                Subscription::create([
                    'user_id' => $teacher->id,
                    'plan_id' => $plan->id,
                    'max_students' => $plan->max_students,
                    'is_active' => true,
                    'start_date' => now(),
                    'end_date' => null,
                ]);
            }
        });

        return redirect()->route('admin.teachers.index')->with('success', 'تم تحديث بيانات المعلم بنجاح!');
    }

    /**
     * Remove the specified teacher.
     */
    public function destroy(User $teacher): RedirectResponse
    {
        DB::transaction(function () use ($teacher) {
            // Deactivate all subscriptions
            $teacher->subscriptions()->update(['is_active' => false]);

            // Soft delete the teacher
            $teacher->delete();
        });

        return redirect()->route('admin.teachers.index')->with('success', 'تم حذف المعلم بنجاح!');
    }

    /**
     * Activate a teacher.
     */
    public function activate(User $teacher): RedirectResponse
    {
        $teacher->update([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        // Ensure teacher has an active subscription
        if (!$teacher->activeSubscription) {
            Subscription::create([
                'user_id' => $teacher->id,
                'max_students' => 5,
                'is_active' => true,
                'start_date' => now(),
                'end_date' => null,
            ]);
        }

        return redirect()->back()->with('success', 'تم تفعيل المعلم بنجاح!');
    }

    /**
     * Deactivate a teacher.
     */
    public function deactivate(User $teacher): RedirectResponse
    {
        $teacher->update([
            'is_approved' => false,
            'approved_at' => null,
        ]);

        // Deactivate subscriptions
        $teacher->subscriptions()->update(['is_active' => false]);

        return redirect()->back()->with('success', 'تم إلغاء تفعيل المعلم بنجاح!');
    }

    /**
     * Bulk actions for teachers.
     */
    public function bulkAction(Request $request): RedirectResponse
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'teacher_ids' => 'required|array|min:1',
            'teacher_ids.*' => 'exists:users,id',
        ]);

        $teachers = User::whereIn('id', $request->teacher_ids)
            ->where('is_admin', false)
            ->where('type', 'teacher')
            ->get();

        DB::transaction(function () use ($request, $teachers) {
            foreach ($teachers as $teacher) {
                switch ($request->action) {
                    case 'activate':
                        $teacher->update([
                            'is_approved' => true,
                            'approved_at' => now(),
                        ]);
                        if (!$teacher->activeSubscription) {
                            Subscription::create([
                                'user_id' => $teacher->id,
                                'max_students' => 5,
                                'is_active' => true,
                                'start_date' => now(),
                                'end_date' => null,
                            ]);
                        }

                        break;

                    case 'deactivate':
                        $teacher->update([
                            'is_approved' => false,
                            'approved_at' => null,
                        ]);
                        $teacher->subscriptions()->update(['is_active' => false]);

                        break;

                    case 'delete':
                        $teacher->subscriptions()->update(['is_active' => false]);
                        $teacher->delete();

                        break;
                }
            }
        });

        $actionNames = [
            'activate' => 'تفعيل',
            'deactivate' => 'إلغاء تفعيل',
            'delete' => 'حذف',
        ];

        return redirect()->back()->with('success', 'تم ' . $actionNames[$request->action] . ' المعلمين المحددين بنجاح!');
    }
}
