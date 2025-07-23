import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    MagnifyingGlassIcon,
    XMarkIcon,
    UserGroupIcon,
    AcademicCapIcon,
    CalendarIcon,
    CurrencyDollarIcon,
    ClockIcon,
    UserIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function Show({ group, availableStudents, paymentSummary }) {
    const { errors } = usePage().props;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('center.owner.groups.destroy', group.id));
        setShowDeleteModal(false);
    };

    const handleAssignStudents = () => {
        if (selectedStudents.length > 0) {
            router.post(route('center.owner.groups.assign-students', group.id), {
                student_ids: selectedStudents
            }, {
                onSuccess: () => {
                    setShowAssignModal(false);
                    setSelectedStudents([]);
                    setSearchTerm('');
                }
            });
        }
    };

    const confirmRemoveStudent = (student) => {
        setStudentToRemove(student);
        setShowRemoveStudentModal(true);
    };

    const executeRemoveStudent = () => {
        if (studentToRemove) {
            router.delete(route('center.owner.groups.remove-student', [group.id, studentToRemove.id]));
            setShowRemoveStudentModal(false);
            setStudentToRemove(null);
        }
    };

    const handleStudentSelection = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    // Filter available students based on search term
    const filteredStudents = availableStudents?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        (student.guardian_phone && student.guardian_phone.includes(searchTerm))
    ) || [];

    const clearSearch = () => {
        setSearchTerm('');
    };

    const getDayName = (dayOfWeek) => {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[dayOfWeek] || '';
    };

    return (
        <CenterOwnerLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <div>
                        <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800 truncate">
                            تفاصيل المجموعة: {group.name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            عرض تفاصيل المجموعة وإدارة الطلاب
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 md:space-x-2 md:flex-nowrap space-x-reverse">
                        <Link
                            href={route('center.owner.groups.edit', group.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base whitespace-nowrap"
                        >
                            تعديل
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 sm:px-4 rounded text-sm sm:text-base whitespace-nowrap"
                        >
                            حذف
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`تفاصيل المجموعة: ${group.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Group Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-md bg-blue-100">
                                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="mr-4">
                                    <h3 className="text-lg font-medium text-gray-900">الطلاب المسجلين</h3>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {group.assigned_students?.length || 0} / {group.max_students}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-md bg-green-100">
                                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="mr-4">
                                    <h3 className="text-lg font-medium text-gray-900">الدخل الشهري المتوقع</h3>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {group.expected_monthly_income || 0} ج.م
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-md bg-purple-100">
                                    <AcademicCapIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="mr-4">
                                    <h3 className="text-lg font-medium text-gray-900">المستوى التعليمي</h3>
                                    <div className="text-lg font-bold text-gray-900">
                                        {group.level || 'غير محدد'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="p-3 rounded-md bg-yellow-100">
                                    <CalendarIcon className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="mr-4">
                                    <h3 className="text-lg font-medium text-gray-900">حالة المجموعة</h3>
                                    <div className={`text-lg font-bold ${group.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                        {group.is_active ? 'نشطة' : 'غير نشطة'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Group Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المجموعة</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">اسم المجموعة:</span>
                                    <p className="text-sm text-gray-900">{group.name}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">المادة:</span>
                                    <p className="text-sm text-gray-900">{group.subject || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">الوصف:</span>
                                    <p className="text-sm text-gray-900">{group.description || 'لا يوجد وصف'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">الصف الدراسي:</span>
                                    <p className="text-sm text-gray-900">{group.academic_year?.name_ar || 'غير محدد'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">نوع الدفع:</span>
                                    <p className="text-sm text-gray-900">{group.payment_type_label || 'شهري'}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">سعر الطالب:</span>
                                    <p className="text-sm text-gray-900">{group.student_price || 0} ج.م</p>
                                </div>
                            </div>
                        </div>

                        {/* Teacher Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المعلم</h3>
                            {group.teacher ? (
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <UserIcon className="h-5 w-5 text-gray-400 ml-2" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{group.teacher.name}</p>
                                            <p className="text-sm text-gray-500">{group.teacher.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">التخصص:</span>
                                        <p className="text-sm text-gray-900">{group.teacher.subject || 'غير محدد'}</p>
                                    </div>
                                    {group.teacher.phone && (
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">رقم الهاتف:</span>
                                            <p className="text-sm text-gray-900">{group.teacher.phone}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">لا يوجد معلم محدد</p>
                            )}
                        </div>

                        {/* Schedule */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">الجدول الأسبوعي</h3>
                            <div className="space-y-3">
                                {group.schedules && Array.isArray(group.schedules) && group.schedules.length > 0 ? (
                                    group.schedules.map((schedule) => (
                                        <div key={schedule.id} className="flex items-center">
                                            <ClockIcon className="h-4 w-4 text-gray-400 ml-2" />
                                            <div className="text-sm text-gray-900">
                                                <span className="font-medium">{getDayName(schedule.day_of_week)}</span>
                                                <span className="text-gray-500 mr-2">
                                                    {schedule.start_time} - {schedule.end_time}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">لا توجد جلسات مجدولة</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Summary */}
                    {paymentSummary && (
                        <div className="bg-white rounded-lg shadow p-6 mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">ملخص المدفوعات - {paymentSummary.current_month_arabic}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{paymentSummary.total_students}</div>
                                    <div className="text-sm text-gray-500">إجمالي الطلاب</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{paymentSummary.paid_students}</div>
                                    <div className="text-sm text-gray-500">الطلاب المدفوعين</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{paymentSummary.unpaid_students}</div>
                                    <div className="text-sm text-gray-500">الطلاب غير المدفوعين</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{paymentSummary.total_amount} ج.م</div>
                                    <div className="text-sm text-gray-500">إجمالي المبلغ المحصل</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Students List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">الطلاب المسجلين</h3>
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center"
                                >
                                    <PlusIcon className="h-4 w-4 ml-1" />
                                    إضافة طلاب
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {group.assigned_students && group.assigned_students.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {group.assigned_students.map((student) => (
                                        <div key={student.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                                                    <p className="text-sm text-gray-500">الهاتف: {student.phone}</p>
                                                    {student.guardian_phone && (
                                                        <p className="text-sm text-gray-500">هاتف ولي الأمر: {student.guardian_phone}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => confirmRemoveStudent(student)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب مسجلين</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        ابدأ بإضافة طلاب إلى هذه المجموعة.
                                    </p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setShowAssignModal(true)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center mx-auto"
                                        >
                                            <PlusIcon className="h-4 w-4 ml-1" />
                                            إضافة طلاب
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            هل أنت متأكد من أنك تريد حذف المجموعة &quot;{group.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex justify-end space-x-4 space-x-reverse">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Students Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-2xl mx-auto p-6 m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">إضافة طلاب إلى المجموعة</h3>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="البحث بالاسم أو رقم الهاتف..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Students List */}
                        <div className="max-h-96 overflow-y-auto">
                            {filteredStudents.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredStudents.map((student) => (
                                        <div key={student.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                id={`student_${student.id}`}
                                                checked={selectedStudents.includes(student.id)}
                                                onChange={() => handleStudentSelection(student.id)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ml-3"
                                            />
                                            <label htmlFor={`student_${student.id}`} className="flex-1 cursor-pointer">
                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    الهاتف: {student.phone}
                                                    {student.guardian_phone && ` - هاتف ولي الأمر: ${student.guardian_phone}`}
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب متاحين</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        جميع الطلاب المتاحين في نفس الصف الدراسي مُسجلين بالفعل في مجموعات أخرى.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Error Messages */}
                        {errors.assignment && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="text-sm text-red-800">{errors.assignment}</div>
                            </div>
                        )}
                        {errors.capacity && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                <div className="text-sm text-red-800">{errors.capacity}</div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 space-x-reverse mt-6">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleAssignStudents}
                                disabled={selectedStudents.length === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-gray-400"
                            >
                                إضافة الطلاب المحددين ({selectedStudents.length})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Student Modal */}
            {showRemoveStudentModal && studentToRemove && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد إزالة الطالب</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            هل أنت متأكد من أنك تريد إزالة الطالب &quot;{studentToRemove.name}&quot; من المجموعة؟
                        </p>
                        <div className="flex justify-end space-x-4 space-x-reverse">
                            <button
                                onClick={() => setShowRemoveStudentModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={executeRemoveStudent}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                            >
                                إزالة
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CenterOwnerLayout>
    );
}
