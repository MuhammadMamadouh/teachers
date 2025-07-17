import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    AcademicCapIcon, 
    UserIcon, 
    UserGroupIcon,
    CurrencyDollarIcon,
    PlusIcon,
    PhoneIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

export default function Students({ center, students }) {
    // Ensure students is always an array
    const studentsArray = Array.isArray(students) ? students : [];
    const StudentCard = ({ student }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100">
                        <AcademicCapIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mr-3">
                        <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">المستوى: {student.level || 'غير محدد'}</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {student.is_active ? 'نشط' : 'غير نشط'}
                </div>
            </div>
            
            <div className="space-y-2 mb-4">
                <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-600">المعلم: {student.teacher?.name || 'غير محدد'}</span>
                </div>
                <div className="flex items-center">
                    <UserGroupIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-600">المجموعة: {student.group?.name || 'غير محدد'}</span>
                </div>
                {student.phone && (
                    <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">{student.phone}</span>
                    </div>
                )}
                <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-600">
                        تاريخ التسجيل: {student.created_at ? new Date(student.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{student.attendance_rate || 0}%</div>
                    <div className="text-xs text-gray-500">معدل الحضور</div>
                </div>
                <div className="text-center">
                    <div className={`text-lg font-semibold ${
                        student.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {student.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                    </div>
                    <div className="text-xs text-gray-500">حالة الدفع</div>
                </div>
            </div>
        </div>
    );

    const StatCard = ({ icon: Icon, title, value, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                </div>
            </div>
        </div>
    );

    return (
        <CenterOwnerLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            إدارة الطلاب
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            عرض وإدارة طلاب مركز {center?.name}
                        </p>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center">
                            <PlusIcon className="h-4 w-4 ml-1" />
                            إضافة طالب جديد
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="إدارة الطلاب" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={AcademicCapIcon}
                            title="إجمالي الطلاب"
                            value={studentsArray?.length || 0}
                            color="blue"
                        />
                        <StatCard
                            icon={AcademicCapIcon}
                            title="الطلاب النشطين"
                            value={studentsArray?.filter(s => s.is_active)?.length || 0}
                            color="green"
                        />
                        <StatCard
                            icon={CurrencyDollarIcon}
                            title="الطلاب المدفوعين"
                            value={studentsArray?.filter(s => s.payment_status === 'paid')?.length || 0}
                            color="purple"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            title="متوسط الحضور"
                            value={studentsArray?.length > 0 ? `${Math.round(studentsArray.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / studentsArray.length)}%` : '0%'}
                            color="yellow"
                        />
                    </div>

                    {/* Students List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">قائمة الطلاب</h3>
                        </div>
                        <div className="p-6">
                            {studentsArray && studentsArray.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {studentsArray.map((student) => (
                                        <StudentCard key={student.id} student={student} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        ابدأ بإضافة طلاب جدد إلى المركز.
                                    </p>
                                    <div className="mt-6">
                                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center mx-auto">
                                            <PlusIcon className="h-4 w-4 ml-1" />
                                            إضافة طالب جديد
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
