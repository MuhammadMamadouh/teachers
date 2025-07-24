<?php

namespace App\Http\Requests\Auth;

use App\Enums\CenterType;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class RegisterRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::min(8)],
            'phone' => 'required|string|max:20|unique:' . User::class,
            'subject' => 'required_if:is_teacher,1|nullable|string|max:255',
            'governorate_id' => 'required|exists:governorates,id',
            'plan_id' => 'required|exists:plans,id',
            'center_name' => 'required|string|max:255',
            'center_type' => 'required|in:' . implode(',', array_column(CenterType::cases(), 'value')),
            'center_address' => 'nullable|string|max:255',
            'is_teacher' => 'boolean',
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
            // Name validation messages
            'name.required' => 'الاسم الكامل مطلوب',
            'name.string' => 'الاسم يجب أن يكون نص',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرف',

            // Email validation messages
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.string' => 'البريد الإلكتروني يجب أن يكون نص',
            'email.lowercase' => 'البريد الإلكتروني يجب أن يكون بأحرف صغيرة',
            'email.email' => 'البريد الإلكتروني يجب أن يكون بتنسيق صحيح',
            'email.max' => 'البريد الإلكتروني يجب ألا يتجاوز 255 حرف',
            'email.unique' => 'البريد الإلكتروني مُستخدم من قبل',

            // Password validation messages
            'password.required' => 'كلمة المرور مطلوبة',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق',

            // Phone validation messages
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.string' => 'رقم الهاتف يجب أن يكون نص',
            'phone.max' => 'رقم الهاتف يجب ألا يتجاوز 20 رقم',

            // Subject validation messages
            'subject.required_if' => 'المادة مطلوبة إذا كنت معلماً',
            'subject.string' => 'المادة يجب أن تكون نص',
            'subject.max' => 'المادة يجب ألا تتجاوز 255 حرف',

            // Governorate validation messages
            'governorate_id.required' => 'المحافظة مطلوبة',
            'governorate_id.exists' => 'المحافظة المختارة غير صحيحة',

            // Plan validation messages
            'plan_id.exists' => 'خطة الاشتراك المختارة غير صحيحة',

            // Center name validation messages
            'center_name.required' => 'اسم المركز مطلوب',
            'center_name.string' => 'اسم المركز يجب أن يكون نص',
            'center_name.max' => 'اسم المركز يجب ألا يتجاوز 255 حرف',

            // Center type validation messages
            'center_type.required' => 'نوع المركز مطلوب',
            'center_type.in' => 'نوع المركز المختار غير صحيح',

            // Center address validation messages
            'center_address.string' => 'عنوان المركز يجب أن يكون نص',
            'center_address.max' => 'عنوان المركز يجب ألا يتجاوز 255 حرف',

            // Is teacher validation messages
            'is_teacher.boolean' => 'حقل المعلم يجب أن يكون صحيح أو خطأ',
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
            'name' => 'الاسم الكامل',
            'email' => 'البريد الإلكتروني',
            'password' => 'كلمة المرور',
            'password_confirmation' => 'تأكيد كلمة المرور',
            'phone' => 'رقم الهاتف',
            'subject' => 'المادة',
            'governorate_id' => 'المحافظة',
            'plan_id' => 'خطة الاشتراك',
            'center_name' => 'اسم المركز',
            'center_type' => 'نوع المركز',
            'center_address' => 'عنوان المركز',
            'is_teacher' => 'المعلم',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Auto-set teacher status for individual centers
        if ($this->center_type === CenterType::INDIVIDUAL->value) {
            $this->merge(['is_teacher' => true]);
        }
    }
}
