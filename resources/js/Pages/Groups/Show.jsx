import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Show({ group }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        router.delete(route('groups.destroy', group.id));
        setShowDeleteModal(false);
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
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                                                <p className="text-2xl font-bold text-green-900">{group.students ? group.students.length : 0}</p>
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
                                {group.students && group.students.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {group.students.map((student) => (
                                                <div key={student.id} className="bg-white p-4 rounded-lg shadow-sm border">
                                                    <h5 className="font-medium text-gray-900">{student.name}</h5>
                                                    <p className="text-sm text-gray-600">{student.phone}</p>
                                                    {student.guardian_name && (
                                                        <p className="text-xs text-gray-500">ولي الأمر: {student.guardian_name}</p>
                                                    )}
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
        </AuthenticatedLayout>
    );
}
