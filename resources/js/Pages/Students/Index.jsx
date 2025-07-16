import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { confirmDialog, successAlert, errorAlert } from '@/utils/sweetAlert';
import { useState, useEffect } from 'react';
import { usePrevious } from '@/hooks/usePrevious';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

export default function Index({ students, groups, academicYears, teachers, subscriptionLimits, currentStudentCount, canAddStudents, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedGroup, setSelectedGroup] = useState(filters?.group_id || '');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(filters?.academic_year_id || '');
    const [selectedTeacher, setSelectedTeacher] = useState(filters?.teacher_id || '');
    const [isLoading, setIsLoading] = useState(false);

    const prevSearch = usePrevious(searchTerm);
    const prevGroup = usePrevious(selectedGroup);
    const prevAcademicYear = usePrevious(selectedAcademicYear);
    const prevTeacher = usePrevious(selectedTeacher);

    // Set default values if props are not provided
    const hasSubscriptionLimits = subscriptionLimits && currentStudentCount !== undefined;
    const canAdd = canAddStudents !== undefined ? canAddStudents : true;

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== prevSearch || selectedGroup !== prevGroup || selectedAcademicYear !== prevAcademicYear || selectedTeacher !== prevTeacher) {
                handleFilter();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedGroup, selectedAcademicYear, selectedTeacher]);

    const handleFilter = () => {
        setIsLoading(true);
        const params = {};

        if (searchTerm) {
            params.search = searchTerm;
        }

        if (selectedGroup) {
            params.group_id = selectedGroup;
        }

        if (selectedAcademicYear) {
            params.academic_year_id = selectedAcademicYear;
        }

        if (selectedTeacher) {
            params.teacher_id = selectedTeacher;
        }

        router.get(route('students.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedGroup('');
        setSelectedAcademicYear('');
        setSelectedTeacher('');
        setIsLoading(true);
        router.get(route('students.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const hasActiveFilters = searchTerm || selectedGroup || selectedAcademicYear || selectedTeacher;
    const handleDelete = (student) => {
        confirmDialog({
            title: 'حذف الطالب',
            text: `هل أنت متأكد من حذف ${student.name}؟`,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('students.destroy', student.id), {
                    onSuccess: () => {
                        // Show success message immediately after deletion
                        successAlert({
                            title: 'تم بنجاح',
                            text: `تم حذف الطالب ${student.name} بنجاح!`
                        });
                    },
                    onError: () => {
                        // Handle any deletion errors
                        errorAlert({
                            title: 'خطأ',
                            text: 'حدث خطأ أثناء حذف الطالب. يرجى المحاولة مرة أخرى.'
                        });
                    }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        طلابي
                    </h2>
                    {canAdd && (
                        <Link
                            href={route('students.create')}
                            className="w-full sm:w-auto text-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <span className="sm:hidden">إضافة طالب جديد</span>
                            <span className="hidden sm:inline">إضافة طالب</span>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="الطلاب" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Subscription Status Banner - Only show if subscription data is available */}
                    {hasSubscriptionLimits && (
                        <div className="mb-6 rounded-lg bg-blue-50 p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-800">
                                        <span className="sm:hidden">
                                            {currentStudentCount}/{subscriptionLimits.max_students} طالب
                                        </span>
                                        <span className="hidden sm:inline">
                                            استخدام {currentStudentCount} من {subscriptionLimits.max_students} طالب
                                        </span>
                                        {subscriptionLimits.plan && (
                                            <span className="ml-2 text-blue-600">
                                                (خطة {subscriptionLimits.plan.name})
                                            </span>
                                        )}
                                        {!canAdd && (
                                            <span className="ml-2 font-normal text-blue-600">
                                                <span className="sm:hidden">- وصل للحد الأقصى</span>
                                                <span className="hidden sm:inline">- تم الوصول للحد الأقصى</span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter Section */}
                    <div className="mb-6 rounded-lg bg-white shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                                        placeholder="البحث باسم الطالب أو رقم الهاتف..."
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
                                    {academicYears && Object.entries(academicYears).map(([level, years]) => (
                                        <optgroup key={level} label={level}>
                                            {years.map((year) => (
                                                <option key={year.id} value={year.id}>
                                                    {year.name_ar}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Group Filter */}
                            <div>
                                <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-2">
                                    المجموعة
                                </label>
                                <select
                                    id="group"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                >
                                    <option value="">جميع المجموعات</option>
                                    <option value="unassigned">غير محدد</option>
                                    {groups?.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Teacher Filter */}
                            <div>
                                <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-2">
                                    المعلم
                                </label>
                                <select
                                    id="teacher"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={selectedTeacher}
                                    onChange={(e) => setSelectedTeacher(e.target.value)}
                                >
                                    <option value="">جميع المعلمين</option>
                                    {teachers?.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            <div className="flex items-end">
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        disabled={isLoading}
                                    >
                                        <XMarkIcon className="h-4 w-4 mr-2" />
                                        <span className="sm:hidden">مسح</span>
                                        <span className="hidden sm:inline">مسح الفلاتر</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Summary */}
                        {hasActiveFilters && (
                            <div className="mt-4 flex items-center text-sm text-gray-600">
                                <UsersIcon className="h-4 w-4 mr-1" />
                                <span>
                                    {isLoading ? 'جاري البحث...' : `تم العثور على ${students.length} طالب`}
                                    {searchTerm && (
                                        <span className="font-medium"> للبحث &quot;{searchTerm}&quot;</span>
                                    )}
                                    {selectedGroup && selectedGroup !== 'unassigned' && groups && (
                                        <span className="font-medium">
                                            {' '}في مجموعة &quot;{groups.find(g => g.id.toString() === selectedGroup)?.name}&quot;
                                        </span>
                                    )}
                                    {selectedGroup === 'unassigned' && (
                                        <span className="font-medium"> غير محدد في مجموعة</span>
                                    )}
                                    {selectedTeacher && teachers && (
                                        <span className="font-medium">
                                            {' '}للمعلم &quot;{teachers.find(t => t.id.toString() === selectedTeacher)?.name}&quot;
                                        </span>
                                    )}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="relative overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}
                        <div className="p-4 sm:p-6">
                            {students.length === 0 ? (
                                <div className="text-center py-12">
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
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                ابدأ بإضافة أول طالب.
                                            </p>
                                            {canAdd && (
                                                <div className="mt-6">
                                                    <Link
                                                        href={route('students.create')}
                                                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                    >
                                                        <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                        إضافة طالب
                                                    </Link>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Mobile Card View */}
                                    <div className="sm:hidden space-y-4">
                                        {students.map((student) => (
                                            <div key={student.id} className="bg-gray-50 rounded-lg p-4 border hover:bg-gray-100">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900 text-right">{student.name}</h3>
                                                        <p className="text-sm text-gray-600 text-right">{student.phone}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2 mb-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">الصف الدراسي:</span>
                                                        {student.academic_year ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                {student.academic_year.name_ar}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">غير محدد</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">المجموعة:</span>
                                                        {student.group ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {student.group.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">غير محدد</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">المعلم:</span>
                                                        {student.group?.teacher ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {student.group.teacher.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">غير محدد</span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-500">هاتف ولي الأمر:</span>
                                                        <span className="text-sm text-gray-900">{student.guardian_phone}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-end space-x-2 space-x-reverse pt-3 border-t border-gray-200">
                                                    <Link
                                                        href={route('students.edit', student.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium ml-1"
                                                    >
                                                        تعديل
                                                    </Link>
                                                    <Link
                                                        href={route('students.show', student.id)}
                                                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium  mr-1"
                                                    >
                                                        عرض
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(student)}
                                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                                    >
                                                        حذف
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Desktop Table View */}
                                    <div className="hidden sm:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    الاسم
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    الهاتف
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    الصف الدراسي
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    المجموعة
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    المعلم
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    هاتف ولي الأمر
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    الإجراءات
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {students.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50">
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                        {student.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {student.phone}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {student.academic_year ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                {student.academic_year.name_ar}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">غير محدد</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {student.group ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {student.group.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">غير محدد</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {student.group?.teacher ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                {student.group.teacher.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">غير محدد</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {student.guardian_phone}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('students.edit', student.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                تعديل
                                                            </Link>
                                                            <Link
                                                                href={route('students.show', student.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                عرض
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(student)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                حذف
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
