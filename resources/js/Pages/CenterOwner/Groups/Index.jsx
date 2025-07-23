import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { usePrevious } from '@/hooks/usePrevious';
import { 
    MagnifyingGlassIcon, 
    XMarkIcon,
    UserGroupIcon,
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    AcademicCapIcon,
    CalendarIcon,
    ClockIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

export default function Index({ groups = [], academicYears = {}, teachers = [], educationLevels = [], filters = {}, centerType = 'individual' }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState(filters?.academic_year_id || '');
    const [selectedTeacher, setSelectedTeacher] = useState(filters?.teacher_id || '');
    const [selectedLevel, setSelectedLevel] = useState(filters?.level || '');
    const [isLoading, setIsLoading] = useState(false);
    
    const prevSearch = usePrevious(searchTerm);
    const prevAcademicYear = usePrevious(selectedAcademicYear);
    const prevTeacher = usePrevious(selectedTeacher);
    const prevLevel = usePrevious(selectedLevel);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== prevSearch || selectedAcademicYear !== prevAcademicYear || selectedTeacher !== prevTeacher || selectedLevel !== prevLevel) {
                handleFilter();
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedAcademicYear, selectedTeacher, selectedLevel]);

    const handleFilter = () => {
        setIsLoading(true);
        const params = {};
        
        if (searchTerm) {
            params.search = searchTerm;
        }

        if (selectedAcademicYear) {
            params.academic_year_id = selectedAcademicYear;
        }

        if (selectedTeacher) {
            params.teacher_id = selectedTeacher;
        }

        if (selectedLevel) {
            params.level = selectedLevel;
        }

        router.get(route('center.owner.groups.index'), params, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedAcademicYear('');
        setSelectedTeacher('');
        setSelectedLevel('');
        setIsLoading(true);
        router.get(route('center.owner.groups.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const hasActiveFilters = searchTerm || selectedAcademicYear || selectedTeacher || selectedLevel;

    const handleDelete = (group) => {
        setGroupToDelete(group);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (groupToDelete) {
            router.delete(route('center.owner.groups.destroy', groupToDelete.id));
        }
        setShowDeleteModal(false);
        setGroupToDelete(null);
    };

    const getDayName = (dayOfWeek) => {
        const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[dayOfWeek] || '';
    };

    // Statistics
    const totalGroups = Array.isArray(groups) ? groups.length : 0;
    const activeGroups = Array.isArray(groups) ? groups.filter(g => g.is_active).length : 0;
    const totalStudents = Array.isArray(groups) ? groups.reduce((sum, g) => sum + (g.students_count || 0), 0) : 0;
    const totalMonthlyIncome = Array.isArray(groups) ? groups.reduce((sum, g) => sum + (g.expected_monthly_income || 0), 0) : 0;

    const StatCard = ({ icon: Icon, title, value, color = 'blue', subtitle = null }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <CenterOwnerLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            إدارة المجموعات
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            عرض وإدارة مجموعات المركز
                        </p>
                    </div>
                    <Link
                        href={route('center.owner.groups.create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                    >
                        <PlusIcon className="h-4 w-4 ml-1" />
                        إضافة مجموعة جديدة
                    </Link>
                </div>
            }
        >
            <Head title="إدارة المجموعات" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={UserGroupIcon}
                            title="إجمالي المجموعات"
                            value={totalGroups}
                            color="blue"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            title="المجموعات النشطة"
                            value={activeGroups}
                            color="green"
                        />
                        <StatCard
                            icon={AcademicCapIcon}
                            title="إجمالي الطلاب"
                            value={totalStudents}
                            color="purple"
                        />
                        <StatCard
                            icon={CurrencyDollarIcon}
                            title="الدخل الشهري المتوقع"
                            value={`${totalMonthlyIncome} ج.م`}
                            color="yellow"
                        />
                    </div>

                    {/* Search and Filter Section */}
                    <div className="mb-6 rounded-lg bg-white shadow-sm border border-gray-200 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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

                            {/* Education Level Filter */}
                            <div>
                                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                                    المستوى التعليمي
                                </label>
                                <select
                                    id="level"
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={selectedLevel}
                                    onChange={(e) => setSelectedLevel(e.target.value)}
                                >
                                    <option value="">جميع المستويات</option>
                                    {educationLevels && Array.isArray(educationLevels) && educationLevels.map((level) => (
                                        <option key={level.value} value={level.value}>
                                            {level.label}
                                        </option>
                                    ))}
                                </select>
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
                                            {Array.isArray(years) && years.map((year) => (
                                                <option key={year.id} value={year.id}>
                                                    {year.name_ar}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>

                            {/* Teacher Filter */}
                            {centerType === 'multi_teacher' && (
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
                                        {teachers && Array.isArray(teachers) && teachers.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} {teacher.subject ? `- ${teacher.subject}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
                                    {isLoading ? 'جاري البحث...' : `تم العثور على ${totalGroups} مجموعة`}
                                    {searchTerm && (
                                        <span className="font-medium"> للبحث &quot;{searchTerm}&quot;</span>
                                    )}
                                    {selectedLevel && (
                                        <span className="font-medium">
                                            {' '}في المستوى &quot;{educationLevels.find(l => l.value === selectedLevel)?.label}&quot;
                                        </span>
                                    )}
                                    {selectedAcademicYear && academicYears && (
                                        <span className="font-medium">
                                            {' '}في الصف الدراسي &quot;{
                                                Object.values(academicYears).flat().find(y => y.id.toString() === selectedAcademicYear)?.name_ar
                                            }&quot;
                                        </span>
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

                    <div className="relative bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}
                        <div className="p-6 text-gray-900">
                            {!Array.isArray(groups) || groups.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                                                    href={route('center.owner.groups.create')}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    <PlusIcon className="h-4 w-4 mr-2" />
                                                    إضافة مجموعة جديدة
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Array.isArray(groups) && groups.map((group) => (
                                        <div key={group.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center">
                                                    <div className="p-2 rounded-md bg-blue-100 ml-3">
                                                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                                                        <p className="text-sm text-gray-500">{group.subject || 'غير محدد'}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    group.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {group.is_active ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </div>
                                            
                                            {group.description && (
                                                <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                                            )}
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                {group.teacher && (
                                                    <div className="flex items-center">
                                                        <UserIcon className="h-4 w-4 text-gray-400 ml-2" />
                                                        <span className="text-sm text-gray-600 truncate">{group.teacher.name}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <AcademicCapIcon className="h-4 w-4 text-gray-400 ml-2" />
                                                    <span className="text-sm text-gray-600">{group.students_count || 0} طالب</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <CalendarIcon className="h-4 w-4 text-gray-400 ml-2" />
                                                    <span className="text-sm text-gray-600">{group.level || 'غير محدد'}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <CurrencyDollarIcon className="h-4 w-4 text-gray-400 ml-2" />
                                                    <span className="text-sm text-gray-600">{group.expected_monthly_income || 0} ج.م</span>
                                                </div>
                                            </div>

                                            {group.academic_year && (
                                                <div className="mb-4">
                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                                        {group.academic_year.name_ar}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-900 mb-2">الجدول الأسبوعي:</h4>
                                                <div className="space-y-1">
                                                    {group.schedules && Array.isArray(group.schedules) && group.schedules.map((schedule) => (
                                                        <div key={schedule.id} className="flex items-center text-xs text-gray-600">
                                                            <ClockIcon className="h-3 w-3 ml-1" />
                                                            {getDayName(schedule.day_of_week)}: {schedule.start_time} - {schedule.end_time}
                                                        </div>
                                                    ))}
                                                    {(!group.schedules || !Array.isArray(group.schedules) || group.schedules.length === 0) && (
                                                        <div className="text-xs text-gray-500 italic">لا توجد جلسات مجدولة</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                                <div className="flex space-x-2 space-x-reverse">
                                                    <Link 
                                                        href={route('center.owner.groups.show', group.id)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                                    >
                                                        <EyeIcon className="h-4 w-4 ml-1" />
                                                        عرض
                                                    </Link>
                                                    <Link
                                                        href={route('center.owner.groups.edit', group.id)}
                                                        className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                                                    >
                                                        <PencilIcon className="h-4 w-4 ml-1" />
                                                        تعديل
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(group)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                                                    >
                                                        <TrashIcon className="h-4 w-4 ml-1" />
                                                        حذف
                                                    </button>
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {group.payment_type_label || 'شهري'}
                                                </div>
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
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
                    <div className="relative bg-white rounded-lg shadow-lg max-w-md mx-auto p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            هل أنت متأكد من أنك تريد حذف المجموعة &quot;{groupToDelete?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
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
        </CenterOwnerLayout>
    );
}
