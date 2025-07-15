import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// import { Head } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import { TrendingUp, DollarSign, Users, BarChart3, PieChart, Activity, Clock, Target } from 'lucide-react';

export default function AdminDashboard({ 
    systemStats, 
    planStats, 
    usageStats,
    adminReports 
}) {
    const totalCapacity = usageStats.reduce((sum, user) => sum + user.max_students, 0);
    const totalUsed = usageStats.reduce((sum, user) => sum + user.student_count, 0);
    const utilizationRate = totalCapacity > 0 ? ((totalUsed / totalCapacity) * 100).toFixed(1) : 0;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    لوحة تحكم المدير
                </h2>
            }
        >
            <Head title="لوحة تحكم المدير" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* System Overview */}
                    <div className="mb-6 sm:mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">نظرة عامة على النظام</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">إجمالي المعلمين</h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemStats.total_users}</p>
                                            <p className="text-xs sm:text-sm text-green-600">{systemStats.approved_users} معتمد</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-yellow-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">
                                                <span className="sm:hidden">في الانتظار</span>
                                                <span className="hidden sm:inline">في انتظار الموافقة</span>
                                            </h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemStats.pending_users}</p>
                                            <p className="text-xs sm:text-sm text-yellow-600">
                                                <span className="sm:hidden">مراجعة</span>
                                                <span className="hidden sm:inline">تحتاج مراجعة</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-green-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">إجمالي الطلاب</h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemStats.total_students}</p>
                                            <p className="text-xs sm:text-sm text-green-600">
                                                <span className="sm:hidden">جميع المعلمين</span>
                                                <span className="hidden sm:inline">عبر جميع المعلمين</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-purple-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">استخدام النظام</h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{utilizationRate}%</p>
                                            <p className="text-xs sm:text-sm text-purple-600">{totalUsed} من {totalCapacity} مقعد</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Statistics */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                            <h3 className="text-lg font-medium text-gray-900">خطط الاشتراك</h3>
                            <Link
                                href={route('admin.plans.index')}
                                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                إدارة الخطط
                            </Link>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-4 sm:p-6">
                                {/* Mobile Card View */}
                                <div className="sm:hidden space-y-4">
                                    {planStats.map((plan, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium text-gray-900">{plan.name}</h4>
                                                {plan.is_default && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                        افتراضي
                                                    </span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">الطلاب:</span>
                                                    <span className="text-gray-900 font-medium mr-2">{plan.max_students}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">السعر:</span>
                                                    <span className="text-gray-900 font-medium mr-2">${plan.price}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">المشتركين:</span>
                                                    <span className="text-gray-900 font-medium mr-2">{plan.subscribers}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden sm:block">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الخطة</th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <span className="sm:hidden">طلاب</span>
                                                        <span className="hidden sm:inline">عدد الطلاب</span>
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <span className="sm:hidden">سعر</span>
                                                        <span className="hidden sm:inline">السعر/شهر</span>
                                                    </th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">المشتركين</th>
                                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {planStats.map((plan, index) => (
                                                    <tr key={index}>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{plan.max_students} طالب</div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">${plan.price}</div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{plan.subscribers}</div>
                                                        </td>
                                                        <td className="px-3 py-4 whitespace-nowrap">
                                                            {plan.is_default && (
                                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                    افتراضي
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Management Quick Actions */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
                            <h3 className="text-lg font-medium text-gray-900">إدارة المعلمين</h3>
                            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:space-x-reverse">
                                <Link
                                    href={route('admin.teachers.create')}
                                    className="inline-flex items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                >
                                    <span className="sm:hidden">إضافة</span>
                                    <span className="hidden sm:inline">إضافة معلم</span>
                                </Link>
                                <Link
                                    href={route('admin.teachers.index')}
                                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    <span className="sm:hidden">إدارة</span>
                                    <span className="hidden sm:inline">إدارة المعلمين</span>
                                </Link>
                                <Link
                                    href={route('admin.feedback.index')}
                                    className="inline-flex items-center justify-center rounded-md bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                                >
                                    <span className="sm:hidden">التواصل</span>
                                    <span className="hidden sm:inline">إدارة التواصل</span>
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-blue-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">إجمالي المعلمين</h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemStats.total_users}</p>
                                            <p className="text-xs sm:text-sm text-green-600">{systemStats.approved_users} معتمد</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-green-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">
                                                <span className="sm:hidden">نشطين</span>
                                                <span className="hidden sm:inline">معلمين نشطين</span>
                                            </h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemStats.approved_users}</p>
                                            <p className="text-xs sm:text-sm text-blue-600">
                                                <span className="sm:hidden">فعال</span>
                                                <span className="hidden sm:inline">مع اشتراك فعال</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-yellow-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">
                                                <span className="sm:hidden">الانتظار</span>
                                                <span className="hidden sm:inline">في انتظار الاعتماد</span>
                                            </h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemStats.pending_users}</p>
                                            <p className="text-xs sm:text-sm text-yellow-600">
                                                <span className="sm:hidden">مراجعة</span>
                                                <span className="hidden sm:inline">يحتاج مراجعة</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-md bg-purple-100">
                                                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="ml-3 sm:ml-4">
                                            <h4 className="text-base sm:text-lg font-medium text-gray-900">إجمالي الطلاب</h4>
                                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{systemStats.total_students}</p>
                                            <p className="text-xs sm:text-sm text-purple-600">
                                                <span className="sm:hidden">جميع المعلمين</span>
                                                <span className="hidden sm:inline">عبر جميع المعلمين</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                 

                    {/* Comprehensive Admin Reports */}
                    {adminReports && (
                        <div className="space-y-8">
                            {/* Financial Reports */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <DollarSign className="w-5 h-5 text-green-600 ml-2" />
                                    التقارير المالية
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-green-800">إجمالي الإيرادات</p>
                                                <p className="text-xl sm:text-2xl font-bold text-green-900">${adminReports.financial.total_revenue.toLocaleString()}</p>
                                            </div>
                                            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-800">
                                                    <span className="sm:hidden">إيرادات الشهر</span>
                                                    <span className="hidden sm:inline">إيرادات هذا الشهر</span>
                                                </p>
                                                <p className="text-xl sm:text-2xl font-bold text-blue-900">${adminReports.financial.monthly_revenue.toLocaleString()}</p>
                                            </div>
                                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-purple-800">معدل النمو</p>
                                                <p className="text-xl sm:text-2xl font-bold text-purple-900">{adminReports.financial.growth_rate}%</p>
                                            </div>
                                            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-orange-800">
                                                    <span className="sm:hidden">اشتراكات نشطة</span>
                                                    <span className="hidden sm:inline">الاشتراكات النشطة</span>
                                                </p>
                                                <p className="text-xl sm:text-2xl font-bold text-orange-900">{adminReports.plans.total_active_subscriptions}</p>
                                            </div>
                                            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* System Activity Reports */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Activity className="w-5 h-5 text-blue-600 ml-2" />
                                    نشاط النظام
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 text-center">
                                        <Users className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mb-2" />
                                        <p className="text-sm font-medium text-blue-800">
                                            <span className="sm:hidden">المجموعات</span>
                                            <span className="hidden sm:inline">إجمالي المجموعات</span>
                                        </p>
                                        <p className="text-xl sm:text-2xl font-bold text-blue-900">{adminReports.system.total_groups}</p>
                                    </div>
                                    
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 sm:p-6 text-center">
                                        <Clock className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-indigo-600 mb-2" />
                                        <p className="text-sm font-medium text-indigo-800">
                                            <span className="sm:hidden">جلسات الشهر</span>
                                            <span className="hidden sm:inline">الجلسات هذا الشهر</span>
                                        </p>
                                        <p className="text-xl sm:text-2xl font-bold text-indigo-900">{adminReports.system.total_sessions_this_month}</p>
                                    </div>
                                    
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 sm:p-6 text-center">
                                        <TrendingUp className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-emerald-600 mb-2" />
                                        <p className="text-sm font-medium text-emerald-800">
                                            <span className="sm:hidden">الحضور</span>
                                            <span className="hidden sm:inline">إجمالي الحضور</span>
                                        </p>
                                        <p className="text-xl sm:text-2xl font-bold text-emerald-900">{adminReports.system.total_attendances_this_month}</p>
                                    </div>
                                    
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 text-center">
                                        <BarChart3 className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mb-2" />
                                        <p className="text-sm font-medium text-purple-800">معدل الاستخدام</p>
                                        <p className="text-xl sm:text-2xl font-bold text-purple-900">{adminReports.system.utilization_rate}%</p>
                                    </div>
                                </div>
                            </div>

                      
                            {/* Plan Distribution */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <PieChart className="w-5 h-5 text-indigo-600 ml-2" />
                                    توزيع الخطط
                                </h3>
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-4 sm:p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                {adminReports.plans.distribution.map((plan, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg">
                                                        <div>
                                                            <h5 className="font-medium text-gray-900 text-sm sm:text-base">{plan.name}</h5>
                                                            <p className="text-xs sm:text-sm text-gray-600">{plan.subscribers} مشترك</p>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-base sm:text-lg font-bold text-indigo-600">{plan.percentage}%</p>
                                                            <div className="w-16 sm:w-20 bg-gray-200 rounded-full h-2 mt-1">
                                                                <div 
                                                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                                                                    style={{ width: `${plan.percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Registration Trends */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-4 text-sm sm:text-base">
                                                    <span className="sm:hidden">اتجاه التسجيلات</span>
                                                    <span className="hidden sm:inline">اتجاه التسجيلات (آخر 6 أشهر)</span>
                                                </h4>
                                                <div className="space-y-3">
                                                    {adminReports.teachers.registration_trends.map((trend, index) => (
                                                        <div key={index} className="flex items-center justify-between">
                                                            <span className="text-xs sm:text-sm text-gray-600">{trend.month}</span>
                                                            <div className="flex items-center">
                                                                <span className="text-xs sm:text-sm font-medium text-gray-900 mr-2">{trend.count}</span>
                                                                <div className="w-10 sm:w-12 bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                                        style={{ width: `${Math.max(trend.count * 10, 5)}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                           
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
