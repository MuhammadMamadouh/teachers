import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, RotateCcw, DollarSign, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import StartNewTermModal from '@/Components/StartNewTermModal';

export default function Dashboard({ subscriptionLimits, currentStudentCount, canAddStudents, availablePlans, isAssistant = false, teacherName = '', error }) {
    const [todaySessions, setTodaySessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [showTermResetModal, setShowTermResetModal] = useState(false);
    const [reports, setReports] = useState(null);
    const [loadingReports, setLoadingReports] = useState(true);

    useEffect(() => {
        // Fetch today's sessions
        fetch(route('dashboard.today-sessions'))
            .then(response => response.json())
            .then(data => {
                setTodaySessions(data);
                setLoadingSessions(false);
            })
            .catch(error => {
                console.error('Error fetching today sessions:', error);
                setLoadingSessions(false);
            });

        // Fetch dashboard reports
        fetch(route('dashboard.reports'))
            .then(response => response.json())
            .then(data => {
                setReports(data);
                setLoadingReports(false);
            })
            .catch(error => {
                console.error('Error fetching reports:', error);
                setLoadingReports(false);
            });
    }, []);

    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    لوحة التحكم
                </h2>
            }
        >
            <Head title="لوحة التحكم" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium mb-2">مرحباً بك مرة أخرى!</h3>
                            <p className="text-gray-600">قم بإدارة طلابك وتتبع حضورهم.</p>
                            
                            {/* Error message */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}
                            
                            {/* Assistant Info Banner */}
                            {isAssistant && teacherName && (
                                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mt-4" role="alert">
                                    <div className="flex">
                                        <div className="py-1 ml-2">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-bold">مساعد معلم</p>
                                            <p className="text-sm">أنت تعمل كمساعد للمعلم {teacherName}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">الطلاب</h4>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {currentStudentCount} من {subscriptionLimits.max_students || 0}
                                        </p>                        <p className="text-sm text-gray-500">
                                            {subscriptionLimits.has_active_subscription ? 'خطة نشطة' : 'لا توجد خطة نشطة'}
                                        </p>
                                        {subscriptionLimits.plan && (
                                            <p className="text-xs text-blue-600 font-medium mt-1">
                                                خطة {subscriptionLimits.plan.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={`flex items-center justify-center h-12 w-12 rounded-md ${subscriptionLimits.has_active_subscription ? 'bg-green-100' : 'bg-red-100'
                                            }`}>
                                            <svg className={`h-6 w-6 ${subscriptionLimits.has_active_subscription ? 'text-green-600' : 'text-red-600'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">الاشتراك</h4>                        <p className={`text-sm font-medium ${subscriptionLimits.has_active_subscription ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {subscriptionLimits.has_active_subscription ? 'نشط' : 'غير نشط'}
                                        </p>
                                        {subscriptionLimits.plan ? (
                                            <p className="text-sm text-gray-500">خطة {subscriptionLimits.plan.name}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500">لا توجد خطة</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={`flex items-center justify-center h-12 w-12 rounded-md ${canAddStudents ? 'bg-green-100' : 'bg-yellow-100'
                                            }`}>
                                            <svg className={`h-6 w-6 ${canAddStudents ? 'text-green-600' : 'text-yellow-600'
                                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">إضافة طلاب</h4>
                                        <p className={`text-sm font-medium ${canAddStudents ? 'text-green-600' : 'text-yellow-600'
                                            }`}>
                                            {canAddStudents ? 'متاح' : 'تم الوصول للحد الأقصى'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {subscriptionLimits.max_students - currentStudentCount} مقعد متبقي
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

 {/* Reports Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mt-6">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <BarChart3 className="w-5 h-5 text-purple-600 ml-2" />
                                <h3 className="text-lg font-medium text-gray-900">تقارير شاملة</h3>
                            </div>
                            
                            {loadingReports ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                    <p className="text-gray-500 mt-2">جاري تحميل التقارير...</p>
                                </div>
                            ) : reports ? (
                                <div className="space-y-6">
                                    {/* Financial Reports */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                                            <DollarSign className="w-4 h-4 text-green-600 ml-2" />
                                            التقارير المالية
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-green-800">إجمالي الدخل المتوقع (شهرياً)</p>
                                                        <p className="text-2xl font-bold text-green-900">{reports.financial.total_expected_monthly_income.toLocaleString()} ج.م</p>
                                                    </div>
                                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-800">إجمالي المدفوعات المحصلة</p>
                                                        <p className="text-2xl font-bold text-blue-900">{reports.financial.total_collected_payments.toLocaleString()} ج.م</p>
                                                    </div>
                                                    <DollarSign className="h-8 w-8 text-blue-600" />
                                                </div>
                                            </div>
                                            
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-amber-800">المدفوعات المتأخرة</p>
                                                        <p className="text-2xl font-bold text-amber-900">{reports.financial.pending_payments.toLocaleString()} ج.م</p>
                                                    </div>
                                                    <Clock className="h-8 w-8 text-amber-600" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <h5 className="text-sm font-medium text-gray-800 mb-2">نسبة تحصيل المدفوعات</h5>
                                                <div className="flex items-center">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 ml-3">
                                                        <div 
                                                            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                                            style={{ width: `${reports.financial.collection_rate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{reports.financial.collection_rate}%</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                                <p className="text-sm font-medium text-purple-800">متوسط سعر الطالب</p>
                                                <p className="text-xl font-bold text-purple-900">{reports.financial.average_student_price.toLocaleString()} ج.م</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Groups and Students Reports */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                                            <Users className="w-4 h-4 text-blue-600 ml-2" />
                                            تقارير المجموعات والطلاب
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                                <Users className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                                                <p className="text-sm font-medium text-blue-800">إجمالي المجموعات</p>
                                                <p className="text-2xl font-bold text-blue-900">{reports.groups.total_groups}</p>
                                            </div>
                                            
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                <Users className="mx-auto h-8 w-8 text-green-600 mb-2" />
                                                <p className="text-sm font-medium text-green-800">إجمالي الطلاب</p>
                                                <p className="text-2xl font-bold text-green-900">{reports.groups.total_students}</p>
                                            </div>
                                            
                                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                                                <BookOpen className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                                                <p className="text-sm font-medium text-purple-800">متوسط الطلاب لكل مجموعة</p>
                                                <p className="text-2xl font-bold text-purple-900">{reports.groups.average_students_per_group}</p>
                                            </div>
                                            
                                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                                                <Calendar className="mx-auto h-8 w-8 text-indigo-600 mb-2" />
                                                <p className="text-sm font-medium text-indigo-800">إجمالي الجلسات هذا الشهر</p>
                                                <p className="text-2xl font-bold text-indigo-900">{reports.attendance.total_sessions_this_month}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance Reports */}
                                    <div>
                                        <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                                            <Calendar className="w-4 h-4 text-emerald-600 ml-2" />
                                            تقارير الحضور
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                                <p className="text-sm font-medium text-emerald-800">معدل الحضور العام</p>
                                                <div className="flex items-center mt-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-3 ml-3">
                                                        <div 
                                                            className="bg-emerald-600 h-3 rounded-full transition-all duration-300" 
                                                            style={{ width: `${reports.attendance.overall_attendance_rate}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-lg font-bold text-emerald-900">{reports.attendance.overall_attendance_rate}%</span>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                                                <p className="text-sm font-medium text-cyan-800">إجمالي الحضور هذا الشهر</p>
                                                <p className="text-2xl font-bold text-cyan-900">{reports.attendance.total_attendances_this_month}</p>
                                            </div>
                                            
                                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                                <p className="text-sm font-medium text-teal-800">متوسط الحضور لكل جلسة</p>
                                                <p className="text-2xl font-bold text-teal-900">{reports.attendance.average_attendance_per_session}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Performing Groups */}
                                    {reports.groups.top_groups && reports.groups.top_groups.length > 0 && (
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                                                <TrendingUp className="w-4 h-4 text-yellow-600 ml-2" />
                                                أفضل المجموعات أداءً
                                            </h4>
                                            <div className="space-y-3">
                                                {reports.groups.top_groups.map((group, index) => (
                                                    <div key={group.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                                                                index === 0 ? 'bg-yellow-500' : 
                                                                index === 1 ? 'bg-gray-400' : 
                                                                'bg-orange-600'
                                                            }`}>
                                                                {index + 1}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-semibold text-gray-900">{group.name}</h5>
                                                                <p className="text-sm text-gray-600">{group.students_count} طالب</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-sm font-medium text-gray-900">معدل الحضور: {group.attendance_rate}%</p>
                                                            <p className="text-sm text-gray-600">الدخل الشهري: {group.monthly_income.toLocaleString()} ج.م</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                  
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500 mt-2">تعذر تحميل التقارير</p>
                                    <p className="text-sm text-gray-400">حاول مرة أخرى لاحقاً</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">الإجراءات السريعة</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Link
                                    href={canAddStudents ? route('students.create') : '#'}
                                    className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${canAddStudents
                                            ? 'border-gray-300 hover:border-gray-400'
                                            : 'border-gray-200 cursor-not-allowed opacity-50'
                                        }`}
                                    disabled={!canAddStudents}
                                >
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">إضافة طالب جديد</span>
                                    <span className="block text-xs text-gray-500 mt-1">
                                        {canAddStudents ? 'أضف طلاب إلى صفك' : 'تم الوصول لحد الاشتراك'}
                                    </span>
                                </Link>

                                <Link
                                    href={route('students.index')}
                                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors"
                                >
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">إدارة الطلاب</span>
                                    <span className="block text-xs text-gray-500 mt-1">عرض وتعديل طلابك</span>
                                </Link>

                                {availablePlans && availablePlans.length > 0 && (
                                    <Link
                                        href={route('plans.index')}
                                        className="p-4 border-2 border-dashed border-indigo-300 rounded-lg text-center hover:border-indigo-400 transition-colors bg-indigo-50"
                                    >
                                        <svg className="mx-auto h-12 w-12 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <span className="text-sm font-medium text-indigo-900">ترقية الخطة</span>
                                        <span className="block text-xs text-indigo-700 mt-1">احصل على المزيد من المقاعد</span>
                                    </Link>
                                )}

                                <Link
                                    href={route('groups.index')}
                                    className="p-4 border-2 border-dashed border-purple-300 rounded-lg text-center hover:border-purple-400 transition-colors bg-purple-50"
                                >
                                    <svg className="mx-auto h-12 w-12 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-purple-900">إدارة المجموعات</span>
                                    <span className="block text-xs text-purple-700 mt-1">إنشاء وتنظيم المجموعات</span>
                                </Link>

                                <Link
                                    href={route('attendance.index')}
                                    className="p-4 border-2 border-dashed border-emerald-300 rounded-lg text-center hover:border-emerald-400 transition-colors bg-emerald-50"
                                >
                                    <svg className="mx-auto h-12 w-12 text-emerald-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-emerald-900">تسجيل الحضور</span>
                                    <span className="block text-xs text-emerald-700 mt-1">تتبع حضور الطلاب</span>
                                </Link>

                                <Link
                                    href={route('payments.index')}
                                    className="p-4 border-2 border-dashed border-amber-300 rounded-lg text-center hover:border-amber-400 transition-colors bg-amber-50"
                                >
                                    <svg className="mx-auto h-12 w-12 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-amber-900">إدارة المدفوعات</span>
                                    <span className="block text-xs text-amber-700 mt-1">تتبع المدفوعات الشهرية</span>
                                </Link>

                                <Link
                                    href={route('dashboard.calendar')}
                                    className="p-4 border-2 border-dashed border-blue-300 rounded-lg text-center hover:border-blue-400 transition-colors bg-blue-50"
                                >
                                    <Calendar className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                                    <span className="text-sm font-medium text-blue-900">تقويم الجلسات</span>
                                    <span className="block text-xs text-blue-700 mt-1">عرض جميع جلساتك</span>
                                </Link>

                                {!isAssistant && (
                                    <Link
                                        href={route('assistants.index')}
                                        className="p-4 border-2 border-dashed border-teal-300 rounded-lg text-center hover:border-teal-400 transition-colors bg-teal-50"
                                    >
                                        <svg className="mx-auto h-12 w-12 text-teal-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-teal-900">إدارة المساعدين</span>
                                        <span className="block text-xs text-teal-700 mt-1">إضافة وإدارة المساعدين</span>
                                    </Link>
                                )}

                                {!isAssistant && (
                                    <button
                                        onClick={() => setShowTermResetModal(true)}
                                        className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center hover:border-red-400 transition-colors bg-red-50"
                                    >
                                        <RotateCcw className="mx-auto h-12 w-12 text-red-500 mb-2" />
                                        <span className="text-sm font-medium text-red-900">بدء فصل جديد</span>
                                        <span className="block text-xs text-red-700 mt-1">إعادة تعيين جميع البيانات</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Today's Sessions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mt-6">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <Clock className="w-5 h-5 text-blue-600 ml-2" />
                                <h3 className="text-lg font-medium text-gray-900">جلسات اليوم</h3>
                            </div>
                            {loadingSessions ? (
                                <div className="text-center py-4">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <p className="text-gray-500 mt-2">جاري تحميل الجلسات...</p>
                                </div>
                            ) : todaySessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="text-gray-500 mt-2">لا توجد جلسات مجدولة لليوم</p>
                                    <p className="text-sm text-gray-400">استمتع بيومك!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {todaySessions.map((session, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                                            <div className="flex items-center">
                                                <div className={`w-3 h-3 rounded-full ml-3 ${session.type === 'special' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900">{session.group_name}</h4>
                                                    <p className="text-xs text-gray-600">{session.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                                </span>
                                                <p className="text-xs text-gray-500">
                                                    {session.type === 'special' ? 'جلسة خاصة' : 'جلسة منتظمة'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                   
                </div>
            </div>
            
            {!isAssistant && (
                <StartNewTermModal 
                    isOpen={showTermResetModal} 
                    onClose={() => setShowTermResetModal(false)} 
                />
            )}
        </AuthenticatedLayout>
    );
}
