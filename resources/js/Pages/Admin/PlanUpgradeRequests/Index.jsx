import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { confirmDialog } from '@/utils/sweetAlert';

export default function PlanUpgradeRequestsIndex({ requests }) {
    const handleApprove = (request) => {
        confirmDialog({
            title: 'الموافقة على طلب الترقية',
            text: `هل أنت متأكد من الموافقة على طلب ترقية ${request.user?.name || 'المستخدم'} إلى خطة ${request.requested_plan?.name || 'الخطة المطلوبة'}؟`,
            confirmButtonText: 'نعم، وافق',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.plan-upgrade-requests.approve', request.id), {
                    admin_notes: 'تم التحقق من سداد الرسوم'
                });
            }
        });
    };

    const handleReject = (request) => {
        confirmDialog({
            title: 'رفض طلب الترقية',
            text: `هل أنت متأكد من رفض طلب ترقية ${request.user?.name || 'المستخدم'}؟`,
            confirmButtonText: 'نعم، ارفض',
            cancelButtonText: 'إلغاء',
            icon: 'warning',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.plan-upgrade-requests.reject', request.id), {
                    admin_notes: 'لم يتم سداد الرسوم أو تم رفض الطلب لأسباب إدارية'
                });
            }
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'قيد المراجعة' },
            approved: { color: 'bg-green-100 text-green-800', text: 'موافق عليه' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'مرفوض' },
        };
        
        const badge = badges[status] || badges.pending;
        
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        طلبات ترقية الخطط
                    </h2>
                </div>
            }
        >
            <Head title="طلبات ترقية الخطط" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {requests.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات ترقية</h3>
                                    <p className="mt-1 text-sm text-gray-500">لم يتم تقديم أي طلبات ترقية خطط حتى الآن.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المعلم</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخطة الحالية</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخطة المطلوبة</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الطلب</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {requests.data.map((request) => (
                                                <tr key={request.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{request.user?.name || 'غير محدد'}</div>
                                                            <div className="text-sm text-gray-500">{request.user?.email || 'غير محدد'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {request.current_plan ? request.current_plan.name : 'لا توجد خطة'}
                                                        </div>
                                                        {request.current_plan && (
                                                            <div className="text-sm text-gray-500">
                                                                {request.current_plan?.formatted_price || 'غير محدد'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{request.requested_plan?.name || 'غير محدد'}</div>
                                                        <div className="text-sm text-gray-500">{request.requested_plan?.formatted_price || 'غير محدد'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(request.created_at).toLocaleDateString('ar-EG')}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(request.created_at).toLocaleTimeString('ar-EG')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(request.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.plan-upgrade-requests.show', request.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 ml-2"
                                                            >
                                                                عرض
                                                            </Link>
                                                            {request.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(request)}
                                                                        className="text-green-600 hover:text-green-900 ml-2"
                                                                    >
                                                                        موافقة
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(request)}
                                                                        className="text-red-600 hover:text-red-900"
                                                                    >
                                                                        رفض
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Pagination */}
                            {requests.links && requests.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        {requests.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                } ${
                                                    index === 0 ? 'rounded-r-md' : ''
                                                } ${
                                                    index === requests.links.length - 1 ? 'rounded-l-md' : ''
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </nav>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
