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
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2050',
            'is_paid' => 'boolean',
            'amount' => 'nullable|numeric|min:0',
            'paid_date' => 'nullable|date',
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
            
            'month.required' => 'الشهر مطلوب.',
            'month.integer' => 'الشهر يجب أن يكون رقم صحيح.',
            'month.min' => 'الشهر يجب أن يكون بين 1 و 12.',
            'month.max' => 'الشهر يجب أن يكون بين 1 و 12.',
            
            'year.required' => 'السنة مطلوبة.',
            'year.integer' => 'السنة يجب أن تكون رقم صحيح.',
            'year.min' => 'السنة يجب أن تكون من 2020 أو أحدث.',
            'year.max' => 'السنة يجب أن تكون حتى 2050.',
            
            'is_paid.boolean' => 'حالة الدفع يجب أن تكون صحيحة أو خاطئة.',
            
            'amount.numeric' => 'مبلغ الدفع يجب أن يكون رقم.',
            'amount.min' => 'مبلغ الدفع يجب أن يكون 0 أو أكثر.',
            
            'paid_date.date' => 'تاريخ الدفع يجب أن يكون تاريخ صحيح.',
            
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
            'month' => 'الشهر',
            'year' => 'السنة',
            'is_paid' => 'حالة الدفع',
            'amount' => 'مبلغ الدفع',
            'paid_date' => 'تاريخ الدفع',
            'notes' => 'الملاحظات',
        ];
    }
}
