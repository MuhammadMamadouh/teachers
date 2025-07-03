<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\Student;

class StudentNotInGroup implements ValidationRule
{
    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Check if any of the student IDs are already assigned to a group
        $studentsInGroups = Student::whereIn('id', $value)
            ->whereNotNull('group_id')
            ->with('group')
            ->get();
            
        if ($studentsInGroups->count() > 0) {
            $studentNames = $studentsInGroups->map(function($student) {
                return $student->name . ' (في المجموعة: ' . $student->group->name . ')';
            })->join('، ');
            
            $fail("الطلاب التالية مُعينين بالفعل في مجموعات: {$studentNames}");
        }
    }
}
