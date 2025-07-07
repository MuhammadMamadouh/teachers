import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { confirmDialog, questionDialog, successAlert } from '@/utils/sweetAlert';
import { 
    ArrowLeft, 
    Edit, 
    Trash2, 
    UserCheck, 
    UserX, 
    User, 
    Mail, 
    Calendar,
    CreditCard,
    Users,
    BookOpen,
    DollarSign,
    Activity,
    CheckCircle,
    XCircle
} from 'lucide-react';

export default function TeachersShow({ teacher, stats, recentPayments }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = () => {
        confirmDialog({
            title: 'هل أنت متأكد؟',
            text: `سيتم حذف المعلم "${teacher.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.teachers.destroy', teacher.id), {
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                });
            }
        });
    };

    const handleActivate = () => {
        questionDialog({
            title: 'تفعيل المعلم',
            text: `هل تريد تفعيل المعلم "${teacher.name}"؟ سيتم اعتماده وتفعيل اشتراكه.`,
            confirmButtonText: 'نعم، فعّل',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.teachers.activate', teacher.id), {}, {
                    preserveScroll: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                    onSuccess: () => {
                        successAlert({
                            title: 'تم التفعيل بنجاح',
                            text: `تم تفعيل المعلم "${teacher.name}" بنجاح.`,
                        });
                    }
                });
            }
        });
    };

    const handleDeactivate = () => {
        questionDialog({
            title: 'إلغاء تفعيل المعلم',
            text: `هل تريد إلغاء تفعيل المعلم "${teacher.name}"؟ سيتم إلغاء اعتماده وتعطيل اشتراكه.`,
            confirmButtonText: 'نعم، ألغي التفعيل',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.teachers.deactivate', teacher.id), {}, {
                    preserveScroll: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                    onSuccess: () => {
                        successAlert({
                            title: 'تم إلغاء التفعيل بنجاح',
                            text: `تم إلغاء تفعيل المعلم "${teacher.name}" بنجاح.`,
                        });
                    }
                });
            }
        });
    };

    const getStatusBadge = () => {
        if (teacher.is_approved && teacher.active_subscription) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">نشط</span>;
        } else if (teacher.is_approved && !teacher.active_subscription) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">معتمد - لا يوجد اشتراك</span>;
        } else if (!teacher.is_approved) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">في انتظار الاعتماد</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">غير محدد</span>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <Link
                            href={route('admin.teachers.index')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            تفاصيل المعلم: {teacher.name}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {getStatusBadge()}
                        <div className="flex items-center space-x-1 space-x-reverse">
                            <Link
                                href={route('admin.teachers.edit', teacher.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Edit className="w-4 h-4 mr-1" />
                                تعديل
                            </Link>
                            
                            {teacher.is_approved ? (
                                <button
                                    onClick={handleDeactivate}
                                    disabled={loading}
                                    className="inline-flex items-center px-3 py-1.5 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
                                >
                                    <UserX className="w-4 h-4 mr-1" />
                                    إلغاء التفعيل
                                </button>
                            ) : (
                                <button
                                    onClick={handleActivate}
                                    disabled={loading}
                                    className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
                                >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    تفعيل
                                </button>
                            )}
                            
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4 mr-1" />
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`تفاصيل المعلم: ${teacher.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Teacher Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        <User className="inline w-5 h-5 mr-2" />
                                        المعلومات الأساسية
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">الاسم الكامل</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{teacher.name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">البريد الإلكتروني</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:text-blue-900">
                                                    {teacher.email}
                                                </a>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">تاريخ التسجيل</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {new Date(teacher.created_at).toLocaleDateString('ar-SA')}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">آخر نشاط</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {teacher.last_login_at 
                                                    ? new Date(teacher.last_login_at).toLocaleDateString('ar-SA') 
                                                    : 'لم يسجل دخول مطلقاً'
                                                }
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">حالة الاعتماد</dt>
                                            <dd className="mt-1">
                                                {teacher.is_approved ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        معتمد
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        غير معتمد
                                                    </span>
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">نوع المستخدم</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {teacher.type === 'teacher' ? 'معلم' : 'مدير'}
                                            </dd>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subscription Information */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        <CreditCard className="inline w-5 h-5 mr-2" />
                                        معلومات الاشتراك
                                    </h3>
                                    
                                    {teacher.active_subscription ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">الخطة الحالية</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {teacher.active_subscription.plan?.name}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">الحد الأقصى للطلاب</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {teacher.active_subscription.plan?.max_students}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">بداية الاشتراك</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {new Date(teacher.active_subscription.starts_at).toLocaleDateString('ar-SA')}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">انتهاء الاشتراك</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {new Date(teacher.active_subscription.ends_at).toLocaleDateString('ar-SA')}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">حالة الاشتراك</dt>
                                                    <dd className="mt-1">
                                                        {teacher.active_subscription.is_active ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                نشط
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                منتهي الصلاحية
                                                            </span>
                                                        )}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">سعر الخطة</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">
                                                        {teacher.active_subscription.plan?.price} ر.س
                                                    </dd>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد اشتراك نشط</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                لم يقم المعلم بالاشتراك في أي خطة حالياً
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Payments */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        <DollarSign className="inline w-5 h-5 mr-2" />
                                        آخر المدفوعات
                                    </h3>
                                    
                                    {recentPayments && recentPayments.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            التاريخ
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            المبلغ
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            الطالب
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            الشهر
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {recentPayments.map((payment) => (
                                                        <tr key={payment.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {new Date(payment.payment_date).toLocaleDateString('ar-SA')}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {payment.amount} ر.س
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {payment.student?.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {payment.month_year}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مدفوعات</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                لم يتم تسجيل أي مدفوعات لهذا المعلم بعد
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        <Activity className="inline w-5 h-5 mr-2" />
                                        إحصائيات سريعة
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Users className="h-5 w-5 text-blue-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-700">عدد الطلاب</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">
                                                {stats?.total_students || 0}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-700">عدد المجموعات</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">
                                                {stats?.total_groups || 0}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-700">إجمالي المدفوعات</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">
                                                {stats?.total_payments || 0} ر.س
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-700">الجلسات هذا الشهر</span>
                                            </div>
                                            <span className="text-lg font-bold text-gray-900">
                                                {stats?.sessions_this_month || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Status */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        حالة الحساب
                                    </h3>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">معتمد</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                teacher.is_approved 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {teacher.is_approved ? 'نعم' : 'لا'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">الاشتراك نشط</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                teacher.active_subscription?.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {teacher.active_subscription?.is_active ? 'نعم' : 'لا'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700">تم التحقق من البريد</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                teacher.email_verified_at 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {teacher.email_verified_at ? 'نعم' : 'لا'}
                                            </span>
                                        </div>
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
