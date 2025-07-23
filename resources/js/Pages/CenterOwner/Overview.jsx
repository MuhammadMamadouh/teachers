import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    UserGroupIcon, 
    AcademicCapIcon, 
    ChartBarIcon,
    ArrowTrendingUpIcon,
    BanknotesIcon
} from '@heroicons/react/24/outline';

export default function Overview({ center, statistics, teacherStats, monthlyTrends }) {
    const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="mr-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            {title}
                        </dt>
                        <dd className="text-2xl font-semibold text-gray-900">
                            {value}
                        </dd>
                        {subtitle && (
                            <dd className="text-sm text-gray-500 mt-1">
                                {subtitle}
                            </dd>
                        )}
                    </dl>
                </div>
            </div>
        </div>
    );

    return (
        <CenterOwnerLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        نظرة عامة على المركز
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        نظرة شاملة على أداء مركز {center?.name}
                    </p>
                </div>
            }
        >
            <Head title="نظرة عامة على المركز" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Center Information */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">معلومات المركز</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">اسم المركز</label>
                                    <p className="mt-1 text-sm text-gray-900">{center?.name || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">نوع المركز</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {center?.type === 'individual' ? 'فردي' : 'مؤسسة'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">العنوان</label>
                                    <p className="mt-1 text-sm text-gray-900">{center?.address || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الهاتف</label>
                                    <p className="mt-1 text-sm text-gray-900">{center?.phone || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                                    <p className="mt-1 text-sm text-gray-900">{center?.email || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">تاريخ التأسيس</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {center?.created_at ? new Date(center.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Overview Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={UserGroupIcon}
                            title="إجمالي المعلمين"
                            value={statistics?.total_teachers || 0}
                            color="blue"
                        />
                        <StatCard
                            icon={AcademicCapIcon}
                            title="إجمالي الطلاب"
                            value={statistics?.total_students || 0}
                            color="green"
                        />
                        <StatCard
                            icon={ChartBarIcon}
                            title="إجمالي المجموعات"
                            value={statistics?.total_groups || 0}
                            subtitle={`${statistics?.active_groups || 0} نشطة`}
                            color="purple"
                        />
                        <StatCard
                            icon={BanknotesIcon}
                            title="الإيرادات الإجمالية"
                            value={`${statistics?.total_revenue || 0} ج.م`}
                            color="yellow"
                        />
                    </div>

                    {/* Teacher Performance Summary */}
                    <div className="bg-white rounded-lg shadow mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">ملخص أداء المعلمين</h3>
                        </div>
                        <div className="p-6">
                            {teacherStats && teacherStats.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    المعلم
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    عدد الطلاب
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    عدد المجموعات
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    الإيرادات
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    معدل الحضور
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {teacherStats.map((teacher, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {teacher.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {teacher.subject || 'غير محدد'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.students_count || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.groups_count || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.total_revenue || 0} ج.م
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {teacher.attendance_rate || 0}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد معلمين</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        ابدأ بإضافة معلمين إلى المركز.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Monthly Trends */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">الاتجاهات الشهرية</h3>
                        </div>
                        <div className="p-6">
                            {monthlyTrends && monthlyTrends.length > 0 ? (
                                <div className="space-y-4">
                                    {monthlyTrends.map((trend, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900">{trend.month}</h4>
                                                <div className="flex items-center space-x-4 space-x-reverse mt-2">
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">الطلاب:</span> {trend.students || 0}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <span className="font-medium">الإيرادات:</span> {trend.revenue || 0} ج.م
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <ArrowTrendingUpIcon 
                                                    className={`h-5 w-5 ${
                                                        trend.growth > 0 ? 'text-green-500' : 
                                                        trend.growth < 0 ? 'text-red-500 rotate-180' : 
                                                        'text-gray-400'
                                                    }`} 
                                                />
                                                <span className={`mr-1 text-sm font-medium ${
                                                    trend.growth > 0 ? 'text-green-600' : 
                                                    trend.growth < 0 ? 'text-red-600' : 
                                                    'text-gray-500'
                                                }`}>
                                                    {Math.abs(trend.growth || 0)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد بيانات كافية</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        ستظهر الاتجاهات الشهرية عند توفر بيانات كافية.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
