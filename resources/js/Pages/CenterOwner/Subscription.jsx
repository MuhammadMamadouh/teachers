import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    CreditCardIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    ClockIcon,
    StarIcon,
    ArrowUpIcon
} from '@heroicons/react/24/outline';

export default function Subscription({ center, subscription, plans }) {
    const PlanCard = ({ plan, isCurrent = false, isUpgrade = false }) => (
        <div className={`bg-white rounded-lg shadow p-6 relative ${
            isCurrent ? 'ring-2 ring-green-500' : isUpgrade ? 'ring-2 ring-blue-500' : ''
        }`}>
            {isCurrent && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        الخطة الحالية
                    </span>
                </div>
            )}
            {isUpgrade && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        مُوصى بها
                    </span>
                </div>
            )}
            
            <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                    <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500"> ج.م / شهر</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            </div>
            
            <div className="space-y-3 mb-6">
                {plan.features?.map((feature, index) => (
                    <div key={index} className="flex items-center">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                        <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                ))}
            </div>
            
            <button 
                className={`w-full py-2 px-4 rounded-lg font-medium transition duration-200 ${
                    isCurrent 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : isUpgrade
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                disabled={isCurrent}
            >
                {isCurrent ? 'الخطة الحالية' : isUpgrade ? 'ترقية الآن' : 'اختيار الخطة'}
            </button>
        </div>
    );

    const StatusCard = ({ icon: Icon, title, value, status, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    {status && (
                        <div className={`text-sm mt-1 ${
                            status === 'active' ? 'text-green-600' : 
                            status === 'expired' ? 'text-red-600' : 
                            'text-yellow-600'
                        }`}>
                            {status === 'active' ? 'نشط' : status === 'expired' ? 'منتهي الصلاحية' : 'معلق'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <CenterOwnerLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        إدارة الاشتراك
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        إدارة اشتراك مركز {center?.name} والخطط المتاحة
                    </p>
                </div>
            }
        >
            <Head title="إدارة الاشتراك" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Current Subscription Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatusCard
                            icon={CreditCardIcon}
                            title="الخطة الحالية"
                            value={subscription?.plan?.name || 'غير محدد'}
                            status={subscription?.status}
                            color="blue"
                        />
                        <StatusCard
                            icon={ClockIcon}
                            title="تاريخ انتهاء الاشتراك"
                            value={subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                            color="orange"
                        />
                        <StatusCard
                            icon={StarIcon}
                            title="الأيام المتبقية"
                            value={subscription?.days_remaining || 0}
                            color="green"
                        />
                    </div>

                    {/* Subscription Alert */}
                    {subscription?.status === 'expired' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 ml-2" />
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">انتهت صلاحية الاشتراك</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        يرجى تجديد اشتراكك للاستمرار في استخدام الخدمة.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {subscription?.days_remaining <= 7 && subscription?.status === 'active' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                            <div className="flex items-center">
                                <ClockIcon className="h-5 w-5 text-yellow-600 ml-2" />
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800">تنبيه: اقتراب انتهاء الاشتراك</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        سينتهي اشتراكك خلال {subscription.days_remaining} أيام. يرجى التجديد قريباً.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Plans */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <ArrowUpIcon className="h-6 w-6 text-blue-600 ml-2" />
                                <h3 className="text-lg font-medium text-gray-900">الخطط المتاحة</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            {plans && plans.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.map((plan) => (
                                        <PlanCard 
                                            key={plan.id} 
                                            plan={plan}
                                            isCurrent={subscription?.plan?.id === plan.id}
                                            isUpgrade={plan.is_recommended}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد خطط متاحة</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        سيتم إضافة خطط اشتراك قريباً.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Billing History */}
                    <div className="bg-white rounded-lg shadow mt-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">تاريخ الفواتير</h3>
                        </div>
                        <div className="p-6">
                            <div className="text-center py-8">
                                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد فواتير سابقة</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    ستظهر فواتيرك هنا بعد إجراء عمليات دفع.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
