import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    ChartBarIcon, 
    UserGroupIcon, 
    AcademicCapIcon,
    ArrowTrendingUpIcon,
    CalendarIcon,
    ClockIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Reports({ center, reports }) {
    const [activeTab, setActiveTab] = useState('enrollment');

    const TabButton = ({ label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    const ReportCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
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
                </div>
            </div>
        </div>
    );

    const EnrollmentReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportCard
                    icon={AcademicCapIcon}
                    title="إجمالي التسجيلات"
                    value={reports?.enrollment?.total || 0}
                    color="blue"
                />
                <ReportCard
                    icon={ArrowTrendingUpIcon}
                    title="التسجيلات هذا الشهر"
                    value={reports?.enrollment?.this_month || 0}
                    color="green"
                />
                <ReportCard
                    icon={CalendarIcon}
                    title="معدل النمو الشهري"
                    value={`${reports?.enrollment?.growth_rate || 0}%`}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تفاصيل التسجيلات</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير التسجيلات</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            عرض تفصيلي لتسجيلات الطلاب على مدار الأشهر
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const AttendanceReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportCard
                    icon={ClockIcon}
                    title="معدل الحضور العام"
                    value={`${reports?.attendance?.overall_rate || 0}%`}
                    color="green"
                />
                <ReportCard
                    icon={UserGroupIcon}
                    title="أفضل مجموعة"
                    value={reports?.attendance?.best_group || 'غير محدد'}
                    subtitle={`${reports?.attendance?.best_group_rate || 0}% حضور`}
                    color="blue"
                />
                <ReportCard
                    icon={ArrowTrendingUpIcon}
                    title="الاتجاه الشهري"
                    value={`${reports?.attendance?.monthly_trend || 0}%`}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تفاصيل الحضور</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير الحضور</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            إحصائيات مفصلة حول حضور الطلاب والمعلمين
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const PerformanceReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportCard
                    icon={ChartBarIcon}
                    title="معدل الأداء العام"
                    value={`${reports?.performance?.overall_score || 0}%`}
                    color="blue"
                />
                <ReportCard
                    icon={ArrowTrendingUpIcon}
                    title="تحسن الأداء"
                    value={`${reports?.performance?.improvement || 0}%`}
                    color="green"
                />
                <ReportCard
                    icon={AcademicCapIcon}
                    title="أفضل طلاب"
                    value={reports?.performance?.top_students || 0}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تفاصيل الأداء</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير الأداء</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            تحليل شامل لأداء الطلاب والمجموعات
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const TeacherPerformanceReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportCard
                    icon={UserGroupIcon}
                    title="أفضل معلم"
                    value={reports?.teacher_performance?.best_teacher || 'غير محدد'}
                    subtitle={`${reports?.teacher_performance?.best_score || 0}% نجاح`}
                    color="blue"
                />
                <ReportCard
                    icon={AcademicCapIcon}
                    title="معدل نجاح المعلمين"
                    value={`${reports?.teacher_performance?.success_rate || 0}%`}
                    color="green"
                />
                <ReportCard
                    icon={ArrowTrendingUpIcon}
                    title="تحسن الأداء"
                    value={`${reports?.teacher_performance?.improvement || 0}%`}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تقييم المعلمين</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير أداء المعلمين</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            تقييم شامل لأداء المعلمين ونتائج طلابهم
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const GrowthReport = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportCard
                    icon={ArrowTrendingUpIcon}
                    title="معدل النمو السنوي"
                    value={`${reports?.growth?.annual_rate || 0}%`}
                    color="green"
                />
                <ReportCard
                    icon={AcademicCapIcon}
                    title="نمو الطلاب"
                    value={`${reports?.growth?.student_growth || 0}%`}
                    color="blue"
                />
                <ReportCard
                    icon={ChartBarIcon}
                    title="نمو الإيرادات"
                    value={`${reports?.growth?.revenue_growth || 0}%`}
                    color="purple"
                />
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">تحليل النمو</h3>
                </div>
                <div className="p-6">
                    <div className="text-center py-8">
                        <ArrowTrendingUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">تقرير النمو</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            تحليل اتجاهات النمو على المدى الطويل
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'enrollment':
                return <EnrollmentReport />;
            case 'attendance':
                return <AttendanceReport />;
            case 'performance':
                return <PerformanceReport />;
            case 'teacher_performance':
                return <TeacherPerformanceReport />;
            case 'growth':
                return <GrowthReport />;
            default:
                return <EnrollmentReport />;
        }
    };

    return (
        <CenterOwnerLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        التقارير الشاملة
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        تقارير مفصلة عن أداء مركز {center?.name}
                    </p>
                </div>
            }
        >
            <Head title="التقارير الشاملة" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Report Summary */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <DocumentChartBarIcon className="h-6 w-6 text-blue-600 ml-2" />
                                <h3 className="text-lg font-medium text-gray-900">ملخص التقارير</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {(reports?.enrollment?.total || 0) + (reports?.growth?.student_growth || 0)}
                                    </div>
                                    <div className="text-sm text-gray-500">إجمالي النشاط</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {reports?.attendance?.overall_rate || 0}%
                                    </div>
                                    <div className="text-sm text-gray-500">معدل الحضور</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {reports?.teacher_performance?.success_rate || 0}%
                                    </div>
                                    <div className="text-sm text-gray-500">أداء المعلمين</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {reports?.growth?.annual_rate || 0}%
                                    </div>
                                    <div className="text-sm text-gray-500">معدل النمو</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Report Tabs */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 space-x-reverse px-6 py-4">
                                <TabButton
                                    tab="enrollment"
                                    label="تقرير التسجيلات"
                                    isActive={activeTab === 'enrollment'}
                                    onClick={() => setActiveTab('enrollment')}
                                />
                                <TabButton
                                    tab="attendance"
                                    label="تقرير الحضور"
                                    isActive={activeTab === 'attendance'}
                                    onClick={() => setActiveTab('attendance')}
                                />
                                <TabButton
                                    tab="performance"
                                    label="تقرير الأداء"
                                    isActive={activeTab === 'performance'}
                                    onClick={() => setActiveTab('performance')}
                                />
                                <TabButton
                                    tab="teacher_performance"
                                    label="أداء المعلمين"
                                    isActive={activeTab === 'teacher_performance'}
                                    onClick={() => setActiveTab('teacher_performance')}
                                />
                                <TabButton
                                    tab="growth"
                                    label="تقرير النمو"
                                    isActive={activeTab === 'growth'}
                                    onClick={() => setActiveTab('growth')}
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
