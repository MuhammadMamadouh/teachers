<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShowPaymentRequest extends FormRequest
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
            'group_id' => 'required|exists:groups,id',
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2020|max:2050',
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
            'group_id' => 'المجموعة',
            'month' => 'الشهر',
            'year' => 'السنة',
        ];
    }
}
