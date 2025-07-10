<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>دعوة مساعد</title>
    <style>
        body { font-family: Arial, sans-serif; direction: rtl; text-align: right; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>تمت دعوتك لتكون مساعداً</h1>
        
        <p>{{ $teacher->name }} قام بدعوتك للانضمام كمساعد على منصة إدارة المعلمين.</p>

        <h2>معلومات تسجيل الدخول الخاصة بك</h2>
        <ul>
            <li><strong>رقم الهاتف:</strong> {{ $assistant->phone }}</li>
            @if($assistant->email)
            <li><strong>البريد الإلكتروني:</strong> {{ $assistant->email }}</li>
            @endif
            <li><strong>كلمة المرور المؤقتة:</strong> {{ $tempPassword }}</li>
        </ul>

        <p>يرجى تسجيل الدخول باستخدام الرابط أدناه وتغيير كلمة المرور المؤقتة الخاصة بك.</p>

        <a href="{{ route('login') }}" class="button">تسجيل الدخول الآن</a>

        <p>بعد تسجيل الدخول، ستتمكن من مساعدة {{ $teacher->name }} في إدارة الطلاب والمجموعات وتسجيل الحضور.</p>

        <p>شكراً لك،<br>
        {{ config('app.name') }}</p>
    </div>
</body>
</html>
