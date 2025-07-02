import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ groups }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);

    const handleDelete = (group) => {
        setGroupToDelete(group);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (groupToDelete) {
            router.delete(route('groups.destroy', groupToDelete.id));
        }
        setShowDeleteModal(false);
        setGroupToDelete(null);
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
                        إدارة المجموعات
                    </h2>
                    <Link
                        href={route('groups.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        إضافة مجموعة جديدة
                    </Link>
                </div>
            }
        >
            <Head title="إدارة المجموعات" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {groups.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مجموعات</h3>
                                    <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء مجموعة جديدة.</p>
                                    <div className="mt-6">
                                        <Link
                                            href={route('groups.create')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            إضافة مجموعة جديدة
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {groups.map((group) => (
                                        <div key={group.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {group.is_active ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </div>
                                            
                                            {group.description && (
                                                <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                                            )}
                                            
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500">الحد الأقصى للطلاب: {group.max_students}</p>
                                            </div>

                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">الجدول الأسبوعي:</h4>
                                                <div className="space-y-1">
                                                    {group.schedules.map((schedule) => (
                                                        <div key={schedule.id} className="text-xs text-gray-600">
                                                            {getDayName(schedule.day_of_week)}: {schedule.start_time} - {schedule.end_time}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-between space-x-2">
                                                <Link
                                                    href={route('groups.show', group.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    عرض
                                                </Link>
                                                <Link
                                                    href={route('groups.edit', group.id)}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                >
                                                    تعديل
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(group)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                            هل أنت متأكد من أنك تريد حذف المجموعة "{groupToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
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
