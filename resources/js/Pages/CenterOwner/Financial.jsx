import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    CurrencyDollarIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ChartBarIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Financial({ center, financialReports }) {
    const [activeTab, setActiveTab] = useState('revenue');

    const TabButton = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'green', trend = null }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    {subtitle && (
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center mt-2 text-sm ${
                            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                            <ArrowTrendingUpIcon className={`h-4 w-4 ml-1 ${trend < 0 ? 'rotate-180' : ''}`} />
                            {Math.abs(trend)}% عن الشهر الماضي
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const RevenueReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={BanknotesIcon}
                    title="إجمالي الإيرادات"
                    value={`${financialReports?.revenue?.total || 0} ج.م`}
                    subtitle="منذ بداية العام"
                    color="green"
                />
                <MetricCard
                    icon={ArrowTrendingUpIcon}
                    title="الإيرادات الشهرية"
                    value={`${financialReports?.revenue?.monthly || 0} ج.م`}
                    trend={financialReports?.revenue?.monthly_growth}
                    color="blue"
                />
                <MetricCard
                    icon={ChartBarIcon}
                    title="متوسط الإيرادات اليومية"
                    value={`${financialReports?.revenue?.daily_average || 0} ج.م`}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تفصيل الإيرادات الشهرية</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير الإيرادات الشهرية</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            عرض تفصيلي للإيرادات على مدار الأشهر
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const PaymentsReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    icon={CurrencyDollarIcon}
                    title="المدفوعات المحصلة"
                    value={`${financialReports?.payments?.collected || 0} ج.م`}
                    color="green"
                />
                <MetricCard
                    icon={ClockIcon}
                    title="المدفوعات المعلقة"
                    value={`${financialReports?.payments?.pending || 0} ج.م`}
                    color="orange"
                />
                <MetricCard
                    icon={ExclamationTriangleIcon}
                    title="المدفوعات المتأخرة"
                    value={`${financialReports?.payments?.overdue || 0} ج.م`}
                    color="red"
                />
                <MetricCard
                    icon={ArrowTrendingUpIcon}
                    title="معدل التحصيل"
                    value={`${financialReports?.payments?.collection_rate || 0}%`}
                    color="blue"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تفاصيل المدفوعات</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير المدفوعات</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            تتبع مفصل لجميع المدفوعات وحالتها
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const OutstandingReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={ExclamationTriangleIcon}
                    title="إجمالي المتأخرات"
                    value={`${financialReports?.outstanding?.total || 0} ج.م`}
                    color="red"
                />
                <MetricCard
                    icon={ClockIcon}
                    title="المتأخرات أكثر من 30 يوم"
                    value={`${financialReports?.outstanding?.over_30_days || 0} ج.م`}
                    color="orange"
                />
                <MetricCard
                    icon={CurrencyDollarIcon}
                    title="متوسط المبلغ المتأخر"
                    value={`${financialReports?.outstanding?.average_amount || 0} ج.م`}
                    color="yellow"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">قائمة المدفوعات المتأخرة</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">المدفوعات المتأخرة</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            قائمة تفصيلية بالمدفوعات المتأخرة والطلاب المدينين
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const TeacherEarningsReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={BanknotesIcon}
                    title="أعلى عائد للمعلم"
                    value={`${financialReports?.teacher_earnings?.highest || 0} ج.م`}
                    subtitle={financialReports?.teacher_earnings?.highest_teacher || 'غير محدد'}
                    color="green"
                />
                <MetricCard
                    icon={ArrowTrendingUpIcon}
                    title="متوسط عائد المعلم"
                    value={`${financialReports?.teacher_earnings?.average || 0} ج.م`}
                    color="blue"
                />
                <MetricCard
                    icon={CurrencyDollarIcon}
                    title="إجمالي أرباح المعلمين"
                    value={`${financialReports?.teacher_earnings?.total || 0} ج.م`}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تفصيل أرباح المعلمين</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">أرباح المعلمين</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            تفصيل مالي لأرباح كل معلم وأدائه المالي
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProjectionsReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    icon={ArrowTrendingUpIcon}
                    title="الإيرادات المتوقعة (الشهر القادم)"
                    value={`${financialReports?.projections?.next_month || 0} ج.م`}
                    color="blue"
                />
                <MetricCard
                    icon={ChartBarIcon}
                    title="الإيرادات المتوقعة (الربع القادم)"
                    value={`${financialReports?.projections?.next_quarter || 0} ج.م`}
                    color="green"
                />
                <MetricCard
                    icon={BanknotesIcon}
                    title="معدل النمو المتوقع"
                    value={`${financialReports?.projections?.growth_rate || 0}%`}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">التوقعات المالية</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">التوقعات المالية</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            توقعات الإيرادات والنمو المالي المستقبلي
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'revenue':
                return <RevenueReport />;
            case 'payments':
                return <PaymentsReport />;
            case 'outstanding':
                return <OutstandingReport />;
            case 'teacher_earnings':
                return <TeacherEarningsReport />;
            case 'projections':
                return <ProjectionsReport />;
            default:
                return <RevenueReport />;
        }
    };

    return (
        <CenterOwnerLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        التقارير المالية
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        تحليل مالي شامل لمركز {center?.name}
                    </p>
                </div>
            }
        >
            <Head title="التقارير المالية" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Financial Summary */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <DocumentChartBarIcon className="h-6 w-6 text-green-600 ml-2" />
                                <h3 className="text-lg font-medium text-gray-900">الملخص المالي</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {financialReports?.revenue?.total || 0} ج.م
                                    </div>
                                    <div className="text-sm text-gray-500">إجمالي الإيرادات</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {financialReports?.payments?.collected || 0} ج.م
                                    </div>
                                    <div className="text-sm text-gray-500">المدفوعات المحصلة</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {financialReports?.payments?.pending || 0} ج.م
                                    </div>
                                    <div className="text-sm text-gray-500">المدفوعات المعلقة</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">
                                        {financialReports?.outstanding?.total || 0} ج.م
                                    </div>
                                    <div className="text-sm text-gray-500">المدفوعات المتأخرة</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Report Tabs */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 space-x-reverse px-6 py-4">
                                <TabButton
                                    label="تقرير الإيرادات"
                                    isActive={activeTab === 'revenue'}
                                    onClick={() => setActiveTab('revenue')}
                                />
                                <TabButton
                                    label="تقرير المدفوعات"
                                    isActive={activeTab === 'payments'}
                                    onClick={() => setActiveTab('payments')}
                                />
                                <TabButton
                                    label="المدفوعات المتأخرة"
                                    isActive={activeTab === 'outstanding'}
                                    onClick={() => setActiveTab('outstanding')}
                                />
                                <TabButton
                                    label="أرباح المعلمين"
                                    isActive={activeTab === 'teacher_earnings'}
                                    onClick={() => setActiveTab('teacher_earnings')}
                                />
                                <TabButton
                                    label="التوقعات المالية"
                                    isActive={activeTab === 'projections'}
                                    onClick={() => setActiveTab('projections')}
                                />
                            </nav>
                        </div>

                        <div className="p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
