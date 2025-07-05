<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => 'يجب قبول :attribute.',
    'accepted_if' => 'يجب قبول :attribute عندما :other يكون :value.',
    'active_url' => ':attribute ليس عنوان URL صالحاً.',
    'after' => 'يجب أن يكون :attribute تاريخاً بعد :date.',
    'after_or_equal' => 'يجب أن يكون :attribute تاريخاً بعد أو يساوي :date.',
    'alpha' => 'يجب أن يحتوي :attribute على أحرف فقط.',
    'alpha_dash' => 'يجب أن يحتوي :attribute على أحرف وأرقام وشرطات وشرطات سفلية فقط.',
    'alpha_num' => 'يجب أن يحتوي :attribute على أحرف وأرقام فقط.',
    'array' => 'يجب أن يكون :attribute مصفوفة.',
    'ascii' => 'يجب أن يحتوي :attribute على أحرف أبجدية رقمية أحادية البايت ورموز فقط.',
    'before' => 'يجب أن يكون :attribute تاريخاً قبل :date.',
    'before_or_equal' => 'يجب أن يكون :attribute تاريخاً قبل أو يساوي :date.',
    'between' => [
        'array' => 'يجب أن يحتوي :attribute على ما بين :min و :max عنصراً.',
        'file' => 'يجب أن يكون :attribute بين :min و :max كيلوبايت.',
        'numeric' => 'يجب أن يكون :attribute بين :min و :max.',
        'string' => 'يجب أن يكون :attribute بين :min و :max حرفاً.',
    ],
    'boolean' => 'يجب أن يكون حقل :attribute صحيحاً أو خاطئاً.',
    'can' => 'يحتوي حقل :attribute على قيمة غير مصرح بها.',
    'confirmed' => 'تأكيد :attribute غير متطابق.',
    'current_password' => 'كلمة المرور غير صحيحة.',
    'date' => ':attribute ليس تاريخاً صالحاً.',
    'date_equals' => 'يجب أن يكون :attribute تاريخاً يساوي :date.',
    'date_format' => ':attribute لا يطابق التنسيق :format.',
    'decimal' => 'يجب أن يحتوي :attribute على :decimal منازل عشرية.',
    'declined' => 'يجب رفض :attribute.',
    'declined_if' => 'يجب رفض :attribute عندما :other يكون :value.',
    'different' => 'يجب أن يكون :attribute و :other مختلفين.',
    'digits' => 'يجب أن يكون :attribute :digits رقماً.',
    'digits_between' => 'يجب أن يكون :attribute بين :min و :max رقماً.',
    'dimensions' => ':attribute له أبعاد صورة غير صالحة.',
    'distinct' => 'حقل :attribute له قيمة مكررة.',
    'doesnt_end_with' => 'يجب ألا ينتهي :attribute بأحد القيم التالية: :values.',
    'doesnt_start_with' => 'يجب ألا يبدأ :attribute بأحد القيم التالية: :values.',
    'email' => 'يجب أن يكون :attribute عنوان بريد إلكتروني صالحاً.',
    'ends_with' => 'يجب أن ينتهي :attribute بأحد القيم التالية: :values.',
    'enum' => ':attribute المحدد غير صالح.',
    'exists' => ':attribute المحدد غير صالح.',
    'extensions' => 'يجب أن يحتوي حقل :attribute على إحدى الامتدادات التالية: :values.',
    'file' => 'يجب أن يكون :attribute ملفاً.',
    'filled' => 'حقل :attribute يجب أن يحتوي على قيمة.',
    'gt' => [
        'array' => 'يجب أن يحتوي :attribute على أكثر من :value عنصراً.',
        'file' => 'يجب أن يكون :attribute أكبر من :value كيلوبايت.',
        'numeric' => 'يجب أن يكون :attribute أكبر من :value.',
        'string' => 'يجب أن يكون :attribute أكبر من :value حرفاً.',
    ],
    'gte' => [
        'array' => 'يجب أن يحتوي :attribute على :value عنصراً أو أكثر.',
        'file' => 'يجب أن يكون :attribute أكبر من أو يساوي :value كيلوبايت.',
        'numeric' => 'يجب أن يكون :attribute أكبر من أو يساوي :value.',
        'string' => 'يجب أن يكون :attribute أكبر من أو يساوي :value حرفاً.',
    ],
    'hex_color' => 'يجب أن يكون حقل :attribute لوناً سادس عشرياً صالحاً.',
    'image' => 'يجب أن يكون :attribute صورة.',
    'in' => ':attribute المحدد غير صالح.',
    'in_array' => 'حقل :attribute غير موجود في :other.',
    'integer' => 'يجب أن يكون :attribute عدداً صحيحاً.',
    'ip' => 'يجب أن يكون :attribute عنوان IP صالحاً.',
    'ipv4' => 'يجب أن يكون :attribute عنوان IPv4 صالحاً.',
    'ipv6' => 'يجب أن يكون :attribute عنوان IPv6 صالحاً.',
    'json' => 'يجب أن يكون :attribute نص JSON صالحاً.',
    'lowercase' => 'يجب أن يكون حقل :attribute بأحرف صغيرة.',
    'lt' => [
        'array' => 'يجب أن يحتوي :attribute على أقل من :value عنصراً.',
        'file' => 'يجب أن يكون :attribute أقل من :value كيلوبايت.',
        'numeric' => 'يجب أن يكون :attribute أقل من :value.',
        'string' => 'يجب أن يكون :attribute أقل من :value حرفاً.',
    ],
    'lte' => [
        'array' => 'يجب ألا يحتوي :attribute على أكثر من :value عنصراً.',
        'file' => 'يجب أن يكون :attribute أقل من أو يساوي :value كيلوبايت.',
        'numeric' => 'يجب أن يكون :attribute أقل من أو يساوي :value.',
        'string' => 'يجب أن يكون :attribute أقل من أو يساوي :value حرفاً.',
    ],
    'mac_address' => 'يجب أن يكون حقل :attribute عنوان MAC صالحاً.',
    'max' => [
        'array' => 'يجب ألا يحتوي :attribute على أكثر من :max عنصراً.',
        'file' => 'يجب ألا يكون :attribute أكبر من :max كيلوبايت.',
        'numeric' => 'يجب ألا يكون :attribute أكبر من :max.',
        'string' => 'يجب ألا يكون :attribute أكبر من :max حرفاً.',
    ],
    'max_digits' => 'يجب ألا يحتوي حقل :attribute على أكثر من :max رقماً.',
    'mimes' => 'يجب أن يكون :attribute ملفاً من نوع: :values.',
    'mimetypes' => 'يجب أن يكون :attribute ملفاً من نوع: :values.',
    'min' => [
        'array' => 'يجب أن يحتوي :attribute على الأقل :min عنصراً.',
        'file' => 'يجب أن يكون :attribute على الأقل :min كيلوبايت.',
        'numeric' => 'يجب أن يكون :attribute على الأقل :min.',
        'string' => 'يجب أن يكون :attribute على الأقل :min حرفاً.',
    ],
    'min_digits' => 'يجب أن يحتوي حقل :attribute على الأقل :min رقماً.',
    'missing' => 'يجب أن يكون حقل :attribute مفقوداً.',
    'missing_if' => 'يجب أن يكون حقل :attribute مفقوداً عندما :other يكون :value.',
    'missing_unless' => 'يجب أن يكون حقل :attribute مفقوداً ما لم يكن :other هو :value.',
    'missing_with' => 'يجب أن يكون حقل :attribute مفقوداً عندما :values موجود.',
    'missing_with_all' => 'يجب أن يكون حقل :attribute مفقوداً عندما :values موجودة.',
    'multiple_of' => 'يجب أن يكون حقل :attribute مضاعفاً لـ :value.',
    'not_in' => ':attribute المحدد غير صالح.',
    'not_regex' => 'تنسيق :attribute غير صالح.',
    'numeric' => 'يجب أن يكون :attribute رقماً.',
    'password' => [
        'letters' => 'يجب أن يحتوي حقل :attribute على حرف واحد على الأقل.',
        'mixed' => 'يجب أن يحتوي حقل :attribute على حرف كبير وحرف صغير على الأقل.',
        'numbers' => 'يجب أن يحتوي حقل :attribute على رقم واحد على الأقل.',
        'symbols' => 'يجب أن يحتوي حقل :attribute على رمز واحد على الأقل.',
        'uncompromised' => 'الـ :attribute المعطى ظهر في تسريب بيانات. يرجى اختيار :attribute مختلف.',
    ],
    'present' => 'حقل :attribute يجب أن يكون موجوداً.',
    'present_if' => 'يجب أن يكون حقل :attribute موجوداً عندما :other يكون :value.',
    'present_unless' => 'يجب أن يكون حقل :attribute موجوداً ما لم يكن :other هو :value.',
    'present_with' => 'يجب أن يكون حقل :attribute موجوداً عندما :values موجود.',
    'present_with_all' => 'يجب أن يكون حقل :attribute موجوداً عندما :values موجودة.',
    'prohibited' => 'حقل :attribute محظور.',
    'prohibited_if' => 'حقل :attribute محظور عندما :other يكون :value.',
    'prohibited_unless' => 'حقل :attribute محظور ما لم يكن :other في :values.',
    'prohibits' => 'حقل :attribute يحظر :other من التواجد.',
    'regex' => 'تنسيق :attribute غير صالح.',
    'required' => 'حقل :attribute مطلوب.',
    'required_array_keys' => 'يجب أن يحتوي حقل :attribute على إدخالات لـ: :values.',
    'required_if' => 'حقل :attribute مطلوب عندما :other يكون :value.',
    'required_if_accepted' => 'حقل :attribute مطلوب عندما يتم قبول :other.',
    'required_unless' => 'حقل :attribute مطلوب ما لم يكن :other في :values.',
    'required_with' => 'حقل :attribute مطلوب عندما :values موجود.',
    'required_with_all' => 'حقل :attribute مطلوب عندما :values موجودة.',
    'required_without' => 'حقل :attribute مطلوب عندما :values غير موجود.',
    'required_without_all' => 'حقل :attribute مطلوب عندما لا توجد أي من :values.',
    'same' => 'يجب أن يتطابق :attribute و :other.',
    'size' => [
        'array' => 'يجب أن يحتوي :attribute على :size عنصراً.',
        'file' => 'يجب أن يكون :attribute :size كيلوبايت.',
        'numeric' => 'يجب أن يكون :attribute :size.',
        'string' => 'يجب أن يكون :attribute :size حرفاً.',
    ],
    'starts_with' => 'يجب أن يبدأ :attribute بأحد القيم التالية: :values.',
    'string' => 'يجب أن يكون :attribute نصاً.',
    'timezone' => 'يجب أن يكون :attribute منطقة زمنية صالحة.',
    'unique' => ':attribute مُستخدم من قبل.',
    'uploaded' => 'فشل في تحميل :attribute.',
    'uppercase' => 'يجب أن يكون حقل :attribute بأحرف كبيرة.',
    'url' => 'يجب أن يكون :attribute عنوان URL صالحاً.',
    'ulid' => 'يجب أن يكون حقل :attribute ULID صالحاً.',
    'uuid' => 'يجب أن يكون :attribute UUID صالحاً.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'attribute-name' => [
            'rule-name' => 'رسالة مخصصة',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [
        'name' => 'الاسم',
        'username' => 'اسم المستخدم',
        'email' => 'البريد الإلكتروني',
        'first_name' => 'الاسم الأول',
        'last_name' => 'الاسم الأخير',
        'password' => 'كلمة المرور',
        'password_confirmation' => 'تأكيد كلمة المرور',
        'city' => 'المدينة',
        'country' => 'البلد',
        'address' => 'العنوان',
        'phone' => 'الهاتف',
        'mobile' => 'الجوال',
        'age' => 'العمر',
        'sex' => 'الجنس',
        'gender' => 'النوع',
        'day' => 'اليوم',
        'month' => 'الشهر',
        'year' => 'السنة',
        'hour' => 'الساعة',
        'minute' => 'الدقيقة',
        'second' => 'الثانية',
        'title' => 'العنوان',
        'content' => 'المحتوى',
        'description' => 'الوصف',
        'excerpt' => 'المقتطف',
        'date' => 'التاريخ',
        'time' => 'الوقت',
        'available' => 'متاح',
        'size' => 'الحجم',
        'subject' => 'المادة',
    ],
];
