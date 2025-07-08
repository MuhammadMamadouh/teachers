<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Group;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $groups = Group::where('user_id', $user->id)
            ->with(['assignedStudents', 'payments.student'])
            ->get();

        return Inertia::render('Payments/Index', [
            'groups' => $groups,
        ]);
    }

    /**
     * Show payments for a specific group and date range
     */
    public function show(Request $request)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
        ]);

        $user = Auth::user();

        $group = Group::where('user_id', $user->id)
            ->where('id', $request->group_id)
            ->with(['assignedStudents'])
            ->firstOrFail();

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::now()->startOfMonth();
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::now()->endOfMonth();

        // Get payments for the specified date range
        $payments = Payment::where('group_id', $request->group_id)
            ->whereBetween('related_date', [$startDate, $endDate])
            ->with('student')
            ->get()
            ->groupBy('student_id');

        // Calculate summary statistics
        $totalExpected = 0;
        $totalPaid = 0;
        $totalUnpaid = 0;

        $studentPayments = $group->assignedStudents->map(function ($student) use ($payments, $group, $startDate, $endDate, &$totalExpected, &$totalPaid, &$totalUnpaid) {
            $studentPaymentsList = $payments->get($student->id, collect());
            
            $expectedAmount = 0;
            $paidAmount = 0;
            $unpaidAmount = 0;

            if ($group->payment_type === 'monthly') {
                // For monthly payments, calculate based on months in date range
                $months = $startDate->diffInMonths($endDate) + 1;
                $expectedAmount = $months * $group->student_price;
                $paidAmount = $studentPaymentsList->where('is_paid', true)->sum('amount');
                $unpaidAmount = $expectedAmount - $paidAmount;
            } else {
                // For per-session payments, sum up all payments
                $expectedAmount = $studentPaymentsList->sum('amount');
                $paidAmount = $studentPaymentsList->where('is_paid', true)->sum('amount');
                $unpaidAmount = $studentPaymentsList->where('is_paid', false)->sum('amount');
            }

            $totalExpected += $expectedAmount;
            $totalPaid += $paidAmount;
            $totalUnpaid += $unpaidAmount;

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
            'student_payments' => $studentPayments,
            'summary' => [
                'total_expected' => $totalExpected,
                'total_paid' => $totalPaid,
                'total_unpaid' => $totalUnpaid,
                'payment_percentage' => $totalExpected > 0 ? ($totalPaid / $totalExpected) * 100 : 0,
            ],
            'date_range' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
        ]);
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

        $group = Group::where('user_id', $user->id)
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

        // Verify that the payment belongs to a group owned by the authenticated user
        $group = Group::where('user_id', $user->id)
            ->where('id', $payment->group_id)
            ->firstOrFail();

        $payment->update([
            'is_paid' => $request->is_paid,
            'paid_at' => $request->is_paid && $request->paid_at ? $request->paid_at : null,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'تم تحديث حالة الدفع بنجاح',
            'payment' => $payment,
        ]);
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
        $paymentIds = collect($request->payments)->pluck('id');

        // Verify that all payments belong to groups owned by the authenticated user
        $payments = Payment::whereIn('id', $paymentIds)
            ->whereHas('group', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get();

        if ($payments->count() !== count($paymentIds)) {
            return response()->json(['error' => 'غير مسموح بالوصول لبعض الدفعات'], 403);
        }

        $updatedPayments = [];

        DB::transaction(function () use ($request, $payments, &$updatedPayments) {
            foreach ($request->payments as $paymentData) {
                $payment = $payments->firstWhere('id', $paymentData['id']);
                
                if ($payment) {
                    $payment->update([
                        'is_paid' => $paymentData['is_paid'],
                        'paid_at' => $paymentData['is_paid'] && $paymentData['paid_at'] ? $paymentData['paid_at'] : null,
                        'notes' => $paymentData['notes'],
                    ]);
                    
                    $updatedPayments[] = $payment;
                }
            }
        });

        return response()->json([
            'message' => 'تم تحديث حالات الدفع بنجاح',
            'payments' => $updatedPayments,
        ]);
    }

    /**
     * Delete a payment record
     */
    public function destroy(Payment $payment)
    {
        $user = Auth::user();

        // Verify that the payment belongs to a group owned by the authenticated user
        $group = Group::where('user_id', $user->id)
            ->where('id', $payment->group_id)
            ->firstOrFail();

        $payment->delete();

        return response()->json([
            'message' => 'تم حذف سجل الدفع بنجاح',
        ]);
    }
}
