import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CheckCircleIcon, 
    ExclamationTriangleIcon, 
    ClockIcon,
    UserGroupIcon,
    CalendarDaysIcon,
    CreditCardIcon,
    ArrowUpCircleIcon
} from '@heroicons/react/24/outline';

export default function Status({ subscription, limits, daysRemaining }) {
    const getStatusColor = () => {
        if (!subscription || !subscription.is_active) return 'red';
        if (daysRemaining <= 7) return 'yellow';
        return 'green';
    };

    const getStatusIcon = () => {
        const color = getStatusColor();
        const iconClass = `h-8 w-8 ${color === 'green' ? 'text-green-500' : color === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`;
        
        if (color === 'green') return <CheckCircleIcon className={iconClass} />;
        if (color === 'yellow') return <ExclamationTriangleIcon className={iconClass} />;
        return <ExclamationTriangleIcon className={iconClass} />;
    };

    const getStatusText = () => {
        if (!subscription || !subscription.is_active) return 'منتهي الصلاحية';
        if (daysRemaining <= 7) return 'ينتهي قريباً';
        return 'نشط';
    };

    const getStatusDescription = () => {
        if (!subscription || !subscription.is_active) {
            return 'اشتراكك منتهي الصلاحية. يرجى تجديد اشتراكك لمتابعة استخدام النظام.';
        }
        if (daysRemaining <= 7) {
            return `اشتراكك ينتهي خلال ${daysRemaining} أيام. جدد اشتراكك لتجنب انقطاع الخدمة.`;
        }
        return `اشتراكك نشط ويتبقى عليه ${daysRemaining} يوم.`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        حالة الاشتراك
                    </h2>
                    {subscription && subscription.is_active && (
                        <Link
                            href={route('subscription.plans')}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            ترقية الخطة
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="حالة الاشتراك" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Status Card */}
                    <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {getStatusIcon()}
                                    <div className="mr-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            حالة الاشتراك: {getStatusText()}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {getStatusDescription()}
                                        </p>
                                    </div>
                                </div>
                                {(!subscription || !subscription.is_active) && (
                                    <Link
                                        href={route('subscription.plans')}
                                        className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    >
                                        <ArrowUpCircleIcon className="h-5 w-5 mr-2" />
                                        تجديد الاشتراك
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Subscription Details */}
                    {subscription && (
                        <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    تفاصيل الاشتراك
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Plan Name */}
                                    <div className="flex items-center">
                                        <CreditCardIcon className="h-8 w-8 text-indigo-500 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">الخطة الحالية</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {subscription.plan ? subscription.plan.name : 'غير محدد'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Start Date */}
                                    <div className="flex items-center">
                                        <CalendarDaysIcon className="h-8 w-8 text-green-500 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">تاريخ البدء</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* End Date */}
                                    <div className="flex items-center">
                                        <ClockIcon className="h-8 w-8 text-orange-500 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">تاريخ الانتهاء</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Days Remaining */}
                                    <div className="flex items-center">
                                        <CalendarDaysIcon className="h-8 w-8 text-blue-500 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">الأيام المتبقية</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {daysRemaining > 0 ? `${daysRemaining} يوم` : 'منتهي'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Usage Limits */}
                    {limits && (
                        <div className="mb-8 overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    حدود الاستخدام
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Students Limit */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">الطلاب</p>
                                                <p className="text-2xl font-bold text-blue-900">
                                                    {limits.current_students || 0} / {limits.max_students || 0}
                                                </p>
                                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full" 
                                                        style={{
                                                            width: `${limits.max_students > 0 ? (limits.current_students / limits.max_students) * 100 : 0}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Assistants Limit */}
                                    {limits.max_assistants && (
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <UserGroupIcon className="h-8 w-8 text-purple-600 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-purple-900">المساعدين</p>
                                                    <p className="text-2xl font-bold text-purple-900">
                                                        {limits.current_assistants || 0} / {limits.max_assistants || 0}
                                                    </p>
                                                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                                                        <div 
                                                            className="bg-purple-600 h-2 rounded-full" 
                                                            style={{
                                                                width: `${limits.max_assistants > 0 ? (limits.current_assistants / limits.max_assistants) * 100 : 0}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional limits can be added here */}
                                    {limits.max_groups && (
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <div className="flex items-center">
                                                <UserGroupIcon className="h-8 w-8 text-green-600 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">المجموعات</p>
                                                    <p className="text-2xl font-bold text-green-900">
                                                        {limits.current_groups || 0} / {limits.max_groups || 0}
                                                    </p>
                                                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                                                        <div 
                                                            className="bg-green-600 h-2 rounded-full" 
                                                            style={{
                                                                width: `${limits.max_groups > 0 ? (limits.current_groups / limits.max_groups) * 100 : 0}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            href={route('subscription.plans')}
                            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <ArrowUpCircleIcon className="h-5 w-5 mr-2" />
                            عرض الخطط المتاحة
                        </Link>

                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            العودة للرئيسية
                        </Link>

                        <Link
                            href={route('profile.edit')}
                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            إعدادات الحساب
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
