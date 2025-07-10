<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'group_id' => 'required|exists:groups,id',
            'payment_type' => 'required|in:monthly,per_session',
            'related_date' => 'required|date',
            'is_paid' => 'boolean',
            'amount' => 'nullable|numeric|min:0',
            'paid_at' => 'nullable|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'student_id.required' => 'معرف الطالب مطلوب.',
            'student_id.exists' => 'الطالب المحدد غير موجود.',

            'group_id.required' => 'معرف المجموعة مطلوب.',
            'group_id.exists' => 'المجموعة المحددة غير موجودة.',

            'payment_type.required' => 'نوع الدفع مطلوب.',
            'payment_type.in' => 'نوع الدفع يجب أن يكون شهري أو لكل حصة.',

            'related_date.required' => 'تاريخ الدفع مطلوب.',
            'related_date.date' => 'تاريخ الدفع يجب أن يكون تاريخ صحيح.',

            'is_paid.boolean' => 'حالة الدفع يجب أن تكون صحيحة أو خاطئة.',

            'amount.numeric' => 'مبلغ الدفع يجب أن يكون رقم.',
            'amount.min' => 'مبلغ الدفع يجب أن يكون 0 أو أكثر.',

            'paid_at.date' => 'تاريخ الدفع يجب أن يكون تاريخ صحيح.',

            'notes.string' => 'الملاحظات يجب أن تكون نص.',
            'notes.max' => 'الملاحظات يجب ألا تتجاوز 1000 حرف.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'student_id' => 'الطالب',
            'group_id' => 'المجموعة',
            'payment_type' => 'نوع الدفع',
            'related_date' => 'تاريخ الدفع',
            'is_paid' => 'حالة الدفع',
            'amount' => 'مبلغ الدفع',
            'paid_at' => 'تاريخ الدفع',
            'notes' => 'الملاحظات',
        ];
    }
}
