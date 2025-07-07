import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CheckCircleIcon, 
    XMarkIcon,
    CreditCardIcon,
    UsersIcon,
    CalendarDaysIcon,
    StarIcon,
    ArrowRightIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Plans({ plans, currentSubscription, currentStudentCount, hasHadTrial }) {
    // Debug logging
    console.log('Plans data:', { plans, currentSubscription, currentStudentCount, hasHadTrial });

    const handleSubscribe = (planId) => {
        // This would typically redirect to a payment gateway
        // For now, we'll just show a message
        alert('سيتم توجيهك إلى صفحة الدفع قريباً');
    };

    const getPlanStatus = (plan) => {
        if (currentSubscription && currentSubscription.plan_id === plan.id) {
            return 'current';
        }
        return 'available';
    };

    const getPlanBadge = (plan) => {
        if (plan.is_trial) {
            return (
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <StarIcon className="h-4 w-4 inline mr-1" />
                    تجريبي
                </div>
            );
        }
        if (plan.is_popular) {
            return (
                <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    <StarIcon className="h-4 w-4 inline mr-1" />
                    الأكثر شعبية
                </div>
            );
        }
        return null;
    };

    const isCurrentPlan = (plan) => {
        console.log('Checking if current plan:', plan.id, currentSubscription?.plan_id);
        return currentSubscription && currentSubscription.plan_id === plan.id;
    };

    const canSelectPlan = (plan) => {
        // Can't select current plan
        if (isCurrentPlan(plan)) return false;
        
        // Can't select trial if already had one
        if (plan.is_trial && hasHadTrial) return false;
        
        return true;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        خطط الاشتراك
                    </h2>
                    <Link
                        href={route('subscription.status')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        عرض حالة الاشتراك
                    </Link>
                </div>
            }
        >
            <Head title="خطط الاشتراك" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Current Usage Summary */}
                    <div className="mb-8 rounded-lg bg-blue-50 p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">الاستخدام الحالي</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center">
                                    <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">عدد الطلاب</p>
                                        <p className="text-2xl font-bold text-gray-900">{currentStudentCount || 0}</p>
                                    </div>
                                </div>
                            </div>
                            
                            
                            
                            <div className="bg-white rounded-lg p-4">
                                <div className="flex items-center">
                                    <CalendarDaysIcon className="h-8 w-8 text-orange-600 mr-3" />
                                    <div>
                                        <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {currentSubscription?.end_date ? 
                                                new Date(currentSubscription.end_date).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'}) : 
                                                'غير محدد'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                      
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border-2 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
                                    isCurrentPlan(plan) 
                                        ? 'border-green-500 ring-2 ring-green-200' 
                                        : plan.is_popular 
                                            ? 'border-indigo-500 ring-2 ring-indigo-200' 
                                            : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {getPlanBadge(plan)}
                                
                                {/* Plan Header */}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {plan.description}
                                    </p>
                                    {/* Debug info */}
                                    {process.env.NODE_ENV === 'development' && (
                                        <p className="text-xs text-purple-600 mt-1">
                                            Plan ID: {plan.id} | Current: {isCurrentPlan(plan) ? 'Yes' : 'No'}
                                        </p>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold text-gray-900">
                                            {plan.price}
                                        </span>
                                        <span className="text-xl text-gray-600 mr-2">ج.م</span>
                                        <span className="text-sm text-gray-500">
                                            / {plan.duration_days} يوم
                                        </span>
                                    </div>
                                    {plan.price_per_day && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            ({plan.price_per_day} ج.م / يوم)
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="mb-8">
                                    <ul className="space-y-3">
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                            <span className="text-sm text-gray-700">
                                                حتى {plan.max_students} طالب
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                            <span className="text-sm text-gray-700">
                                                إدارة المجموعات
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                            <span className="text-sm text-gray-700">
                                                تتبع الحضور والغياب
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                            <span className="text-sm text-gray-700">
                                                إدارة المدفوعات
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                            <span className="text-sm text-gray-700">
                                                التقارير والإحصائيات
                                            </span>
                                        </li>
                                        {plan.features && plan.features.length > 0 && (
                                            plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-center">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                                                    <span className="text-sm text-gray-700">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </div>

                                {/* Action Button */}
                                <div className="space-y-3">
                                    {isCurrentPlan(plan) ? (
                                        <button
                                            disabled
                                            className="w-full rounded-lg bg-green-100 px-4 py-3 text-sm font-semibold text-green-800 cursor-not-allowed"
                                        >
                                            <ShieldCheckIcon className="h-5 w-5 inline mr-2" />
                                            الخطة الحالية
                                        </button>
                                    ) : plan.is_trial && hasHadTrial ? (
                                        <button
                                            disabled
                                            className="w-full rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500 cursor-not-allowed"
                                        >
                                            <XMarkIcon className="h-5 w-5 inline mr-2" />
                                            تم استخدام التجربة المجانية
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSubscribe(plan.id)}
                                            className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                                                plan.is_popular || plan.is_trial
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                            }`}
                                        >
                                            {plan.is_trial ? 'ابدأ التجربة المجانية' : 'اشترك الآن'}
                                            <ArrowRightIcon className="h-5 w-5 inline mr-2" />
                                        </button>
                                    )}
                                    
                                    {/* Upgrade Notice */}
                                    {currentSubscription && currentStudentCount > plan.max_students && (
                                        <p className="text-xs text-orange-600 text-center">
                                            ⚠️ لديك {currentStudentCount} طالب، تحتاج لحذف {currentStudentCount - plan.max_students} طالب أولاً
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Help Section */}
                    <div className="mt-12 rounded-lg bg-gray-50 p-8 text-center">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            هل تحتاج مساعدة في اختيار الخطة المناسبة؟
                        </h3>
                        <p className="text-gray-600 mb-6">
                            فريق الدعم متاح لمساعدتك في اختيار الخطة التي تناسب احتياجاتك
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('feedback.index')}
                                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                تواصل معنا
                            </Link>
                            <Link
                                href={route('dashboard')}
                                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                العودة للرئيسية
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
