import { Head, Link } from '@inertiajs/react';
import { Users, BookOpen, Calendar, DollarSign, Shield, Star, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Welcome({ auth }) {
    const features = [
        {
            icon: <Users className="w-8 h-8 text-indigo-600" />,
            title: "إدارة الطلاب",
            description: "نظم معلومات طلابك وتواصل مع أولياء الأمور بسهولة"
        },
        {
            icon: <BookOpen className="w-8 h-8 text-green-600" />,
            title: "تنظيم المجموعات",
            description: "اقسم طلابك إلى مجموعات حسب المستوى والعمر"
        },
        {
            icon: <Calendar className="w-8 h-8 text-blue-600" />,
            title: "تتبع الحضور",
            description: "سجل حضور الطلاب وتابع تقدمهم الأكاديمي"
        },
        {
            icon: <DollarSign className="w-8 h-8 text-yellow-600" />,
            title: "إدارة المدفوعات",
            description: "تتبع مدفوعات الطلاب والرسوم الشهرية بسهولة"
        },
        {
            icon: <Shield className="w-8 h-8 text-purple-600" />,
            title: "أمان البيانات",
            description: "حماية كاملة لبيانات طلابك ومعلوماتهم الشخصية"
        },
        {
            icon: <Star className="w-8 h-8 text-red-600" />,
            title: "واجهة عربية",
            description: "تصميم خاص للغة العربية مع دعم كامل للاتجاه من اليمين لليسار"
        }
    ];

    const testimonials = [
        {
            name: "أستاذة فاطمة محمد",
            role: "معلمة قرآن كريم",
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

    const plans = [
        {
            name: "الخطة الأساسية",
            price: "99",
            period: "شهرياً",
            students: "حتى 15 طالب",
            features: ["إدارة الطلاب", "تتبع الحضور", "إدارة المدفوعات الأساسية", "دعم فني"]
        },
        {
            name: "الخطة المتقدمة",
            price: "199",
            period: "شهرياً",
            students: "حتى 40 طالب",
            features: ["جميع مميزات الخطة الأساسية", "إدارة المجموعات المتقدمة", "تقارير مفصلة", "إضافة مساعد واحد"],
            popular: true
        },
        {
            name: "الخطة المهنية",
            price: "349",
            period: "شهرياً",
            students: "حتى 100 طالب",
            features: ["جميع المميزات", "مساعدين متعددين", "تحليلات متقدمة", "دعم مخصص", "تكامل مع أدوات أخرى"]
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
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
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
                            تجربة مجانية لمدة 14 يوم • لا حاجة لبطاقة ائتمانية
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            مميزات مصممة خصيصاً للمعلمين العرب
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            كل ما تحتاجه لإدارة تعليمية ناجحة في مكان واحد
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

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
                                <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.content}"</p>
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
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            خطط بأسعار مناسبة للجميع
                        </h2>
                        <p className="text-xl text-gray-600">
                            اختر الخطة التي تناسب احتياجاتك التعليمية
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div key={index} className={`rounded-xl shadow-lg border-2 p-8 ${plan.popular ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                                {plan.popular && (
                                    <div className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 text-center">
                                        الأكثر شعبية
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center">
                                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                        <span className="text-xl text-gray-500 mr-2">ج.م</span>
                                    </div>
                                    <p className="text-gray-500 mt-1">{plan.period}</p>
                                    <p className="text-indigo-600 font-semibold mt-2">{plan.students}</p>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                {!auth.user && (
                                    <Link
                                        href={route('register')}
                                        className={`w-full py-3 px-4 rounded-lg font-semibold text-center block transition-all duration-300 ${
                                            plan.popular 
                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                        }`}
                                    >
                                        ابدأ الآن
                                    </Link>
                                )}
                            </div>
                        ))}
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
