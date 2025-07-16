<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use App\Models\Group;
use App\Models\GroupSchedule;

class UpdateGroupRequest extends FormRequest
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
            'subject' => 'nullable|string|max:255',
            'level' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'max_students' => 'required|integer|min:1|max:200',
            'is_active' => 'boolean',
            'payment_type' => 'required|in:monthly,per_session',
            'student_price' => 'required|numeric|min:0|max:999999.99',
            'academic_year_id' => 'required|exists:academic_years,id',
            'teacher_id' => 'nullable|exists:users,id',
            'schedules' => 'required|array|min:1|max:7',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.start_time' => 'required|date_format:H:i',
            'schedules.*.end_time' => 'required|date_format:H:i|after:schedules.*.start_time',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $this->validateScheduleConflicts($validator);
        });
    }

    /**
     * Validate that schedules don't conflict with existing groups
     */
    protected function validateScheduleConflicts($validator)
    {
        $schedules = $this->input('schedules', []);
        $groupId = null;
        
        // Try to get group ID from route parameter
        try {
            $groupId = $this->route('group') ? $this->route('group')->id : null;
        } catch (\Exception $e) {
            // If route parameter is not available, skip validation
            return;
        }
        
        foreach ($schedules as $index => $schedule) {
            $dayOfWeek = $schedule['day_of_week'];
            $startTime = $schedule['start_time'];
            $endTime = $schedule['end_time'];
            
            // Check for conflicts with existing groups for this user (excluding current group)
            $query = GroupSchedule::whereHas('group', function ($query) use ($groupId) {
                $query->where('user_id', Auth::id());
                if ($groupId) {
                    $query->where('id', '!=', $groupId); // Exclude current group
                }
            })
            ->where('day_of_week', $dayOfWeek)
            ->where(function ($query) use ($startTime, $endTime) {
                // Check if the new schedule overlaps with existing schedules
                $query->where(function ($q) use ($startTime, $endTime) {
                    // New schedule starts during existing schedule
                    $q->where('start_time', '<=', $startTime)
                      ->where('end_time', '>', $startTime);
                })->orWhere(function ($q) use ($startTime, $endTime) {
                    // New schedule ends during existing schedule
                    $q->where('start_time', '<', $endTime)
                      ->where('end_time', '>=', $endTime);
                })->orWhere(function ($q) use ($startTime, $endTime) {
                    // New schedule completely contains existing schedule
                    $q->where('start_time', '>=', $startTime)
                      ->where('end_time', '<=', $endTime);
                });
            })
            ->with('group');
            
            $conflictingSchedules = $query->get();
            
            if ($conflictingSchedules->isNotEmpty()) {
                $conflictingGroup = $conflictingSchedules->first()->group;
                $dayNames = [
                    0 => 'الأحد',
                    1 => 'الاثنين', 
                    2 => 'الثلاثاء',
                    3 => 'الأربعاء',
                    4 => 'الخميس',
                    5 => 'الجمعة',
                    6 => 'السبت'
                ];
                
                $validator->errors()->add(
                    "schedules.{$index}.start_time",
                    "يوجد تعارض في الجدول الزمني مع مجموعة '{$conflictingGroup->name}' في يوم {$dayNames[$dayOfWeek]} من {$conflictingSchedules->first()->start_time} إلى {$conflictingSchedules->first()->end_time}"
                );
            }
        }
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'اسم المجموعة مطلوب.',
            'name.string' => 'اسم المجموعة يجب أن يكون نص.',
            'name.max' => 'اسم المجموعة يجب ألا يتجاوز 255 حرف.',

            'description.string' => 'وصف المجموعة يجب أن يكون نص.',

            'max_students.required' => 'الحد الأقصى للطلاب مطلوب.',
            'max_students.integer' => 'الحد الأقصى للطلاب يجب أن يكون رقم صحيح.',
            'max_students.min' => 'الحد الأقصى للطلاب يجب أن يكون على الأقل 1.',
            'max_students.max' => 'الحد الأقصى للطلاب يجب ألا يتجاوز 200.',

            'is_active.boolean' => 'حالة المجموعة يجب أن تكون صحيحة أو خاطئة.',

            'payment_type.required' => 'نوع الدفع مطلوب.',
            'payment_type.in' => 'نوع الدفع يجب أن يكون شهري أو بالجلسة.',

            'student_price.required' => 'سعر الطالب مطلوب.',
            'student_price.numeric' => 'سعر الطالب يجب أن يكون رقم.',
            'student_price.min' => 'سعر الطالب يجب أن يكون 0 أو أكثر.',
            'student_price.max' => 'سعر الطالب يجب ألا يتجاوز 999,999.99.',

            'academic_year_id.required' => 'الصف الدراسي مطلوب.',
            'academic_year_id.exists' => 'الصف الدراسي المحدد غير صالح.',

            'schedules.required' => 'جدول المجموعة مطلوب.',
            'schedules.array' => 'جدول المجموعة يجب أن يكون مصفوفة.',
            'schedules.min' => 'يجب إضافة جلسة واحدة على الأقل.',
            'schedules.max' => 'لا يمكن إضافة أكثر من 7 جلسات.',

            'schedules.*.day_of_week.required' => 'يوم الأسبوع مطلوب لكل جلسة.',
            'schedules.*.day_of_week.integer' => 'يوم الأسبوع يجب أن يكون رقم صحيح.',
            'schedules.*.day_of_week.min' => 'يوم الأسبوع يجب أن يكون بين 0 و 6.',
            'schedules.*.day_of_week.max' => 'يوم الأسبوع يجب أن يكون بين 0 و 6.',

            'schedules.*.start_time.required' => 'وقت البداية مطلوب لكل جلسة.',
            'schedules.*.start_time.date_format' => 'وقت البداية يجب أن يكون بتنسيق HH:MM.',

            'schedules.*.end_time.required' => 'وقت النهاية مطلوب لكل جلسة.',
            'schedules.*.end_time.date_format' => 'وقت النهاية يجب أن يكون بتنسيق HH:MM.',
            'schedules.*.end_time.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية.',
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
            'name' => 'اسم المجموعة',
            'description' => 'وصف المجموعة',
            'max_students' => 'الحد الأقصى للطلاب',
            'is_active' => 'حالة المجموعة',
            'schedules' => 'الجدول الزمني',
            'schedules.*.day_of_week' => 'يوم الأسبوع',
            'schedules.*.start_time' => 'وقت البداية',
            'schedules.*.end_time' => 'وقت النهاية',
        ];
    }
}
