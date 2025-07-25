<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        $groups = Group::where('user_id', $teacherId)
            ->with(['assignedStudents', 'payments.student'])
            ->get();

        // Get all payments for the teacher
        $payments = Payment::whereHas('group', function ($query) use ($teacherId) {
            $query->where('user_id', $teacherId);
        })->with(['student', 'group'])->orderBy('created_at', 'desc')->get();

        // Get all students for the teacher
        $students = \App\Models\Student::where('user_id', $teacherId)->get();

        return Inertia::render('Payments/Index', [
            'groups' => $groups,
            'payments' => $payments,
            'students' => $students,
        ]);
    }

    /**
     * Show payments for a specific group and date range with pagination
     */
    public function show(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string',
            'payment_status' => 'nullable|in:all,paid,unpaid',
        ]);

        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        $group = Group::where('user_id', $teacherId)
            ->where('id', $request->group_id)
            ->firstOrFail();

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now()->endOfMonth();
        $perPage = $request->per_page ?? 20;
        $search = $request->search;
        $paymentStatus = $request->payment_status ?? 'all';

        // Build student query with pagination
        $studentsQuery = $group->assignedStudents()->getQuery();
        
        // Apply search filter
        if ($search) {
            $studentsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ;
            });
        }

        // Get paginated students
        $students = $studentsQuery->paginate($perPage);

        // Get payments for the current page of students
        $studentIds = $students->pluck('id');
        $payments = Payment::where('group_id', $request->group_id)
            ->whereIn('student_id', $studentIds)
            ->whereBetween('related_date', [$startDate, $endDate])
            ->with('student')
            ->get()
            ->groupBy('student_id');

        // Calculate summary statistics for ALL students (not just current page)
        $totalSummary = $this->calculateGroupSummary($group, $startDate, $endDate, $search, $paymentStatus);

        // Process student payments for current page
        $studentPayments = $students->map(function ($student) use ($payments, $group, $startDate, $endDate, $paymentStatus) {
            $studentPaymentsList = $payments->get($student->id, collect());

            // Filter payments by status if specified
            if ($paymentStatus === 'paid') {
                $studentPaymentsList = $studentPaymentsList->where('is_paid', true);
            } elseif ($paymentStatus === 'unpaid') {
                $studentPaymentsList = $studentPaymentsList->where('is_paid', false);
            }

            $expectedAmount = 0;
            $paidAmount = 0;
            $unpaidAmount = 0;

            if ($group->payment_type === 'monthly') {
                // For monthly payments, calculate based on distinct months in date range
                $startMonth = $startDate->copy()->startOfMonth();
                $endMonth = $endDate->copy()->startOfMonth();
                $months = $startMonth->diffInMonths($endMonth) + 1;

                $expectedAmount = $months * $group->student_price;
                $paidAmount = $studentPaymentsList->where('is_paid', true)->sum('amount');
                $unpaidAmount = $expectedAmount - $paidAmount;
            } else {
                // For per-session payments, sum up all payments
                $expectedAmount = $studentPaymentsList->sum('amount');
                $paidAmount = $studentPaymentsList->where('is_paid', true)->sum('amount');
                $unpaidAmount = $studentPaymentsList->where('is_paid', false)->sum('amount');
            }

            return [
                'student' => $student,
                'payments' => $studentPaymentsList->values(),
                'expected_amount' => $expectedAmount,
                'paid_amount' => $paidAmount,
                'unpaid_amount' => $unpaidAmount,
            ];
        });

        return response()->json([
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'student_price' => $group->student_price,
                'payment_type' => $group->payment_type,
            ],
            'student_payments' => [
                'data' => $studentPayments,
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
                'from' => $students->firstItem(),
                'to' => $students->lastItem(),
                'links' => $students->linkCollection(),
            ],
            'summary' => $totalSummary,
            'date_range' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Calculate summary statistics for the entire group
     */
    private function calculateGroupSummary($group, $startDate, $endDate, $search = null, $paymentStatus = 'all')
    {
        // Get all students (with search filter if provided)
        $studentsQuery = $group->assignedStudents()->getQuery();
        
        if ($search) {
            $studentsQuery->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ;
            });
        }

        $totalStudents = $studentsQuery->count();
        $studentIds = $studentsQuery->pluck('id');

        // Get payments for all students
        $paymentsQuery = Payment::where('group_id', $group->id)
            ->whereIn('student_id', $studentIds)
            ->whereBetween('related_date', [$startDate, $endDate]);

        // Apply payment status filter
        if ($paymentStatus === 'paid') {
            $paymentsQuery->where('is_paid', true);
        } elseif ($paymentStatus === 'unpaid') {
            $paymentsQuery->where('is_paid', false);
        }

        $payments = $paymentsQuery->get();

        $totalPaid = $payments->where('is_paid', true)->sum('amount');
        $totalUnpaid = $payments->where('is_paid', false)->sum('amount');

        // Calculate expected amount
        $totalExpected = 0;
        if ($group->payment_type === 'monthly') {
            $startMonth = $startDate->copy()->startOfMonth();
            $endMonth = $endDate->copy()->startOfMonth();
            $months = $startMonth->diffInMonths($endMonth) + 1;
            $totalExpected = $totalStudents * $months * $group->student_price;
        } else {
            $totalExpected = $payments->sum('amount');
        }

        return [
            'total_students' => $totalStudents,
            'total_expected' => $totalExpected,
            'total_paid' => $totalPaid,
            'total_unpaid' => $totalExpected - $totalPaid,
            'payment_percentage' => $totalExpected > 0 ? ($totalPaid / $totalExpected) * 100 : 0,
        ];
    }

    /**
     * Generate monthly payments for a group
     */
    public function generateMonthlyPayments(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020',
        ]);

        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        $group = Group::where('user_id', $teacherId)
            ->where('id', $request->group_id)
            ->with('assignedStudents')
            ->firstOrFail();

        if ($group->payment_type !== 'monthly') {
            return response()->json(['error' => 'هذه المجموعة لا تستخدم نظام الدفع الشهري'], 400);
        }

        $relatedDate = Carbon::createFromDate($request->year, $request->month, 1);
        $paymentsCreated = 0;

        DB::transaction(function () use ($group, $relatedDate, &$paymentsCreated) {
            foreach ($group->assignedStudents as $student) {
                $payment = Payment::firstOrCreate(
                    [
                        'group_id' => $group->id,
                        'student_id' => $student->id,
                        'related_date' => $relatedDate,
                    ],
                    [
                        'payment_type' => 'monthly',
                        'amount' => $group->student_price,
                        'is_paid' => false,
                    ]
                );

                if ($payment->wasRecentlyCreated) {
                    $paymentsCreated++;
                }
            }
        });

        return response()->json([
            'message' => "تم إنشاء {$paymentsCreated} دفعة جديدة",
            'payments_created' => $paymentsCreated,
        ]);
    }

    /**
     * Generate per-session payments for a group
     */
    public function generateSessionPayments(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'session_date' => 'required|date',
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ]);

        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        $group = Group::where('user_id', $teacherId)
            ->where('id', $request->group_id)
            ->with('assignedStudents')
            ->firstOrFail();

        if ($group->payment_type !== 'per_session') {
            return response()->json(['error' => 'هذه المجموعة لا تستخدم نظام الدفع بالجلسة'], 400);
        }

        $sessionDate = Carbon::parse($request->session_date);
        $paymentsCreated = 0;

        DB::transaction(function () use ($group, $sessionDate, $request, &$paymentsCreated) {
            foreach ($request->student_ids as $studentId) {
                // Verify student belongs to this group
                $student = $group->assignedStudents->firstWhere('id', $studentId);
                if (!$student) {
                    continue;
                }

                $payment = Payment::firstOrCreate(
                    [
                        'group_id' => $group->id,
                        'student_id' => $studentId,
                        'related_date' => $sessionDate,
                    ],
                    [
                        'payment_type' => 'per_session',
                        'amount' => $group->student_price,
                        'is_paid' => false,
                    ]
                );

                if ($payment->wasRecentlyCreated) {
                    $paymentsCreated++;
                }
            }
        });

        return response()->json([
            'message' => "تم إنشاء {$paymentsCreated} دفعة جديدة للجلسة",
            'payments_created' => $paymentsCreated,
        ]);
    }

    /**
     * Update payment status
     */
    public function updatePayment(Request $request, Payment $payment)
    {
        $request->validate([
            'is_paid' => 'required|boolean',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        // Verify that the payment belongs to a group owned by the authenticated user
        $group = Group::where('user_id', $teacherId)
            ->where('id', $payment->group_id)
            ->first();

        if (!$group) {
            abort(403, 'Unauthorized access to this payment');
        }

        $payment->update([
            'is_paid' => $request->is_paid,
            'paid_at' => $request->is_paid && $request->paid_at ? $request->paid_at : null,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'تم تحديث حالة الدفع بنجاح');
    }

    /**
     * Bulk update payments
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'payments' => 'required|array',
            'payments.*.id' => 'required|exists:payments,id',
            'payments.*.is_paid' => 'required|boolean',
            'payments.*.paid_at' => 'nullable|date',
            'payments.*.notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;
        $paymentIds = collect($request->payments)->pluck('id');

        // Verify that all payments belong to groups owned by the authenticated user
        $payments = Payment::whereIn('id', $paymentIds)
            ->whereHas('group', function ($query) use ($teacherId) {
                $query->where('user_id', $teacherId);
            })
            ->get();

        if ($payments->count() !== count($paymentIds)) {
            return response()->json(['error' => 'غير مسموح بالوصول لبعض الدفعات'], 403);
        }

        DB::transaction(function () use ($request, $payments) {
            foreach ($request->payments as $paymentData) {
                $payment = $payments->firstWhere('id', $paymentData['id']);

                if ($payment) {
                    $payment->update([
                        'is_paid' => $paymentData['is_paid'],
                        'paid_at' => $paymentData['is_paid'] && isset($paymentData['paid_at']) ? $paymentData['paid_at'] : null,
                        'notes' => $paymentData['notes'] ?? null,
                    ]);
                }
            }
        });

        return response()->json(['message' => 'تم تحديث حالات الدفع بنجاح']);
    }

    /**
     * Delete a payment record
     */
    public function destroy(Payment $payment)
    {
        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        // Verify that the payment belongs to a group owned by the authenticated user
        $group = Group::where('user_id', $teacherId)
            ->where('id', $payment->group_id)
            ->firstOrFail();

        $payment->delete();

        return redirect()->back()->with('success', 'تم حذف سجل الدفع بنجاح');
    }

    /**
     * Store a newly created payment in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'group_id' => 'required|exists:groups,id',
            'payment_type' => 'required|in:monthly,per_session',
            'related_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'is_paid' => 'boolean',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        $teacherId = $user->type === 'assistant' ? $user->teacher_id : $user->id;

        // Ensure the group belongs to the authenticated user
        $group = Group::where('user_id', $teacherId)
            ->where('id', $request->group_id)
            ->firstOrFail();

        // Ensure the student belongs to the authenticated user
        $student = \App\Models\Student::where('user_id', $teacherId)
            ->where('id', $request->student_id)
            ->firstOrFail();

        Payment::create([
            'student_id' => $request->student_id,
            'group_id' => $request->group_id,
            'payment_type' => $request->payment_type,
            'related_date' => $request->related_date,
            'amount' => $request->amount,
            'is_paid' => $request->boolean('is_paid', false),
            'paid_at' => $request->is_paid ? ($request->paid_at ?: now()) : null,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'تم إنشاء الدفعة بنجاح');
    }
}
