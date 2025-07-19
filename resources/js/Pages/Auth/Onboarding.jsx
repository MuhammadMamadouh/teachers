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
    Gift,
    Crown,
    Zap,
    Play,
    Monitor,
    Smartphone,
    Globe,
    Database,
    FileText
} from 'lucide-react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Onboarding({ user, tutorialData, systemFeatures, quickStartGuide }) {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        {
            id: 'welcome',
            title: 'مرحباً بك في منصة المعلمين',
            subtitle: 'نظام متكامل لإدارة العملية التعليمية والمالية',
            content: (
                <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        أهلاً {user?.name}!
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        مرحباً بك في منصة المعلمين - النظام الأكثر تطوراً لإدارة العملية التعليمية في الوطن العربي. 
                        سنأخذك في جولة شاملة لتتعلم كيفية استخدام جميع ميزات النظام بكفاءة.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <Monitor className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <div className="font-semibold text-green-800">متجاوب</div>
                            <div className="text-green-600">يعمل على جميع الأجهزة</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                            <div className="font-semibold text-blue-800">آمن</div>
                            <div className="text-blue-600">حماية متقدمة للبيانات</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <Globe className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                            <div className="font-semibold text-purple-800">عربي</div>
                            <div className="text-purple-600">دعم كامل للعربية</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <Database className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                            <div className="font-semibold text-orange-800">سحابي</div>
                            <div className="text-orange-600">بياناتك آمنة دائماً</div>
                        </div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-center">
                            <Play className="w-5 h-5 text-indigo-600 ml-2" />
                            <span className="text-sm font-medium text-indigo-800">
                                ستستغرق الجولة حوالي 5 دقائق فقط
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard-overview',
            title: 'جولة في لوحة التحكم',
            subtitle: 'تعرف على واجهة النظام الرئيسية',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                                <Monitor className="w-5 h-5 ml-2" />
                                عناصر لوحة التحكم الرئيسية
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                    <span className="text-blue-700">إحصائيات سريعة للطلاب والحضور</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                    <span className="text-blue-700">ملخص المدفوعات والمتأخرات</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                    <span className="text-blue-700">قائمة الأنشطة الحديثة</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                    <span className="text-blue-700">الإجراءات السريعة والاختصارات</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start">
                                <Gift className="w-5 h-5 text-orange-600 mt-1 ml-3 flex-shrink-0" />
                                <div>
                                    <h5 className="font-semibold text-gray-900">نصيحة مهمة</h5>
                                    <p className="text-gray-600 text-sm">يمكنك الوصول لجميع الميزات من القائمة الجانبية. كل قسم مقسم بشكل منطقي لسهولة الاستخدام.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'student-management',
            title: 'إدارة الطلاب والمجموعات',
            subtitle: tutorialData?.student_management?.description || 'نظم معلومات طلابك بطريقة احترافية',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-green-50 p-6 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-4">خطوات إدارة الطلاب:</h4>
                            {tutorialData?.student_management?.steps ? (
                                <ol className="space-y-3">
                                    {tutorialData.student_management.steps.map((step, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold ml-3 mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-green-700">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="space-y-3 text-sm text-green-700">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        <span>إضافة وتعديل بيانات الطلاب مع معلومات شاملة</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        <span>تنظيم الطلاب في مجموعات حسب المستوى</span>
                                    </div>
                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        <span>البحث والتصفية المتقدم للطلاب</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h5 className="font-semibold text-blue-900 mb-2">ميزات إضافية</h5>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>• رفع صور الطلاب</li>
                                    <li>• معلومات أولياء الأمور</li>
                                    <li>• ملاحظات خاصة لكل طالب</li>
                                </ul>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h5 className="font-semibold text-purple-900 mb-2">أدوات التنظيم</h5>
                                <ul className="text-sm text-purple-700 space-y-1">
                                    <li>• مجموعات متعددة المستويات</li>
                                    <li>• تصنيف بالألوان</li>
                                    <li>• تصدير قوائم الطلاب</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'attendance-tracking',
            title: 'تسجيل الحضور والغياب',
            subtitle: tutorialData?.attendance_tracking?.description || 'تتبع حضور الطلاب بدقة ومرونة',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-4">كيفية تسجيل الحضور:</h4>
                            {tutorialData?.attendance_tracking?.steps ? (
                                <ol className="space-y-3">
                                    {tutorialData.attendance_tracking.steps.map((step, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold ml-3 mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-blue-700">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                            <span className="text-blue-700">تسجيل سريع بنقرة واحدة</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                            <span className="text-blue-700">تعديل الحضور لاحقاً</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                            <span className="text-blue-700">ملاحظات على الغياب</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                            <span className="text-blue-700">إحصائيات مفصلة</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                            <span className="text-blue-700">تقارير شهرية</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-blue-600 ml-2" />
                                            <span className="text-blue-700">تنبيهات الغياب</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-green-900 mb-2 flex items-center">
                                <Smartphone className="w-4 h-4 ml-2" />
                                ميزات متقدمة
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="text-green-700">
                                    <strong>تسجيل جماعي:</strong><br/>
                                    تسجيل حضور المجموعة كاملة بنقرة واحدة
                                </div>
                                <div className="text-green-700">
                                    <strong>التاريخ المرن:</strong><br/>
                                    تسجيل الحضور لأي تاريخ سابق أو مستقبلي
                                </div>
                                <div className="text-green-700">
                                    <strong>نسخ الحضور:</strong><br/>
                                    نسخ نمط الحضور من يوم آخر
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'payment-management',
            title: 'إدارة المدفوعات والرسوم',
            subtitle: tutorialData?.payment_management?.description || 'تتبع المدفوعات والمتأخرات بكل سهولة',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-yellow-50 p-6 rounded-lg">
                            <h4 className="font-semibold text-yellow-900 mb-4">نظام المدفوعات المتكامل:</h4>
                            {tutorialData?.payment_management?.steps ? (
                                <ol className="space-y-3">
                                    {tutorialData.payment_management.steps.map((step, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold ml-3 mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-yellow-700">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-semibold text-yellow-800 mb-2">تسجيل المدفوعات</h5>
                                        <ul className="space-y-1 text-sm text-yellow-700">
                                            <li>• إضافة مدفوعات شهرية</li>
                                            <li>• تسجيل مدفوعات جزئية</li>
                                            <li>• ملاحظات على كل دفعة</li>
                                            <li>• طرق دفع متعددة</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-yellow-800 mb-2">التقارير المالية</h5>
                                        <ul className="space-y-1 text-sm text-yellow-700">
                                            <li>• تقارير الإيرادات</li>
                                            <li>• قوائم المتأخرات</li>
                                            <li>• إحصائيات شهرية</li>
                                            <li>• تصدير للإكسل</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <h5 className="font-semibold text-red-900 mb-2 flex items-center">
                                <FileText className="w-4 h-4 ml-2" />
                                تنبيهات ذكية
                            </h5>
                            <p className="text-red-700 text-sm">
                                يقوم النظام بإرسال تنبيهات تلقائية للمدفوعات المستحقة والمتأخرة، 
                                مما يساعدك على متابعة الوضع المالي بدقة.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        // Add role-specific content
        ...(user?.hasRole && user.hasRole('center-owner') ? [
            {
                id: 'teacher-management',
                title: 'إدارة المعلمين',
                subtitle: tutorialData?.teacher_management?.description || 'أضف معلمين وادر صلاحياتهم',
                content: (
                    <div>
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserPlus className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-6">
                            <div className="bg-purple-50 p-6 rounded-lg">
                                <h4 className="font-semibold text-purple-900 mb-4">إدارة فريق المعلمين:</h4>
                                {tutorialData?.teacher_management?.steps ? (
                                    <ol className="space-y-3">
                                        {tutorialData.teacher_management.steps.map((step, index) => (
                                            <li key={index} className="flex items-start">
                                                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold ml-3 mt-0.5">
                                                    {index + 1}
                                                </span>
                                                <span className="text-purple-700">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="font-semibold text-purple-800 mb-2">إضافة معلمين</h5>
                                            <ul className="space-y-1 text-sm text-purple-700">
                                                <li>• دعوة معلمين جدد</li>
                                                <li>• تحديد الصلاحيات</li>
                                                <li>• تخصيص المجموعات</li>
                                                <li>• متابعة الأداء</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-purple-800 mb-2">الرقابة والمتابعة</h5>
                                            <ul className="space-y-1 text-sm text-purple-700">
                                                <li>• تقارير أداء المعلمين</li>
                                                <li>• إحصائيات التدريس</li>
                                                <li>• مراجعة الأنشطة</li>
                                                <li>• تقييم الأداء</li>
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            },
            {
                id: 'financial-reports',
                title: 'التقارير المالية',
                subtitle: tutorialData?.financial_reports?.description || 'تقارير شاملة عن إيرادات المركز',
                content: (
                    <div>
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-6">
                            <div className="bg-green-50 p-6 rounded-lg">
                                <h4 className="font-semibold text-green-900 mb-4">التقارير المتاحة:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h5 className="font-semibold text-green-800 mb-2">تقارير الإيرادات</h5>
                                        <ul className="space-y-1 text-sm text-green-700">
                                            <li>• إيرادات شهرية ويومية</li>
                                            <li>• مقارنات بين الفترات</li>
                                            <li>• تحليل النمو المالي</li>
                                            <li>• توقعات مالية</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-green-800 mb-2">تحليل الأداء</h5>
                                        <ul className="space-y-1 text-sm text-green-700">
                                            <li>• أداء المعلمين مالياً</li>
                                            <li>• أكثر المجموعات ربحية</li>
                                            <li>• تحليل التكاليف</li>
                                            <li>• مؤشرات الأداء الرئيسية</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        ] : []),
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
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">أنواع التقارير المتاحة</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="text-blue-700">
                                    <strong>تقارير الحضور:</strong><br/>
                                    إحصائيات مفصلة عن حضور وغياب الطلاب
                                </div>
                                <div className="text-blue-700">
                                    <strong>التقارير المالية:</strong><br/>
                                    تحليل شامل للإيرادات والمستحقات
                                </div>
                                <div className="text-blue-700">
                                    <strong>تقارير الأداء:</strong><br/>
                                    متابعة تقدم الطلاب والمعلمين
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'security-support',
            title: 'الأمان والدعم الفني',
            subtitle: 'بياناتك آمنة ودعمنا متاح دائماً',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-6">
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-4">🔒 أمان البيانات المتقدم</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ul className="text-green-700 text-sm space-y-2">
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        تشفير SSL 256-bit للبيانات
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        نسخ احتياطية آمنة كل 6 ساعات
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        حماية كاملة للمعلومات الشخصية
                                    </li>
                                </ul>
                                <ul className="text-green-700 text-sm space-y-2">
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        مراقبة الأمان على مدار الساعة
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        امتثال لمعايير حماية البيانات
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        سجل آمن لجميع العمليات
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-4">📞 الدعم الفني المتخصص</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-semibold text-blue-800 mb-2">قنوات التواصل</h5>
                                    <ul className="text-blue-700 text-sm space-y-1">
                                        <li>• واتساب: دعم فوري</li>
                                        <li>• البريد الإلكتروني</li>
                                        <li>• الهاتف المباشر</li>
                                        <li>• نظام التذاكر الداخلي</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-blue-800 mb-2">خدمات إضافية</h5>
                                    <ul className="text-blue-700 text-sm space-y-1">
                                        <li>• تدريب مجاني على النظام</li>
                                        <li>• دليل المستخدم المصور</li>
                                        <li>• فيديوهات تعليمية</li>
                                        <li>• تحديثات مستمرة</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        {systemFeatures && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-3">مميزات النظام الإضافية:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                                    {Object.entries(systemFeatures).map(([key, feature]) => (
                                        <div key={key} className="flex items-center">
                                            <CheckCircle className="w-4 h-4 text-green-500 ml-2 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            id: 'quick-start',
            title: 'دليل البداية السريعة',
            subtitle: quickStartGuide?.title || 'خطواتك الأولى في النظام',
            content: (
                <div>
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Play className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-6">
                        {quickStartGuide && (
                            <div className="bg-indigo-50 p-6 rounded-lg">
                                <h4 className="font-semibold text-indigo-900 mb-4">{quickStartGuide.title}</h4>
                                <ol className="space-y-3">
                                    {quickStartGuide.steps.map((step, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold ml-3 mt-0.5">
                                                {index + 1}
                                            </span>
                                            <span className="text-indigo-700 font-medium">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                                <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
                                <h5 className="font-semibold text-green-800 text-center mb-2">ابدأ بالطلاب</h5>
                                <p className="text-sm text-green-700 text-center">أضف طلابك ونظمهم في مجموعات</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                                <h5 className="font-semibold text-blue-800 text-center mb-2">سجل الحضور</h5>
                                <p className="text-sm text-blue-700 text-center">ابدأ بتسجيل حضور طلابك يومياً</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
                                <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                                <h5 className="font-semibold text-yellow-800 text-center mb-2">تتبع المدفوعات</h5>
                                <p className="text-sm text-yellow-700 text-center">سجل المدفوعات وتابع المستحقات</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'ready-to-start',
            title: 'مستعد للبدء؟',
            subtitle: 'كل شيء جاهز لتبدأ رحلتك التعليمية المنظمة',
            content: (
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        تهانينا! أنت جاهز الآن 🎉
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
                        لقد أتممت الجولة التعريفية بنجاح! أنت الآن تعرف كيفية استخدام جميع ميزات منصة المعلمين. 
                        حان الوقت للبدء في تنظيم عملك التعليمي والاستفادة من جميع الأدوات المتاحة.
                    </p>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200 mb-8">
                        <h4 className="font-semibold text-indigo-900 mb-4">ما الذي تعلمته اليوم؟</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="font-medium text-gray-800">إدارة الطلاب</div>
                                <div className="text-gray-600">والمجموعات</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="font-medium text-gray-800">تسجيل الحضور</div>
                                <div className="text-gray-600">والغياب</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <DollarSign className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="font-medium text-gray-800">إدارة المدفوعات</div>
                                <div className="text-gray-600">والمالية</div>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <BarChart3 className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="font-medium text-gray-800">التقارير</div>
                                <div className="text-gray-600">والإحصائيات</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8">
                        <h4 className="font-semibold text-yellow-900 mb-3 flex items-center justify-center">
                            <Gift className="w-5 h-5 ml-2" />
                            نصائح للنجاح
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="text-yellow-800">
                                <strong>ابدأ صغيراً:</strong> أضف بعض الطلاب أولاً ثم وسع تدريجياً
                            </div>
                            <div className="text-yellow-800">
                                <strong>كن منتظماً:</strong> سجل الحضور والمدفوعات يومياً
                            </div>
                            <div className="text-yellow-800">
                                <strong>استخدم التقارير:</strong> راجعها أسبوعياً لتتبع التقدم
                            </div>
                            <div className="text-yellow-800">
                                <strong>لا تتردد:</strong> تواصل معنا عند أي استفسار
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-center">
                            <Zap className="w-5 h-5 text-indigo-600 ml-2" />
                            <span className="text-sm font-medium text-indigo-800">
                                يمكنك دائماً إعادة مشاهدة هذه الجولة من قائمة المساعدة
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
                            <ApplicationLogo className="h-8 w-8 text-indigo-600 ml-3" />
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
