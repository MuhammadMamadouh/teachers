<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Group;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        $groups = Group::where('user_id', $user->id)
            ->with(['students', 'payments.student'])
            ->get();

        return Inertia::render('Payments/Index', [
            'groups' => $groups,
        ]);
    }

    public function show(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2050',
        ]);

        $group = Group::where('user_id', $user->id)
            ->where('id', $request->group_id)
            ->with(['students'])
            ->firstOrFail();

        // Get existing payments for this group, month, and year
        $payments = Payment::where('group_id', $request->group_id)
            ->where('month', $request->month)
            ->where('year', $request->year)
            ->with('student')
            ->get()
            ->keyBy('student_id');

        // Create payment data for all students in the group
        $studentPayments = $group->students->map(function ($student) use ($payments, $request) {
            $payment = $payments->get($student->id);
            
            return [
                'student' => $student,
                'payment' => $payment ? [
                    'id' => $payment->id,
                    'is_paid' => $payment->is_paid,
                    'amount' => $payment->amount,
                    'paid_date' => $payment->paid_date?->format('Y-m-d'),
                    'notes' => $payment->notes,
                ] : [
                    'id' => null,
                    'is_paid' => false,
                    'amount' => null,
                    'paid_date' => null,
                    'notes' => null,
                ],
                'group_id' => $request->group_id,
                'month' => $request->month,
                'year' => $request->year,
            ];
        });

        return response()->json([
            'group' => $group,
            'payments' => $studentPayments,
            'month' => $request->month,
            'year' => $request->year,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'student_id' => 'required|exists:students,id',
            'group_id' => 'required|exists:groups,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2050',
            'is_paid' => 'boolean',
            'amount' => 'nullable|numeric|min:0',
            'paid_date' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Verify that the group belongs to the authenticated user
        $group = Group::where('user_id', $user->id)
            ->where('id', $request->group_id)
            ->firstOrFail();

        // Verify that the student belongs to the group
        $student = $group->assignedStudents()->where('students.id', $request->student_id)->firstOrFail();

        // Create or update payment record
        $payment = Payment::updateOrCreate(
            [
                'student_id' => $request->student_id,
                'group_id' => $request->group_id,
                'month' => $request->month,
                'year' => $request->year,
            ],
            [
                'is_paid' => $request->boolean('is_paid'),
                'amount' => $request->amount,
                'paid_date' => $request->is_paid && $request->paid_date ? $request->paid_date : null,
                'notes' => $request->notes,
            ]
        );

        return response()->json([
            'message' => 'تم حفظ حالة الدفع بنجاح',
            'payment' => $payment,
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'payments' => 'required|array',
            'payments.*.student_id' => 'required|exists:students,id',
            'payments.*.group_id' => 'required|exists:groups,id',
            'payments.*.month' => 'required|integer|min:1|max:12',
            'payments.*.year' => 'required|integer|min:2020|max:2050',
            'payments.*.is_paid' => 'boolean',
            'payments.*.amount' => 'nullable|numeric|min:0',
            'payments.*.paid_date' => 'nullable|date',
            'payments.*.notes' => 'nullable|string|max:1000',
        ]);

        $paymentsData = $request->payments;
        $groupIds = collect($paymentsData)->pluck('group_id')->unique();

        // Verify that all groups belong to the authenticated user
        $userGroups = Group::where('user_id', $user->id)
            ->whereIn('id', $groupIds)
            ->pluck('id');

        if ($userGroups->count() !== $groupIds->count()) {
            return response()->json(['error' => 'غير مسموح بالوصول لبعض المجموعات'], 403);
        }

        $updatedPayments = [];

        foreach ($paymentsData as $paymentData) {
            $payment = Payment::updateOrCreate(
                [
                    'student_id' => $paymentData['student_id'],
                    'group_id' => $paymentData['group_id'],
                    'month' => $paymentData['month'],
                    'year' => $paymentData['year'],
                ],
                [
                    'is_paid' => $paymentData['is_paid'] ?? false,
                    'amount' => $paymentData['amount'],
                    'paid_date' => $paymentData['is_paid'] && $paymentData['paid_date'] ? $paymentData['paid_date'] : null,
                    'notes' => $paymentData['notes'],
                ]
            );

            $updatedPayments[] = $payment;
        }

        return response()->json([
            'message' => 'تم حفظ حالات الدفع بنجاح',
            'payments' => $updatedPayments,
        ]);
    }

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
