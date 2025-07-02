import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, RotateCcw } from 'lucide-react';
import StartNewTermModal from '@/Components/StartNewTermModal';

export default function Dashboard({ subscriptionLimits, currentStudentCount, canAddStudents, availablePlans }) {
    const [todaySessions, setTodaySessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(true);
    const [showTermResetModal, setShowTermResetModal] = useState(false);

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

                                <button
                                    onClick={() => setShowTermResetModal(true)}
                                    className="p-4 border-2 border-dashed border-red-300 rounded-lg text-center hover:border-red-400 transition-colors bg-red-50"
                                >
                                    <RotateCcw className="mx-auto h-12 w-12 text-red-500 mb-2" />
                                    <span className="text-sm font-medium text-red-900">بدء فصل جديد</span>
                                    <span className="block text-xs text-red-700 mt-1">إعادة تعيين جميع البيانات</span>
                                </button>
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
                                                    {session.type === 'special' ? 'جلسة خاصة' : 'جلسة عادية'}
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
            
            <StartNewTermModal 
                isOpen={showTermResetModal} 
                onClose={() => setShowTermResetModal(false)} 
            />
        </AuthenticatedLayout>
    );
}
