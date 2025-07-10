<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdatePaymentRequest extends FormRequest
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
            'payments' => 'required|array',
            'payments.*.student_id' => 'required|exists:students,id',
            'payments.*.group_id' => 'required|exists:groups,id',
            'payments.*.payment_type' => 'required|in:monthly,per_session',
            'payments.*.related_date' => 'required|date',
            'payments.*.is_paid' => 'boolean',
            'payments.*.amount' => 'nullable|numeric|min:0',
            'payments.*.paid_at' => 'nullable|date',
            'payments.*.notes' => 'nullable|string|max:1000',
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
            'payments.required' => 'قائمة المدفوعات مطلوبة.',
            'payments.array' => 'قائمة المدفوعات يجب أن تكون مصفوفة.',

            'payments.*.student_id.required' => 'معرف الطالب مطلوب لكل دفعة.',
            'payments.*.student_id.exists' => 'الطالب المحدد غير موجود.',

            'payments.*.group_id.required' => 'معرف المجموعة مطلوب لكل دفعة.',
            'payments.*.group_id.exists' => 'المجموعة المحددة غير موجودة.',

            'payments.*.payment_type.required' => 'نوع الدفع مطلوب لكل دفعة.',
            'payments.*.payment_type.in' => 'نوع الدفع يجب أن يكون شهري أو لكل حصة.',

            'payments.*.related_date.required' => 'تاريخ الدفع مطلوب لكل دفعة.',
            'payments.*.related_date.date' => 'تاريخ الدفع يجب أن يكون تاريخ صحيح.',

            'payments.*.is_paid.boolean' => 'حالة الدفع يجب أن تكون صحيحة أو خاطئة.',

            'payments.*.amount.numeric' => 'مبلغ الدفع يجب أن يكون رقم.',
            'payments.*.amount.min' => 'مبلغ الدفع يجب أن يكون 0 أو أكثر.',

            'payments.*.paid_at.date' => 'تاريخ الدفع يجب أن يكون تاريخ صحيح.',

            'payments.*.notes.string' => 'الملاحظات يجب أن تكون نص.',
            'payments.*.notes.max' => 'الملاحظات يجب ألا تتجاوز 1000 حرف.',
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
            'payments' => 'المدفوعات',
            'payments.*.student_id' => 'الطالب',
            'payments.*.group_id' => 'المجموعة',
            'payments.*.payment_type' => 'نوع الدفع',
            'payments.*.related_date' => 'تاريخ الدفع',
            'payments.*.is_paid' => 'حالة الدفع',
            'payments.*.amount' => 'مبلغ الدفع',
            'payments.*.paid_at' => 'تاريخ الدفع',
            'payments.*.notes' => 'الملاحظات',
        ];
    }
}
