import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    BookOpen, 
    Users, 
    Calendar, 
    DollarSign, 
    Shield, 
    CheckCircle, 
    ArrowRight, 
    ArrowLeft,
    UserPlus,
    BarChart3,
    ChevronRight,
    Gift,
    Crown,
    Zap
} from 'lucide-react';

export default function Onboarding({ user }) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            id: 'welcome',
            title: 'مرحباً بك في منصة المعلمين',
            subtitle: 'دعنا نرشدك خلال الميزات الرئيسية لنظام إدارة المعلمين',
            content: (
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        أهلاً {user?.name}!
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                        نحن سعداء لانضمامك إلى منصة المعلمين. هذه جولة سريعة ستساعدك على فهم كيفية 
                        استخدام النظام لتنظيم عملك التعليمي بكفاءة أكبر.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="font-semibold text-green-800">سهل الاستخدام</div>
                            <div className="text-green-600">واجهة بسيطة ومفهومة</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="font-semibold text-blue-800">دعم شامل</div>
                            <div className="text-blue-600">مساعدة فنية متاحة دائماً</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'student-management',
            title: 'إدارة الطلاب',
            subtitle: 'نظم معلومات طلابك بطريقة احترافية',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 ml-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900">إضافة وتعديل بيانات الطلاب</h4>
                                <p className="text-gray-600 text-sm">أضف معلومات شاملة للطلاب مع إمكانية التعديل في أي وقت</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 ml-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900">تنظيم الطلاب في مجموعات</h4>
                                <p className="text-gray-600 text-sm">قسم طلابك حسب المستوى والعمر لتسهيل الإدارة</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 ml-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-gray-900">البحث والتصفية المتقدم</h4>
                                <p className="text-gray-600 text-sm">اعثر على أي طالب بسرعة باستخدام البحث الذكي</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                            <Gift className="w-5 h-5 text-blue-600 ml-2" />
                            <span className="text-sm font-medium text-blue-800">
                                نصيحة: ابدأ بإضافة مجموعة واحدة وأضف طلابك إليها
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'attendance-payments',
            title: 'الحضور والمدفوعات',
            subtitle: 'تتبع حضور الطلاب وإدارة المدفوعات بسهولة',
            content: (
                <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
                            <DollarSign className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">تتبع الحضور</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-green-500 ml-2" />
                                    تسجيل سريع للحضور والغياب
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-green-500 ml-2" />
                                    إحصائيات مفصلة للحضور
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-green-500 ml-2" />
                                    تقارير شهرية ويومية
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">إدارة المدفوعات</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-yellow-500 ml-2" />
                                    تتبع الرسوم الشهرية
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-yellow-500 ml-2" />
                                    إشعارات للمدفوعات المستحقة
                                </li>
                                <li className="flex items-center">
                                    <ChevronRight className="w-4 h-4 text-yellow-500 ml-2" />
                                    سجل كامل للمعاملات المالية
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'assistants-reports',
            title: 'المساعدين والتقارير',
            subtitle: 'تعاون مع فريقك واحصل على تقارير شاملة',
            content: (
                <div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                                <UserPlus className="w-5 h-5 ml-2" />
                                نظام المساعدين
                            </h4>
                            <p className="text-purple-700 text-sm">
                                أضف مساعدين لمساعدتك في إدارة الطلاب وتسجيل الحضور مع التحكم الكامل في الصلاحيات
                            </p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                                <BarChart3 className="w-5 h-5 ml-2" />
                                التقارير الشاملة
                            </h4>
                            <p className="text-red-700 text-sm">
                                احصل على تقارير مفصلة عن أداء الطلاب والإيرادات ومعدلات الحضور لاتخاذ قرارات مدروسة
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'security-support',
            title: 'الأمان والدعم',
            subtitle: 'بياناتك آمنة ودعمنا متاح دائماً',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-2">🔒 أمان البيانات</h4>
                            <ul className="text-green-700 text-sm space-y-1">
                                <li>• تشفير شامل لجميع البيانات</li>
                                <li>• نسخ احتياطية آمنة ومنتظمة</li>
                                <li>• حماية كاملة للمعلومات الشخصية</li>
                            </ul>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2">📞 الدعم الفني</h4>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• دعم فني متاح 24/7</li>
                                <li>• فريق متخصص للمساعدة</li>
                                <li>• تحديثات مجانية مستمرة</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'get-started',
            title: 'جاهز للبدء؟',
            subtitle: 'ابدأ رحلتك التعليمية المنظمة الآن',
            content: (
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        كل شيء جاهز!
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        أنت الآن جاهز لاستخدام منصة المعلمين. ابدأ بإضافة أول مجموعة من الطلاب 
                        واستكشف جميع الميزات المتاحة.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <div className="text-sm font-semibold text-green-800">أضف طلابك</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <div className="text-sm font-semibold text-blue-800">سجل الحضور</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                            <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                            <div className="text-sm font-semibold text-yellow-800">تتبع المدفوعات</div>
                        </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-center">
                            <Zap className="w-5 h-5 text-indigo-600 ml-2" />
                            <span className="text-sm font-medium text-indigo-800">
                                نصيحة: يمكنك دائماً الوصول لهذه الجولة من قائمة المساعدة
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const finishOnboarding = () => {
        // Mark onboarding as completed and redirect to dashboard
        router.post(route('onboarding.complete'), {}, {
            onSuccess: () => {
                router.visit(route('dashboard'));
            }
        });
    };

    const skipOnboarding = () => {
        finishOnboarding();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50" dir="rtl">
            <Head title="مرحباً بك في منصة المعلمين" />
            
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600 ml-3" />
                            <span className="text-xl font-bold text-gray-900">نظام إدارة المعلمين</span>
                        </div>
                        <button
                            onClick={skipOnboarding}
                            className="text-gray-500 hover:text-gray-700 text-sm underline"
                        >
                            تخطي الجولة
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            الخطوة {currentStep + 1} من {steps.length}
                        </span>
                        <span className="text-sm text-gray-500">
                            {Math.round(((currentStep + 1) / steps.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <h1 className="text-2xl font-bold text-white text-center">
                            {steps[currentStep].title}
                        </h1>
                        <p className="text-indigo-100 text-center mt-2">
                            {steps[currentStep].subtitle}
                        </p>
                    </div>
                    
                    <div className="px-8 py-12">
                        {steps[currentStep].content}
                    </div>

                    {/* Navigation */}
                    <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={prevStep}
                                disabled={currentStep === 0}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    currentStep === 0
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                                }`}
                            >
                                <ArrowRight className="w-4 h-4 ml-2" />
                                السابق
                            </button>

                            <div className="flex space-x-reverse space-x-2">
                                {steps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-3 h-3 rounded-full transition-colors ${
                                            index === currentStep
                                                ? 'bg-indigo-600'
                                                : index < currentStep
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>

                            {currentStep === steps.length - 1 ? (
                                <button
                                    onClick={finishOnboarding}
                                    className="flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    ابدأ الاستخدام
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                </button>
                            ) : (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    التالي
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-sm">
                        هل تحتاج مساعدة؟ 
                        <a href="https://wa.me/+201270770613" className="text-indigo-600 hover:underline mr-1">
                            تواصل معنا عبر الواتساب
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
