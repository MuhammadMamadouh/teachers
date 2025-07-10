<?php

namespace App\Http\Requests;

use App\Rules\StudentNotInGroup;
use Illuminate\Foundation\Http\FormRequest;

class AssignStudentsRequest extends FormRequest
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
            'student_ids' => ['required', 'array', new StudentNotInGroup()],
            'student_ids.*' => 'exists:students,id',
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
            'student_ids.required' => 'يجب اختيار طالب واحد على الأقل.',
            'student_ids.array' => 'قائمة الطلاب يجب أن تكون مصفوفة.',
            'student_ids.*.exists' => 'الطالب المحدد غير موجود.',
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
            'student_ids' => 'الطلاب',
            'student_ids.*' => 'الطالب',
        ];
    }
}
