import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function ShowPlan({ plan }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        تفاصيل الخطة: {plan.name}
                    </h2>
                    <div className="flex space-x-3">
                        <Link
                            href={route('admin.plans.edit', plan.id)}
                            className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                        >
                            تعديل الخطة
                        </Link>
                        <Link
                            href={route('admin.plans.index')}
                            className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                        >
                            العودة للخطط
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`الخطة: ${plan.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8 space-y-6">
                    {/* Plan Overview */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">نظرة عامة على الخطة</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-blue-900">حد الطلاب</p>
                                            <p className="text-lg font-semibold text-blue-600">{plan.max_students}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-900">السعر</p>
                                            <p className="text-lg font-semibold text-green-600">{plan.formatted_price}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-orange-900">حد المساعدين</p>
                                            <p className="text-lg font-semibold text-orange-600">{plan.max_assistants}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-purple-900">المشتركون</p>
                                            <p className="text-lg font-semibold text-purple-600">{plan.subscriptions.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${plan.is_default ? 'bg-yellow-50' : 'bg-gray-50'} p-4 rounded-lg`}>
                                    <div className="flex items-center">
                                        <svg className={`h-8 w-8 ${plan.is_default ? 'text-yellow-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${plan.is_default ? 'text-yellow-900' : 'text-gray-900'}`}>الحالة</p>
                                            <p className={`text-lg font-semibold ${plan.is_default ? 'text-yellow-600' : 'text-gray-600'}`}>
                                                {plan.is_default ? 'افتراضية' : 'عادية'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">تم الإنشاء</h4>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(plan.created_at).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })} في {new Date(plan.created_at).toLocaleTimeString('ar-EG')}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">آخر تحديث</h4>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(plan.updated_at).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })} في {new Date(plan.updated_at).toLocaleTimeString('ar-EG')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscribers */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                المشتركون ({plan.subscriptions.length})
                            </h3>
                            
                            {plan.subscriptions.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h4 className="mt-4 text-lg font-medium text-gray-900">لا يوجد مشتركون بعد</h4>
                                    <p className="mt-2 text-gray-600">هذه الخطة لا تحتوي على أي مشتركين.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">المستخدم</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البداية</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ النهاية</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {plan.subscriptions.map((subscription) => (
                                                <tr key={subscription.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{subscription.user.name}</div>
                                                            <div className="text-sm text-gray-500">{subscription.user.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            subscription.is_active 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {subscription.is_active ? 'نشط' : 'غير نشط'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString('ar-EG') : 'غير محدد'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('ar-EG') : 'بلا تاريخ انتهاء'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
