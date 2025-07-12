import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePrevious } from '@/hooks/usePrevious';
import { 
    MagnifyingGlassIcon, 
    XMarkIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function Index({ groups, academicYears, filters }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(filters?.academic_year_id || '');
    const [isLoading, setIsLoading] = useState(false);
    
    const prevSearch = usePrevious(searchTerm);
    const prevAcademicYear = usePrevious(selectedAcademicYear);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== prevSearch || selectedAcademicYear !== prevAcademicYear) {
                handleFilter();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedAcademicYear]);

    const handleFilter = () => {
        setIsLoading(true);
        const params = {};
        
        if (searchTerm) {
            params.search = searchTerm;
        }

        if (selectedAcademicYear) {
            params.academic_year_id = selectedAcademicYear;
        }

        router.get(route('groups.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedAcademicYear('');
        setIsLoading(true);
        router.get(route('groups.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const hasActiveFilters = searchTerm || selectedAcademicYear;

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
                    {/* Search and Filter Section */}
                    <div className="mb-6 rounded-lg bg-white shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search Input */}
                            <div className="relative">
                                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                                    البحث
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="search"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="البحث باسم المجموعة..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Academic Year Filter */}
                            <div>
                                <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700 mb-2">
                                    الصف الدراسي
                                </label>
                                <select
                                    id="academic_year"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={selectedAcademicYear}
                                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                                >
                                    <option value="">جميع الصفوف</option>
                                    {academicYears?.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            {year.name_ar}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex items-end">
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        disabled={isLoading}
                                    >
                                        <XMarkIcon className="h-4 w-4 mr-2" />
                                        مسح الفلاتر
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Summary */}
                        {hasActiveFilters && (
                            <div className="mt-4 flex items-center text-sm text-gray-600">
                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                <span>
                                    {isLoading ? 'جاري البحث...' : `تم العثور على ${groups.length} مجموعة`}
                                    {searchTerm && (
                                        <span className="font-medium"> للبحث &quot;{searchTerm}&quot;</span>
                                    )}
                                    {selectedAcademicYear && academicYears && (
                                        <span className="font-medium">
                                            {' '}في الصف الدراسي &quot;{academicYears.find(y => y.id.toString() === selectedAcademicYear)?.name_ar}&quot;
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="relative bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}
                        <div className="p-6 text-gray-900">
                            {groups.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {hasActiveFilters ? (
                                        <>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">لم يتم العثور على نتائج</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                جرب تغيير معايير البحث أو الفلاتر.
                                            </p>
                                            <div className="mt-6">
                                                <button
                                                    onClick={handleClearFilters}
                                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                >
                                                    مسح جميع الفلاتر
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
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
                                        </>
                                    )}
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
                                                {group.academic_year && (
                                                    <p className="text-sm text-gray-500">
                                                        الصف الدراسي: 
                                                        <span className="inline-flex items-center px-2 py-1 ml-2 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                            {group.academic_year.name_ar}
                                                        </span>
                                                    </p>
                                                )}
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
                                                
                                                 <button
                                                    onClick={() => handleDelete(group)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    حذف
                                                </button>
                                                <Link
                                                    href={route('groups.edit', group.id)}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                                >
                                                    تعديل
                                                </Link>
                                               
                                                <Link
                                                    href={route('groups.show', group.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    عرض
                                                </Link>
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
                            هل أنت متأكد من أنك تريد حذف المجموعة &quot;{groupToDelete?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
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
