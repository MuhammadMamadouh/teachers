import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    MagnifyingGlassIcon,
    XMarkIcon
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
        router.delete(route('groups.destroy', group.id));
        setShowDeleteModal(false);
    };

    const handleAssignStudents = () => {
        if (selectedStudents.length > 0) {
            router.post(route('groups.assign-students', group.id), {
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

    const handleRemoveStudent = (studentId) => {
        router.delete(route('groups.remove-student', [group.id, studentId]));
    };

    const confirmRemoveStudent = (student) => {
        setStudentToRemove(student);
        setShowRemoveStudentModal(true);
    };

    const executeRemoveStudent = () => {
        if (studentToRemove) {
            router.delete(route('groups.remove-student', [group.id, studentToRemove.id]));
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
        (student.guardian_name && student.guardian_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        تفاصيل المجموعة: {group.name}
                    </h2>
                    <div className="flex space-x-2">
                        <Link
                            href={route('groups.edit', group.id)}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                            تعديل
                        </Link>
                        <Link
                            href={route('groups.calendar', group.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                        >
                            التقويم
                        </Link>
                        <Link
                            href={route('attendance.index', { group_id: group.id })}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            تسجيل الحضور
                        </Link>
                        <Link
                            href={route('payments.index', { group_id: group.id })}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded"
                        >
                            إدارة المدفوعات
                        </Link>
                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                        >
                            إضافة طلاب
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            حذف
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`تفاصيل المجموعة: ${group.name}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Group Info */}
                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-2xl font-bold text-gray-900">{group.name}</h3>
                                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                        group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {group.is_active ? 'نشط' : 'غير نشط'}
                                    </span>
                                </div>
                                
                                {group.description && (
                                    <p className="text-gray-600 mb-4">{group.description}</p>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-blue-900">الحد الأقصى للطلاب</h4>
                                                <p className="text-2xl font-bold text-blue-900">{group.max_students}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-green-900">الطلاب المسجلين</h4>
                                                <p className="text-2xl font-bold text-green-900">{group.assigned_students ? group.assigned_students.length : 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Type Card */}
                                    <div className="bg-indigo-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-indigo-900">نوع الدفع</h4>
                                                <p className="text-2xl font-bold text-indigo-900">{group.payment_type_label}</p>
                                                <p className="text-xs text-indigo-700">{group.student_price} ج.م/طالب</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expected Income Card */}
                                    <div className="bg-emerald-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-emerald-900">الدخل المتوقع</h4>
                                                <p className="text-2xl font-bold text-emerald-900">
                                                    {group.payment_type === 'monthly' 
                                                        ? group.expected_monthly_income 
                                                        : group.expected_income_per_session
                                                    } ج.م
                                                </p>
                                                <p className="text-xs text-emerald-700">
                                                    {group.payment_type === 'monthly' ? 'شهرياً' : 'بالجلسة'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-purple-900">أيام الأسبوع</h4>
                                                <p className="text-2xl font-bold text-purple-900">{group.schedules ? group.schedules.length : 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {paymentSummary && (
                                        <div className="bg-amber-50 p-4 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="ml-4">
                                                    <h4 className="text-lg font-medium text-amber-900">المدفوعات</h4>
                                                    <p className="text-2xl font-bold text-amber-900">
                                                        {paymentSummary.paid_students}/{paymentSummary.total_students}
                                                    </p>
                                                    <p className="text-xs text-amber-700">
                                                        {paymentSummary.total_amount || 0} ج.م
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="mb-8">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">الجدول الأسبوعي</h4>
                                {group.schedules && group.schedules.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {group.schedules.map((schedule) => (
                                                <div key={schedule.id} className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <div className="text-center">
                                                        <h5 className="font-medium text-gray-900 mb-2">
                                                            {getDayName(schedule.day_of_week)}
                                                        </h5>
                                                        <div className="text-sm text-gray-600">
                                                            <span className="font-medium">{schedule.start_time}</span>
                                                            <span className="mx-2">-</span>
                                                            <span className="font-medium">{schedule.end_time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">لا يوجد جدول محدد لهذه المجموعة.</p>
                                )}
                            </div>

                            {/* Students List */}
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-4">قائمة الطلاب</h4>
                                {group.assigned_students && group.assigned_students.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {group.assigned_students.map((student) => (
                                                <div key={student.id} className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h5 className="font-medium text-gray-900">{student.name}</h5>
                                                            <p className="text-sm text-gray-600">{student.phone}</p>
                                                            {student.guardian_name && (
                                                                <p className="text-xs text-gray-500">ولي الأمر: {student.guardian_name}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => confirmRemoveStudent(student)}
                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                            title="إزالة من المجموعة"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب</h3>
                                        <p className="mt-1 text-sm text-gray-500">لم يتم تسجيل أي طلاب في هذه المجموعة بعد.</p>
                                    </div>
                                )}
                            </div>

                            {/* Back Button */}
                            <div className="mt-8 flex justify-start">
                                <Link
                                    href={route('groups.index')}
                                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                >
                                    ← العودة إلى قائمة المجموعات
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            هل أنت متأكد من أنك تريد حذف المجموعة "{group.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                        </p>
                        <div className="flex justify-end space-x-4">
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
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-lg mx-auto p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة طلاب للمجموعة</h3>
                        
                        {/* Display validation errors */}
                        {(errors.assignment || errors.capacity) && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {errors.assignment && <p className="text-sm">{errors.assignment}</p>}
                                {errors.capacity && <p className="text-sm">{errors.capacity}</p>}
                            </div>
                        )}
                        
                        {availableStudents && availableStudents.length > 0 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    يتم عرض الطلاب المتاحين فقط (غير المُعينين في أي مجموعة)
                                </p>
                                
                                {/* Search Input */}
                                <div className="relative mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="البحث باسم الطالب، ولي الأمر، أو رقم الهاتف..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {searchTerm && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                            <button
                                                onClick={clearSearch}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <XMarkIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Search Results Summary */}
                                {searchTerm && (
                                    <div className="mb-3 text-sm text-gray-600">
                                        {filteredStudents.length > 0 
                                            ? `تم العثور على ${filteredStudents.length} طالب`
                                            : 'لم يتم العثور على نتائج للبحث'
                                        }
                                    </div>
                                )}
                                
                                <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <label key={student.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => handleStudentSelection(student.id)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-500">{student.phone}</div>
                                                    {student.guardian_name && (
                                                        <div className="text-xs text-gray-400">ولي الأمر: {student.guardian_name}</div>
                                                    )}
                                                </div>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-gray-500">
                                            {searchTerm 
                                                ? 'لا توجد نتائج مطابقة للبحث' 
                                                : 'لا يوجد طلاب متاحين'
                                            }
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowAssignModal(false);
                                            setSearchTerm('');
                                            setSelectedStudents([]);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleAssignStudents}
                                        disabled={selectedStudents.length === 0}
                                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md disabled:opacity-50"
                                    >
                                        إضافة الطلاب المختارين ({selectedStudents.length})
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 mb-6">
                                    لا يوجد طلاب متاحين للإضافة. جميع طلابك مُعينين بالفعل في مجموعات أخرى.
                                </p>
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => setShowAssignModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Remove Student Modal */}
            {showRemoveStudentModal && studentToRemove && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد إزالة الطالب</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            هل أنت متأكد من أنك تريد إزالة الطالب "<span className="font-medium">{studentToRemove.name}</span>" من المجموعة "{group.name}"؟
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setShowRemoveStudentModal(false);
                                    setStudentToRemove(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={executeRemoveStudent}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                            >
                                إزالة الطالب
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
