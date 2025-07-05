import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { questionDialog } from '@/utils/sweetAlert';

export default function PlansIndex({ currentPlan, availablePlans, currentStudentCount, pendingUpgradeRequest }) {


    const handleUpgrade = (planId) => {
        questionDialog({
            title: 'طلب ترقية الخطة',
            text: 'هل أنت متأكد من إرسال طلب ترقية الخطة؟ سيتم مراجعة الطلب من قبل الإدارة للتأكد من سداد المبلغ المطلوب.',
            confirmButtonText: 'نعم، أرسل الطلب',
            cancelButtonText: 'إلغاء',
        }).then((result) => {

            if (result.isConfirmed) {
                console.log('Sending upgrade request for plan ID:', planId);
                router.post(route('plans.upgrade'), {
                    plan_id: planId,
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ترقية خطتك
                </h2>
            }
        >
            <Head title="ترقية الخطة" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Current Plan */}
                    {currentPlan && (
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">الخطة الحالية</h3>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">خطة {currentPlan.name}</h4>
                                            <p className="text-gray-600">حتى {currentPlan.max_students} طالب</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                تستخدم حالياً {currentStudentCount} من {currentPlan.max_students} طالب
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">{currentPlan.formatted_price}</p>
                                            <p className="text-sm text-gray-500">{currentPlan.formatted_duration}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pending Upgrade Request */}
                    {pendingUpgradeRequest && (
                        <div className="mb-8">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <div className="flex items-start">
                                    <svg className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-lg font-medium text-yellow-900 mb-2">طلب ترقية قيد المراجعة</h4>
                                        <div className="text-sm text-yellow-800 space-y-1">
                                            <p>لديك طلب ترقية إلى خطة <strong>{pendingUpgradeRequest.requested_plan.name}</strong> قيد المراجعة.</p>
                                            <p>تم إرسال الطلب في: {new Date(pendingUpgradeRequest.created_at).toLocaleDateString('ar-EG')}</p>
                                            <p>سيتم إشعارك بنتيجة الطلب عبر البريد الإلكتروني.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Upgrades */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">الترقيات المتاحة</h3>
                        {pendingUpgradeRequest ? (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h4 className="mt-4 text-lg font-medium text-gray-900">لديك طلب ترقية قيد المراجعة</h4>
                                    <p className="mt-2 text-gray-600">لا يمكنك إرسال طلب ترقية جديد حتى يتم الرد على طلبك الحالي.</p>
                                </div>
                            </div>
                        ) : availablePlans.length === 0 ? (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h4 className="mt-4 text-lg font-medium text-gray-900">أنت على أعلى خطة!</h4>
                                    <p className="mt-2 text-gray-600">لا توجد خيارات ترقية متاحة.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availablePlans.map((plan) => (
                                    <div key={plan.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <div className="text-center">
                                                <h4 className="text-xl font-semibold text-gray-900 mb-2">خطة {plan.name}</h4>
                                                <div className="mb-4">
                                                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                                                    <span className="text-gray-500"> / {plan.duration_days}</span> شهر
                                                </div>
                                                <div className="mb-6">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-700">حتى {plan.max_students} طالب</span>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-700">جميع الميزات الحالية</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUpgrade(plan.id)}
                                                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                >
                                                    طلب ترقية إلى {plan.name}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Benefits of Upgrading */}
                    <div className="mt-8">
                        <div className="bg-blue-50 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h4 className="text-lg font-medium text-blue-900 mb-4">لماذا الترقية؟</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">عدد طلاب أكثر</h5>
                                            <p className="text-sm text-blue-700">أضف المزيد من الطلاب لتوسيع نشاطك التعليمي</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">مراجعة الإدارة</h5>
                                            <p className="text-sm text-blue-700">يتم مراجعة طلبات الترقية للتأكد من سداد الرسوم</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">نفس الميزات</h5>
                                            <p className="text-sm text-blue-700">جميع الميزات الحالية مع سعة أكبر</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">لا حاجة للدفع</h5>
                                            <p className="text-sm text-blue-700">نظام موافقة يدوية، لا توجد مدفوعات إلكترونية</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Approval Process Information */}
                    <div className="mt-8">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                            <div className="flex items-start">
                                <svg className="h-6 w-6 text-amber-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-lg font-medium text-amber-900 mb-2">عملية الموافقة على الترقية</h4>
                                    <div className="text-sm text-amber-800 space-y-2">
                                        <p>• بعد إرسال طلب الترقية، سيتم مراجعته من قبل الإدارة</p>
                                        <p>• يجب سداد رسوم الخطة الجديدة قبل الموافقة على الطلب</p>
                                        <p>• سيتم إشعارك بنتيجة الطلب عبر البريد الإلكتروني</p>
                                        <p>• في حالة الموافقة، ستتم ترقية خطتك تلقائياً</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
