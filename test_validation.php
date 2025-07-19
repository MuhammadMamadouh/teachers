<?php

require_once 'vendor/autoload.php';

use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Validation\Rules;

// Test data
$data = [
    "name" => "حسين السيد",
    "email" => "hussain@gmail.com",
    "password" => "123456789",
    "password_confirmation" => "123456789",
    "phone" => "012708806636",
    "subject" => null,
    "governorate_id" => "21",
    "plan_id" => "7",
    "center_name" => "مركز الحاج ابو عدنان",
    "center_type" => "organization",
    "center_address" => "جنب البنزينة",
    "is_teacher" => false
];

// Test validation rules
$rules = [
    'name' => 'required|string|max:255',
    'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
    'password' => ['required', 'confirmed', Rules\Password::defaults()],
    'phone' => 'required|string|max:20',
    'subject' => 'required_if:is_teacher,1|nullable|string|max:255',
    'governorate_id' => 'required|exists:governorates,id',
    'plan_id' => 'nullable|exists:plans,id',
    'center_name' => 'required|string|max:255',
    'center_type' => 'required|in:individual,organization',
    'center_address' => 'nullable|string|max:255',
    'is_teacher' => 'boolean',
];

$validator = Validator::make($data, $rules);

if ($validator->fails()) {
    echo "Validation failed:\n";
    foreach ($validator->errors()->all() as $error) {
        echo "- $error\n";
    }
} else {
    echo "Validation passed!\n";
}
