import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { confirmDialog, errorAlert, questionDialog } from '@/utils/sweetAlert';

export default function PlansIndex({ plans }) {
    const [deletingPlan, setDeletingPlan] = useState(null);

    const handleDelete = (plan) => {
        if (plan.subscribers_count > 0) {
            errorAlert({
                title: 'لا يمكن الحذف',
                text: `لا يمكن حذف خطة تحتوي على ${plan.subscribers_count} اشتراك نشط.`,
            });
            return;
        }

        confirmDialog({
            title: 'هل أنت متأكد؟',
            text: `سيتم حذف خطة "${plan.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.plans.destroy', plan.id), {
                    preserveScroll: true,
                    onStart: () => setDeletingPlan(plan.id),
                    onFinish: () => setDeletingPlan(null),
                });
            }
        });
    };

    const handleSetDefault = (plan) => {
        questionDialog({
            title: 'تعيين خطة افتراضية',
            text: `هل تريد تعيين "${plan.name}" كخطة افتراضية للمستخدمين الجدد؟`,
            confirmButtonText: 'نعم، عيّن كافتراضية',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.plans.set-default', plan.id), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        إدارة خطط الاشتراك
                    </h2>
                    <Link
                        href={route('admin.plans.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        إنشاء خطة جديدة
                    </Link>
                </div>
            }
        >
            <Head title="إدارة الخطط" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {plans.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد خطط</h3>
                                    <p className="mt-2 text-gray-600">ابدأ بإنشاء أول خطة اشتراك.</p>
                                    <div className="mt-6">
                                        <Link
                                            href={route('admin.plans.create')}
                                            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                        >
                                            إنشاء خطة
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الخطة</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الحدود</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">المدة والسعر</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">المشتركون</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {plans.map((plan) => (
                                                <tr key={plan.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    تم الإنشاء في {new Date(plan.created_at).toLocaleDateString('ar-EG')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <div>{plan.max_students} طالب</div>
                                                            <div className="text-gray-500">{plan.max_assistants} مساعد</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <div>{plan.formatted_price}</div>
                                                            <div className="text-gray-500">{plan.formatted_duration}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{plan.subscribers_count}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col space-y-1">
                                                            {plan.is_trial && (
                                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                                                    تجريبية
                                                                </span>
                                                            )}
                                                            {plan.is_default && (
                                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                    افتراضية
                                                                </span>
                                                            )}
                                                            {plan.subscribers_count > 0 && (
                                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                                    نشطة
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                        <Link
                                                            href={route('admin.plans.show', plan.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            عرض
                                                        </Link>
                                                        <Link
                                                            href={route('admin.plans.edit', plan.id)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                        >
                                                            تعديل
                                                        </Link>
                                                        {!plan.is_default && (
                                                            <button
                                                                onClick={() => handleSetDefault(plan)}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                تعيين افتراضية
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDelete(plan)}
                                                            disabled={deletingPlan === plan.id || plan.subscribers_count > 0}
                                                            className={`${
                                                                plan.subscribers_count > 0 
                                                                    ? 'text-gray-400 cursor-not-allowed' 
                                                                    : 'text-red-600 hover:text-red-900'
                                                            }`}
                                                        >
                                                            {deletingPlan === plan.id ? 'جاري الحذف...' : 'حذف'}
                                                        </button>
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
