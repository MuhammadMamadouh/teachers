<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Display the onboarding page.
     */
    public function show(): Response
    {
        $user = Auth::user();
        
        // Get user-specific tutorial content based on their role
        $tutorialData = $this->getTutorialDataForUser($user);
        
        return Inertia::render('Auth/Onboarding', [
            'user' => $user,
            'tutorialData' => $tutorialData,
            'systemFeatures' => $this->getSystemFeatures(),
            'quickStartGuide' => $this->getQuickStartGuide($user),
        ]);
    }

    /**
     * Get tutorial data specific to user role
     */
    private function getTutorialDataForUser($user): array
    {
        $baseFeatures = [
            'student_management' => [
                'title' => 'إدارة الطلاب',
                'description' => 'أضف وادر طلابك بطريقة منظمة',
                'steps' => [
                    'انقر على "الطلاب" من القائمة الرئيسية',
                    'اضغط على "إضافة طالب جديد"',
                    'املأ بيانات الطالب الأساسية',
                    'حدد المجموعة المناسبة للطالب',
                    'احفظ البيانات وابدأ التدريس'
                ]
            ],
            'attendance_tracking' => [
                'title' => 'تسجيل الحضور',
                'description' => 'تتبع حضور وغياب الطلاب يومياً',
                'steps' => [
                    'اذهب إلى صفحة "الحضور والغياب"',
                    'اختر المجموعة والتاريخ المطلوب',
                    'أشر على الطلاب الحاضرين بالعلامة الخضراء',
                    'اتركأيقونة الغياب للطلاب الغائبين',
                    'احفظ سجل الحضور'
                ]
            ],
            'payment_management' => [
                'title' => 'إدارة المدفوعات',
                'description' => 'تتبع رسوم الطلاب والمدفوعات',
                'steps' => [
                    'انتقل إلى قسم "المدفوعات"',
                    'سجل المبالغ المستحقة للطلاب',
                    'اشر على المدفوعات المحصلة',
                    'راجع التقارير المالية الشهرية',
                    'تابع المتأخرات والمستحقات'
                ]
            ]
        ];

        // Add role-specific features
        if ($user->hasRole('center-owner')) {
            $baseFeatures['teacher_management'] = [
                'title' => 'إدارة المعلمين',
                'description' => 'أضف معلمين وادر صلاحياتهم في المركز',
                'steps' => [
                    'اذهب إلى "إدارة المعلمين"',
                    'اضغط على "إضافة معلم جديد"',
                    'أدخل بيانات المعلم وحدد صلاحياته',
                    'اختر المجموعات التي سيدرسها',
                    'فعل حساب المعلم ليبدأ الاستخدام'
                ]
            ];

            $baseFeatures['financial_reports'] = [
                'title' => 'التقارير المالية',
                'description' => 'تقارير شاملة عن إيرادات ومصاريف المركز',
                'steps' => [
                    'انتقل إلى "التقارير المالية"',
                    'اختر نوع التقرير المطلوب',
                    'حدد الفترة الزمنية للتقرير',
                    'راجع الإحصائيات والرسوم البيانية',
                    'صدر التقرير بصيغة PDF إذا أردت'
                ]
            ];
        }

        return $baseFeatures;
    }

    /**
     * Get system features overview
     */
    private function getSystemFeatures(): array
    {
        return [
            'mobile_friendly' => 'واجهة متجاوبة تعمل على الجوال والكمبيوتر',
            'secure_data' => 'حماية البيانات بتشفير متقدم ونسخ احتياطية آمنة',
            'real_time_sync' => 'مزامنة فورية للبيانات عبر جميع الأجهزة',
            'arabic_support' => 'دعم كامل للغة العربية مع واجهة من اليمين لليسار',
            'offline_mode' => 'إمكانية العمل بدون إنترنت مع المزامنة اللاحقة',
            'automated_backups' => 'نسخ احتياطية تلقائية للبيانات كل 24 ساعة'
        ];
    }

    /**
     * Get quick start guide based on user role
     */
    private function getQuickStartGuide($user): array
    {
        if ($user->hasRole('center-owner')) {
            return [
                'title' => 'دليل البداية السريعة لمالك المركز',
                'steps' => [
                    'أكمل بيانات المركز في صفحة "الإعدادات"',
                    'أضف أول معلم في قسم "إدارة المعلمين"',
                    'قم بإنشاء أول مجموعة دراسية',
                    'أضف بعض الطلاب للمجموعة',
                    'تصفح التقارير المالية والإحصائيات'
                ]
            ];
        }

        return [
            'title' => 'دليل البداية السريعة للمعلم',
            'steps' => [
                'أكمل بيانات ملفك الشخصي',
                'أنشئ أول مجموعة طلابية',
                'أضف طلابك إلى المجموعة',
                'سجل أول حضور للطلاب',
                'أضف أول مدفوعات للطلاب'
            ]
        ];
    }

    /**
     * Mark onboarding as completed for the user.
     */
    public function complete(Request $request): RedirectResponse
    {
        $user = Auth::user();

        // Update user to mark onboarding as completed
        $user->onboarding_completed = true;
        $user->onboarding_completed_at = now();
        $user->save();

        // Redirect based on approval status
        if (!$user->is_approved && !$user->is_admin) {
            return redirect()->route('pending-approval')->with('success', 'تم إكمال الجولة التعريفية بنجاح! في انتظار موافقة الإدارة على حسابك.');
        }

        return redirect()->route('dashboard')->with('success', 'مرحباً بك! تم إكمال الجولة التعريفية بنجاح.');
    }

    /**
     * Check if user needs to see onboarding
     */
    public static function shouldShowOnboarding($user): bool
    {
        return !$user->onboarding_completed;
    }
}
