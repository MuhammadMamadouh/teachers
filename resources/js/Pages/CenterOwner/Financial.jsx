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

    // Add scrollbar hiding styles and CSS
    const scrollbarHideStyle = {
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none',  /* IE and Edge */
        WebkitScrollbar: {
            display: 'none' /* Chrome, Safari, Opera */
        }
    };

    // Add CSS to hide scrollbars
    const scrollbarHideCSS = `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;

    const TabButton = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-2 sm:px-3 md:px-4 py-2 text-xs sm:text-sm font-medium rounded-md sm:rounded-lg whitespace-nowrap flex-shrink-0 min-w-fit transition-colors duration-200 ${
                isActive
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
        >
            {label}
        </button>
    );

    const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'green', trend = null }) => (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-start sm:items-center">
                <div className={`p-2 sm:p-3 rounded-md bg-${color}-100 flex-shrink-0`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 text-${color}-600`} />
                </div>
                <div className="mr-3 sm:mr-4 min-w-0 flex-1">
                    <h3 className="text-sm sm:text-lg font-medium text-gray-900 leading-tight break-words">{title}</h3>
                    <div className="text-lg sm:text-2xl font-bold text-gray-900 break-words mt-1">{value}</div>
                    {subtitle && (
                        <p className="text-xs sm:text-sm text-gray-500 break-words mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center mt-1 sm:mt-2 text-xs sm:text-sm ${
                            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                            <ArrowTrendingUpIcon className={`h-3 w-3 sm:h-4 sm:w-4 ml-1 flex-shrink-0 ${trend < 0 ? 'rotate-180' : ''}`} />
                            <span className="break-words">{Math.abs(trend)}% عن الشهر الماضي</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const RevenueReport = () => (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">تفصيل الإيرادات الشهرية</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="text-center py-6 sm:py-8">
                        <BanknotesIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير الإيرادات الشهرية</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            عرض تفصيلي للإيرادات على مدار الأشهر
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const PaymentsReport = () => (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">تفاصيل المدفوعات</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="text-center py-6 sm:py-8">
                        <CurrencyDollarIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير المدفوعات</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            تتبع مفصل لجميع المدفوعات وحالتها
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const OutstandingReport = () => (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">قائمة المدفوعات المتأخرة</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="text-center py-6 sm:py-8">
                        <ExclamationTriangleIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">المدفوعات المتأخرة</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            قائمة تفصيلية بالمدفوعات المتأخرة والطلاب المدينين
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const TeacherEarningsReport = () => (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">تفصيل أرباح المعلمين</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="text-center py-6 sm:py-8">
                        <BanknotesIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">أرباح المعلمين</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            تفصيل مالي لأرباح كل معلم وأدائه المالي
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProjectionsReport = () => (
        <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900">التوقعات المالية</h3>
                </div>
                <div className="p-4 sm:p-6">
                    <div className="text-center py-6 sm:py-8">
                        <ChartBarIcon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">التوقعات المالية</h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
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
                    <h2 className="font-semibold text-lg sm:text-xl text-gray-800 leading-tight">
                        التقارير المالية
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        تحليل مالي شامل لمركز {center?.name}
                    </p>
                </div>
            }
        >
            <Head title="التقارير المالية" />
            
            {/* Add CSS for scrollbar hiding */}
            <style dangerouslySetInnerHTML={{ __html: scrollbarHideCSS }} />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Financial Summary */}
                    <div className="bg-white rounded-lg shadow mb-4 sm:mb-6 md:mb-8">
                        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <DocumentChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600 ml-2" />
                                <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">الملخص المالي</h3>
                            </div>
                        </div>
                        <div className="p-3 sm:p-4 md:p-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                                <div className="text-center p-2 sm:p-3 rounded-lg bg-gray-50">
                                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-green-600">
                                        {financialReports?.revenue?.total || 0} ج.م
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 mt-1">إجمالي الإيرادات</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 rounded-lg bg-gray-50">
                                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">
                                        {financialReports?.payments?.collected || 0} ج.م
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 mt-1">المدفوعات المحصلة</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 rounded-lg bg-gray-50">
                                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-orange-600">
                                        {financialReports?.payments?.pending || 0} ج.م
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 mt-1">المدفوعات المعلقة</div>
                                </div>
                                <div className="text-center p-2 sm:p-3 rounded-lg bg-gray-50">
                                    <div className="text-sm sm:text-lg md:text-2xl font-bold text-red-600">
                                        {financialReports?.outstanding?.total || 0} ج.م
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 mt-1">المدفوعات المتأخرة</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Report Tabs */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav 
                                className="flex gap-2 sm:gap-4 md:gap-6 lg:gap-8 px-3 sm:px-4 md:px-6 py-3 sm:py-4 overflow-x-auto scrollbar-hide"
                                style={{
                                    ...scrollbarHideStyle,
                                    WebkitOverflowScrolling: 'touch'
                                }}
                            >
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

                        <div className="p-3 sm:p-4 md:p-6">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
