import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { confirmDialog } from '@/utils/sweetAlert';

export default function ShowPlanUpgradeRequest({ request }) {

    
    const { data, setData, post, processing } = useForm({
        admin_notes: '',
    });

    const handleApprove = () => {
        confirmDialog({
            title: 'الموافقة على طلب الترقية',
            text: `هل أنت متأكد من الموافقة على طلب ترقية ${request.user?.name || 'المستخدم'} إلى خطة ${request.requested_plan?.name || 'الخطة المطلوبة'}؟`,
            confirmButtonText: 'نعم، وافق',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            
            if (result.isConfirmed) {
                post(route('admin.plan-upgrade-requests.approve', request.id));
            }
        });
    };

    const handleReject = () => {
        confirmDialog({
            title: 'رفض طلب الترقية',
            text: `هل أنت متأكد من رفض طلب ترقية ${request.user?.name || 'المستخدم'}؟`,
            confirmButtonText: 'نعم، ارفض',
            cancelButtonText: 'إلغاء',
            icon: 'warning',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('admin.plan-upgrade-requests.reject', request.id));
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
                        طلب ترقية الخطة - {request.user?.name || 'مستخدم غير محدد'}
                    </h2>
                    <Link
                        href={route('admin.plan-upgrade-requests.index')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                        العودة للقائمة
                    </Link>
                </div>
            }
        >
            <Head title={`طلب ترقية - ${request.user?.name || 'مستخدم غير محدد'}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Request Status */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">حالة الطلب</h3>
                                    {getStatusBadge(request.status)}
                                </div>
                            </div>

                            {/* Request Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {/* User Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">معلومات المعلم</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="font-medium">الاسم:</span> {request.user?.name || 'غير محدد'}</div>
                                        <div><span className="font-medium">البريد الإلكتروني:</span> {request.user?.email || 'غير محدد'}</div>
                                        <div><span className="font-medium">رقم الهاتف:</span> {request.user?.phone || 'غير محدد'}</div>
                                        <div><span className="font-medium">المدينة:</span> {request.user?.city || 'غير محدد'}</div>
                                    </div>
                                </div>

                                {/* Request Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">معلومات الطلب</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><span className="font-medium">تاريخ الطلب:</span> {new Date(request.created_at).toLocaleDateString('ar-EG')}</div>
                                        <div><span className="font-medium">وقت الطلب:</span> {new Date(request.created_at).toLocaleTimeString('ar-EG')}</div>
                                        {request.approved_at && (
                                            <>
                                                <div><span className="font-medium">تاريخ الرد:</span> {new Date(request.approved_at).toLocaleDateString('ar-EG')}</div>
                                                <div><span className="font-medium">وقت الرد:</span> {new Date(request.approved_at).toLocaleTimeString('ar-EG')}</div>
                                            </>
                                        )}
                                        {request.approved_by && (
                                            <div><span className="font-medium">تم الرد بواسطة:</span> {request.approved_by?.name || 'غير محدد'}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Plan Comparison */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">مقارنة الخطط</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Current Plan */}
                                    <div className="border rounded-lg p-4">
                                        <h5 className="font-medium text-gray-900 mb-3">الخطة الحالية</h5>
                                        {request.current_plan ? (
                                            <div className="space-y-2 text-sm">
                                                <div><span className="font-medium">الاسم:</span> {request.current_plan?.name || 'غير محدد'}</div>
                                                <div><span className="font-medium">السعر:</span> {request.current_plan?.price + 'ج' || 'غير محدد'}</div>
                                                <div><span className="font-medium">عدد الطلاب:</span> {request.current_plan?.max_students || 'غير محدد'}</div>
                                                <div><span className="font-medium">عدد المساعدين:</span> {request.current_plan?.max_assistants || 'غير محدد'}</div>
                                                <div><span className="font-medium">المدة:</span> {request.current_plan?.duration_days/30 + ' شهر' || 'غير محدد'}</div>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">لا توجد خطة نشطة</p>
                                        )}
                                    </div>

                                    {/* Requested Plan */}
                                    <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-4">
                                        <h5 className="font-medium text-indigo-900 mb-3">الخطة المطلوبة</h5>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="font-medium">الاسم:</span> {request.requested_plan?.name || 'غير محدد'}</div>
                                            <div><span className="font-medium">السعر:</span> {request.requested_plan?.price + ' ج ' || 'غير محدد'}</div>
                                            <div><span className="font-medium">عدد الطلاب:</span> {request.requested_plan?.max_students || 'غير محدد'}</div>
                                            <div><span className="font-medium">عدد المساعدين:</span> {request.requested_plan?.max_assistants || 'غير محدد'}</div>
                                            <div><span className="font-medium">المدة:</span> {request.requested_plan?.duration_days/30 + ' شهر' || 'غير محدد'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Notes */}
                            {request.admin_notes && (
                                <div className="mb-8">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">ملاحظات الإدارة</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-700">{request.admin_notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Form */}
                            {request.status === 'pending' && (
                                <div className="border-t pt-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">إجراء على الطلب</h4>
                                    
                                    <div className="mb-4">
                                        <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700 mb-2">
                                            ملاحظات الإدارة (اختيارية)
                                        </label>
                                        <textarea
                                            id="admin_notes"
                                            value={data.admin_notes}
                                            onChange={(e) => setData('admin_notes', e.target.value)}
                                            rows={3}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="أدخل أي ملاحظات أو تعليقات..."
                                        />
                                    </div>

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={handleApprove}
                                            disabled={processing}
                                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ml-2"
                                        >
                                            {processing ? 'جاري المعالجة...' : 'موافقة على الطلب'}
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            disabled={processing}
                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                                        >
                                            {processing ? 'جاري المعالجة...' : 'رفض الطلب'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
