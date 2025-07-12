import { Head, Link } from '@inertiajs/react';
import { Users, BookOpen, Calendar, DollarSign, Shield, Star, CheckCircle, ArrowLeft, UserPlus, BarChart3, CreditCard } from 'lucide-react';

export default function Welcome({ auth, plans = [] }) {
    const features = [
        {
            icon: <Users className="w-8 h-8 text-indigo-600" />,
            title: "إدارة الطلاب",
            description: "نظم معلومات طلابك وتواصل مع أولياء الأمور بسهولة. إضافة وتعديل بيانات الطلاب مع إمكانية التصفية والبحث المتقدم."
        },
        {
            icon: <BookOpen className="w-8 h-8 text-green-600" />,
            title: "تنظيم المجموعات",
            description: "اقسم طلابك إلى مجموعات حسب المستوى والعمر. جدولة الحصص وإدارة المناهج لكل مجموعة على حدة."
        },
        {
            icon: <Calendar className="w-8 h-8 text-blue-600" />,
            title: "تتبع الحضور",
            description: "سجل حضور الطلاب بسهولة وتابع تقدمهم الأكاديمي. تقارير مفصلة عن معدلات الحضور والغياب."
        },
        {
            icon: <DollarSign className="w-8 h-8 text-yellow-600" />,
            title: "إدارة المدفوعات",
            description: "تتبع مدفوعات الطلاب والرسوم الشهرية بدقة. إشعارات تلقائية للمدفوعات المستحقة والمتأخرة."
        },
        {
            icon: <UserPlus className="w-8 h-8 text-purple-600" />,
            title: "نظام المساعدين",
            description: "أضف مساعدين لمساعدتك في إدارة الطلاب والحضور. تحكم كامل في صلاحيات كل مساعد."
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-red-600" />,
            title: "تقارير شاملة",
            description: "احصل على تقارير مفصلة عن أداء الطلاب والإيرادات والحضور لاتخاذ قرارات مدروسة."
        },
        {
            icon: <Shield className="w-8 h-8 text-emerald-600" />,
            title: "أمان البيانات",
            description: "حماية كاملة لبيانات طلابك ومعلوماتهم الشخصية مع نسخ احتياطية آمنة ومشفرة."
        },
        {
            icon: <Star className="w-8 h-8 text-orange-600" />,
            title: "واجهة عربية",
            description: "تصميم خاص للغة العربية مع دعم كامل للاتجاه من اليمين لليسار وخطوط عربية جميلة."
        }
    ];

    const testimonials = [
        {
            name: "أستاذ مصطفى عبد المجيد",
            role: "معلم رياضيات",
            content: "هذا النظام وفر علي الكثير من الوقت في تتبع طلابي ومدفوعاتهم. أصبح التدريس أكثر تنظيماً.",
            rating: 5
        },
        {
            name: "الأستاذ أحمد علي",
            role: "معلم لغة عربية",
            content: "واجهة بسيطة وسهلة الاستخدام. تساعدني في التواصل مع أولياء الأمور بشكل مهني.",
            rating: 5
        },
        {
            name: "أستاذة مريم حسن",
            role: "معلمة دراسات إسلامية",
            content: "النظام يدعم احتياجاتي كمعلمة مع إمكانية إضافة مساعدين. ممتاز للمراكز التعليمية.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Head title="نظام إدارة المعلمين - منصة شاملة لإدارة التعليم" />
            
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600 ml-3" />
                            <span className="text-xl font-bold text-gray-900">نظام إدارة المعلمين</span>
                        </div>
                        <div className="flex items-center space-x-reverse space-x-4">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    لوحة التحكم
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        ابدأ مجاناً
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-50 via-white to-green-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            نظم <span className="text-indigo-600">تعليمك</span> بطريقة احترافية
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            منصة شاملة مصممة خصيصاً للمعلمين العرب لإدارة الطلاب والمجموعات والمدفوعات والحضور. 
                            ابدأ رحلتك التعليمية المنظمة اليوم.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {!auth.user && (
                                <Link
                                    href={route('register')}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                >
                                    ابدأ مجاناً الآن
                                </Link>
                            )}
                            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-all duration-300">
                                شاهد العرض التوضيحي
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            <CheckCircle className="w-4 h-4 text-green-500 inline ml-1" />
                            تجربة مجانية لمدة 30 يوم • لا حاجة لبطاقة ائتمانية
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">1000+</div>
                            <div className="text-gray-600">معلم نشط</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50,000+</div>
                            <div className="text-gray-600">طالب مسجل</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">98%</div>
                            <div className="text-gray-600">رضا المستخدمين</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">24/7</div>
                            <div className="text-gray-600">دعم فني</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            مميزات مصممة خصيصاً للمعلمين العرب
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            كل ما تحتاجه لإدارة تعليمية ناجحة في مكان واحد. من إدارة الطلاب إلى تتبع المدفوعات، كلها بواجهة عربية سهلة الاستخدام.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-indigo-200">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl mb-4 mx-auto">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">{feature.title}</h3>
                                <p className="text-gray-600 text-center text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Additional Feature Highlights */}
                    <div className="mt-20">
                        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                        لماذا يختار المعلمون منصتنا؟
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-start">
                                            <CheckCircle className="w-6 h-6 text-green-500 ml-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">سهولة الاستخدام</h4>
                                                <p className="text-gray-600 text-sm">واجهة بديهية تناسب جميع مستويات الخبرة التقنية</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <CheckCircle className="w-6 h-6 text-green-500 ml-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">توفير الوقت</h4>
                                                <p className="text-gray-600 text-sm">أتمتة المهام الإدارية لتركز على التدريس</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <CheckCircle className="w-6 h-6 text-green-500 ml-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">دعم كامل للغة العربية</h4>
                                                <p className="text-gray-600 text-sm">مصمم خصيصاً للثقافة العربية والتعليم الإسلامي</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <CheckCircle className="w-6 h-6 text-green-500 ml-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-1">أسعار مناسبة</h4>
                                                <p className="text-gray-600 text-sm">خطط تناسب جميع أحجام المؤسسات التعليمية</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                                        <h4 className="text-xl font-bold mb-4">ابدأ اليوم</h4>
                                        <p className="mb-6 opacity-90">انضم إلى آلاف المعلمين الذين وثقوا بنا</p>
                                        {!auth.user && (
                                            <Link
                                                href={route('register')}
                                                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 inline-block"
                                            >
                                                تسجيل مجاني
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            كيف تعمل المنصة؟
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            ثلاث خطوات بسيطة لبدء إدارة تعليمية احترافية
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-indigo-600">1</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">سجل مجاناً</h3>
                            <p className="text-gray-600">
                                أنشئ حسابك في دقائق واختر الخطة المناسبة لاحتياجاتك
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-green-600">2</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">أضف طلابك</h3>
                            <p className="text-gray-600">
                                أدخل بيانات طلابك ونظمهم في مجموعات حسب مستوياتهم
                            </p>
                        </div>
                        
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">ابدأ الإدارة</h3>
                            <p className="text-gray-600">
                                تتبع الحضور، أدر المدفوعات، وراقب تقدم طلابك بسهولة
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            ماذا يقول المعلمون عنا؟
                        </h2>
                        <p className="text-xl text-gray-600">
                            تجارب حقيقية من معلمين يستخدمون نظامنا يومياً
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4 leading-relaxed">&quot;{testimonial.content}&quot;</p>
                                <div>
                                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            خطط بأسعار مناسبة للجميع
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            اختر الخطة التي تناسب احتياجاتك التعليمية. جميع الخطط تشمل الميزات الأساسية مع إمكانية الترقية في أي وقت.
                        </p>
                    </div>
                    
                    {plans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                            {plans.map((plan, _index) => {
                                // Determine if this is a popular plan (basic monthly or trial)
                                const isPopular = plan.is_default || plan.name.includes('أساسية');
                                const isHighlighted = plan.is_trial;
                                
                                // Generate features based on plan details
                                const planFeatures = [
                                    `حتى ${plan.max_students} طالب`,
                                    plan.max_assistants > 0 ? `${plan.max_assistants} مساعد${plan.max_assistants > 1 ? 'ين' : ''}` : 'بدون مساعدين',
                                    'إدارة المجموعات',
                                    'تتبع الحضور',
                                    'إدارة المدفوعات',
                                    'تقارير أساسية',
                                    'الدعم الفني',
                                ];

                                if (plan.max_assistants >= 2) {
                                    planFeatures.push('تقارير متقدمة');
                                }
                                if (plan.max_assistants >= 3) {
                                    planFeatures.push('نسخ احتياطية متقدمة');
                                }
                                if (plan.max_students >= 500) {
                                    planFeatures.push('دعم فني مخصص');
                                }

                                return (
                                    <div key={plan.id} className={`relative rounded-xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                                        isHighlighted ? 'border-green-500 bg-green-50 transform scale-105' : 
                                        isPopular ? 'border-indigo-500 bg-indigo-50' : 
                                        'border-gray-200 bg-white hover:border-gray-300'
                                    }`}>
                                        {isHighlighted && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                                    مجاني
                                                </div>
                                            </div>
                                        )}
                                        {isPopular && !isHighlighted && (
                                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                                    الأكثر شعبية
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="text-center mb-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">{plan.name}</h3>
                                            <div className="mb-2">
                                                {plan.is_trial ? (
                                                    <>
                                                        <span className="text-4xl font-bold text-green-600">مجاني</span>
                                                        <div className="text-sm text-gray-500 mt-1">لمدة {plan.duration_days} يوم</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="flex items-baseline justify-center">
                                                            <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                                            <span className="text-lg text-gray-500 mr-2">ج.م</span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            {plan.duration_days >= 365 ? 'سنوياً' : 
                                                             plan.duration_days >= 90 ? 'ربع سنوي' : 'شهرياً'}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-sm font-medium text-indigo-600">
                                                حتى {plan.max_students} طالب
                                            </div>
                                        </div>
                                        
                                        <ul className="space-y-3 mb-6">
                                            {planFeatures.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start">
                                                    <CheckCircle className="w-5 h-5 text-green-500 ml-2 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-600 text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        
                                        {!auth.user && (
                                            <Link
                                                href={route('register', { plan: plan.id })}
                                                className={`w-full py-3 px-4 rounded-lg font-semibold text-center block transition-all duration-300 ${
                                                    isHighlighted 
                                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                                                        : isPopular 
                                                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg' 
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900 hover:shadow-md'
                                                }`}
                                            >
                                                {plan.is_trial ? 'ابدأ مجاناً' : 'اختر هذه الخطة'}
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">الخطط قيد التحديث</h3>
                            <p className="text-gray-500">سيتم عرض خطط الأسعار قريباً</p>
                        </div>
                    )}

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">
                            هل تحتاج خطة مخصصة لمؤسستك التعليمية؟
                        </p>
                        <button className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                            تواصل معنا للحصول على عرض خاص
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!auth.user && (
                <section className="py-20 bg-indigo-600">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            جاهز لتطوير تعليمك؟
                        </h2>
                        <p className="text-xl text-indigo-100 mb-8">
                            انضم إلى آلاف المعلمين الذين حولوا طريقة إدارتهم التعليمية
                        </p>
                        <Link
                            href={route('register')}
                            className="bg-white hover:bg-gray-100 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center"
                        >
                            ابدأ رحلتك المجانية
                            <ArrowLeft className="w-5 h-5 mr-2" />
                        </Link>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <BookOpen className="h-6 w-6 text-indigo-400 ml-2" />
                                <span className="text-lg font-bold">نظام إدارة المعلمين</span>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                منصة شاملة مصممة خصيصاً للمعلمين العرب لإدارة العملية التعليمية بطريقة احترافية ومنظمة.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">المنتج</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">المميزات</a></li>
                                <li><a href="#" className="hover:text-white">الأسعار</a></li>
                                <li><a href="#" className="hover:text-white">الأمان</a></li>
                                <li><a href="#" className="hover:text-white">التحديثات</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">الدعم</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">مركز المساعدة</a></li>
                                <li><a href="#" className="hover:text-white">تواصل معنا</a></li>
                                <li><a href="#" className="hover:text-white">الدليل الإرشادي</a></li>
                                <li><a href="#" className="hover:text-white">الأسئلة الشائعة</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">الشركة</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">من نحن</a></li>
                                <li><a href="#" className="hover:text-white">المدونة</a></li>
                                <li><a href="#" className="hover:text-white">الوظائف</a></li>
                                <li><a href="#" className="hover:text-white">الشروط والأحكام</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            &copy; {new Date().getFullYear()} نظام إدارة المعلمين. جميع الحقوق محفوظة.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
