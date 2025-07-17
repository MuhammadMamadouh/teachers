import { Head, Link } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    UserGroupIcon, 
    AcademicCapIcon, 
    CurrencyDollarIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function Dashboard({ 
    center, 
    statistics, 
    recentActivity, 
    financialOverview, 
    performanceMetrics 
}) {
    const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend = null }) => (
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
                        <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                                {value}
                            </div>
                            {trend && (
                                <div className={`mr-2 flex items-baseline text-sm font-semibold ${
                                    trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                    <ArrowTrendingUpIcon className={`self-center flex-shrink-0 h-4 w-4 ${
                                        trend < 0 ? 'rotate-180' : ''
                                    }`} />
                                    {Math.abs(trend)}%
                                </div>
                            )}
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

    const ActivityCard = ({ title, items, emptyMessage }) => (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <div className="p-6">
                {items.length > 0 ? (
                    <div className="space-y-3">
                        {items.slice(0, 5).map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.subtitle}</p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {item.date}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
                )}
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, href, icon: Icon, color = 'blue' }) => (
        <Link 
            href={href}
            className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200"
        >
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </div>
        </Link>
    );

    return (
        <CenterOwnerLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            لوحة تحكم مالك المركز
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            مرحباً بك في لوحة تحكم مركز {center?.name}
                        </p>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                        <Link
                            href={route('center.owner.reports')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            عرض التقارير
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="لوحة تحكم مالك المركز" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Key Performance Indicators */}
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
                            subtitle={`${statistics?.new_students_this_month || 0} طالب جديد هذا الشهر`}
                            color="green"
                        />
                        <StatCard
                            icon={ChartBarIcon}
                            title="المجموعات النشطة"
                            value={`${statistics?.active_groups || 0}/${statistics?.total_groups || 0}`}
                            color="purple"
                        />
                        <StatCard
                            icon={CurrencyDollarIcon}
                            title="الإيرادات الشهرية"
                            value={`${statistics?.this_month_revenue || 0} ج.م`}
                            trend={financialOverview?.revenue_growth}
                            color="yellow"
                        />
                    </div>

                    {/* Financial Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                                <div className="mr-4">
                                    <h3 className="text-lg font-medium text-gray-900">إجمالي الإيرادات</h3>
                                    <div className="text-2xl font-bold text-green-600">
                                        {statistics?.total_revenue || 0} ج.م
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                                <div className="mr-4">
                                    <h3 className="text-lg font-medium text-gray-900">المدفوعات المعلقة</h3>
                                    <div className="text-2xl font-bold text-orange-600">
                                        {statistics?.pending_payments || 0} ج.م
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <ChartBarIcon className="h-8 w-8 text-blue-600" />
                                <div className="mr-4">
                                    <h3 className="text-lg font-medium text-gray-900">معدل الاستخدام</h3>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {performanceMetrics?.utilization_rate || 0}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {performanceMetrics?.average_group_size || 0}
                            </div>
                            <div className="text-sm text-gray-500">متوسط حجم المجموعة</div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {performanceMetrics?.teacher_efficiency || 0}
                            </div>
                            <div className="text-sm text-gray-500">كفاءة المعلمين</div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {performanceMetrics?.student_retention || 0}%
                            </div>
                            <div className="text-sm text-gray-500">معدل الاحتفاظ بالطلاب</div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 text-center">
                            <div className="text-2xl font-bold text-indigo-600">
                                {performanceMetrics?.utilization_rate || 0}%
                            </div>
                            <div className="text-sm text-gray-500">معدل استخدام القدرة</div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <ActivityCard
                            title="الطلاب الجدد"
                            items={recentActivity?.recent_students?.map(student => ({
                                name: student.name,
                                subtitle: `المعلم: ${student.user?.name || 'غير محدد'} - المجموعة: ${student.group?.name || 'غير محدد'}`,
                                date: new Date(student.created_at).toLocaleDateString('ar-EG')
                            })) || []}
                            emptyMessage="لا توجد تسجيلات حديثة"
                        />

                        <ActivityCard
                            title="المدفوعات الأخيرة"
                            items={recentActivity?.recent_payments?.map(payment => ({
                                name: payment.student?.name || 'غير محدد',
                                subtitle: `${payment.amount} ج.م`,
                                date: new Date(payment.paid_at).toLocaleDateString('ar-EG')
                            })) || []}
                            emptyMessage="لا توجد مدفوعات حديثة"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">إجراءات سريعة</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <QuickActionCard
                                    title="إدارة المعلمين"
                                    description="عرض وإدارة معلمي المركز"
                                    href={route('center.owner.teachers')}
                                    icon={UserGroupIcon}
                                    color="blue"
                                />
                                
                                <QuickActionCard
                                    title="إدارة الطلاب"
                                    description="عرض وإدارة طلاب المركز"
                                    href={route('center.owner.students')}
                                    icon={AcademicCapIcon}
                                    color="green"
                                />
                                
                                <QuickActionCard
                                    title="التقارير المالية"
                                    description="عرض التقارير المالية التفصيلية"
                                    href={route('center.owner.financial')}
                                    icon={CurrencyDollarIcon}
                                    color="yellow"
                                />
                                
                                <QuickActionCard
                                    title="إعدادات المركز"
                                    description="تحديث معلومات وإعدادات المركز"
                                    href={route('center.owner.settings')}
                                    icon={CheckCircleIcon}
                                    color="purple"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
