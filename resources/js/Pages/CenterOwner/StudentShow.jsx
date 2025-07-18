import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    AcademicCapIcon, 
    UserIcon, 
    UserGroupIcon,
    PhoneIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function StudentShow({ student, recentPayments }) {
    const educationLevels = [
        { value: 'elementary', label: 'ابتدائي' },
        { value: 'middle', label: 'متوسط' },
        { value: 'high', label: 'ثانوي' },
    ];

    const getLevelLabel = (level) => {
        return educationLevels.find(l => l.value === level)?.label || level;
    };

    return (
        <CenterOwnerLayout
            header={
                <div className="flex items-center">
                    <button
                        onClick={() => window.history.back()}
                        className="ml-4 p-2 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            تفاصيل الطالب: {student.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            عرض تفاصيل الطالب ومعلومات الدفع
                        </p>
                    </div>
                </div>
            }
        >
            <Head title={`تفاصيل الطالب: ${student.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Student Information */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center mb-6">
                                    <div className="p-3 rounded-full bg-blue-100">
                                        <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="mr-4">
                                        <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>
                                        <p className="text-lg text-gray-600">
                                            {student.level && getLevelLabel(student.level)}
                                            {student.academic_year && ` - ${student.academic_year.name}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <UserIcon className="h-5 w-5 text-gray-400 ml-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">المعلم</p>
                                                <p className="font-medium text-gray-900">
                                                    {student.user?.name || 'غير محدد'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center">
                                            <UserGroupIcon className="h-5 w-5 text-gray-400 ml-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">المجموعة</p>
                                                <p className="font-medium text-gray-900">
                                                    {student.group?.name || 'غير محدد'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {student.phone && (
                                            <div className="flex items-center">
                                                <PhoneIcon className="h-5 w-5 text-gray-400 ml-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">رقم الهاتف</p>
                                                    <p className="font-medium text-gray-900">{student.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {student.guardian_phone && (
                                            <div className="flex items-center">
                                                <PhoneIcon className="h-5 w-5 text-gray-400 ml-3" />
                                                <div>
                                                    <p className="text-sm text-gray-500">رقم هاتف ولي الأمر</p>
                                                    <p className="font-medium text-gray-900">{student.guardian_phone}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 text-gray-400 ml-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">تاريخ التسجيل</p>
                                            <p className="font-medium text-gray-900">
                                                {student.created_at ? new Date(student.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Payments */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">المدفوعات الأخيرة</h3>
                                {recentPayments && recentPayments.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentPayments.map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded-full ${
                                                        payment.is_paid ? 'bg-green-100' : 'bg-red-100'
                                                    }`}>
                                                        <CurrencyDollarIcon className={`h-4 w-4 ${
                                                            payment.is_paid ? 'text-green-600' : 'text-red-600'
                                                        }`} />
                                                    </div>
                                                    <div className="mr-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {payment.formatted_date}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {payment.group?.name || 'غير محدد'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {payment.amount} ر.س
                                                    </p>
                                                    <p className={`text-xs ${
                                                        payment.is_paid ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {payment.is_paid ? 'مدفوع' : 'غير مدفوع'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مدفوعات</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            لم يتم تسجيل أي مدفوعات لهذا الطالب بعد.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistics Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">إحصائيات الطالب</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-blue-100">
                                                <ClockIcon className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <span className="mr-2 text-sm text-gray-600">معدل الحضور</span>
                                        </div>
                                        <span className="text-lg font-semibold text-blue-600">
                                            {student.attendance_rate || 0}%
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-green-100">
                                                <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                                            </div>
                                            <span className="mr-2 text-sm text-gray-600">المدفوعات المسددة</span>
                                        </div>
                                        <span className="text-lg font-semibold text-green-600">
                                            {recentPayments?.filter(p => p.is_paid).length || 0}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-red-100">
                                                <CurrencyDollarIcon className="h-4 w-4 text-red-600" />
                                            </div>
                                            <span className="mr-2 text-sm text-gray-600">المدفوعات المعلقة</span>
                                        </div>
                                        <span className="text-lg font-semibold text-red-600">
                                            {recentPayments?.filter(p => !p.is_paid).length || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">الحالة</h3>
                                <div className="space-y-3">
                                    <div className={`px-3 py-2 rounded-full text-sm font-medium text-center ${
                                        student.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {student.is_active ? 'نشط' : 'غير نشط'}
                                    </div>
                                    
                                    <div className={`px-3 py-2 rounded-full text-sm font-medium text-center ${
                                        student.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {student.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
