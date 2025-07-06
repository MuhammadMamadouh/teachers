<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSpecialSessionRequest extends FormRequest
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
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'description' => 'nullable|string|max:255',
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
            'date.required' => 'تاريخ الجلسة الخاصة مطلوب.',
            'date.date' => 'تاريخ الجلسة الخاصة يجب أن يكون تاريخ صحيح.',
            
            'start_time.required' => 'وقت بداية الجلسة الخاصة مطلوب.',
            'start_time.date_format' => 'وقت بداية الجلسة الخاصة يجب أن يكون بتنسيق HH:MM.',
            
            'end_time.required' => 'وقت نهاية الجلسة الخاصة مطلوب.',
            'end_time.date_format' => 'وقت نهاية الجلسة الخاصة يجب أن يكون بتنسيق HH:MM.',
            'end_time.after' => 'وقت نهاية الجلسة يجب أن يكون بعد وقت البداية.',
            
            'description.string' => 'وصف الجلسة الخاصة يجب أن يكون نص.',
            'description.max' => 'وصف الجلسة الخاصة يجب ألا يتجاوز 255 حرف.',
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
            'date' => 'تاريخ الجلسة الخاصة',
            'start_time' => 'وقت البداية',
            'end_time' => 'وقت النهاية',
            'description' => 'وصف الجلسة الخاصة',
        ];
    }
}
