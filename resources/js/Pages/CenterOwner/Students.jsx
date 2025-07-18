import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    AcademicCapIcon, 
    UserIcon, 
    UserGroupIcon,
    CurrencyDollarIcon,
    PlusIcon,
    PhoneIcon,
    CalendarIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

export default function Students({ 
    center, 
    students, 
    teachers, 
    groups, 
    academicYears, 
    educationLevels,
    studentCount, 
    maxStudents, 
    canAddMore, 
    filters 
}) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        guardian_phone: '',
        level: '',
        teacher_id: '',
        group_id: '',
        academic_year_id: '',
        redirect_to: 'index',
    });

    const { 
        data: editData, 
        setData: setEditData, 
        put, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: resetEdit 
    } = useForm({
        name: '',
        phone: '',
        guardian_phone: '',
        level: '',
        teacher_id: '',
        group_id: '',
        academic_year_id: '',
    });

    const { delete: deleteStudent, processing: deleteProcessing } = useForm();

    const { data: filterData, setData: setFilterData, get } = useForm({
        search: filters.search || '',
        group_id: filters.group_id || '',
        academic_year_id: filters.academic_year_id || '',
        teacher_id: filters.teacher_id || '',
        level: filters.level || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('center.owner.students.create'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setEditData({
            name: student.name,
            phone: student.phone || '',
            guardian_phone: student.guardian_phone || '',
            level: student.level || '',
            teacher_id: student.user?.id || '',
            group_id: student.group?.id || '',
            academic_year_id: student.academic_year?.id || '',
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('center.owner.students.update', selectedStudent.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedStudent(null);
                resetEdit();
            },
        });
    };

    const handleDeleteConfirm = (student) => {
        setSelectedStudent(student);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        deleteStudent(route('center.owner.students.delete', selectedStudent.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedStudent(null);
            },
        });
    };

    const handleFilter = (filterType, value) => {
        const newFilters = { ...filterData, [filterType]: value };
        setFilterData(newFilters);
        get(route('center.owner.students'), {
            data: newFilters,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleLevelChange = (newLevel) => {
        const newFilters = { 
            ...filterData, 
            level: newLevel,
            academic_year_id: '' // Reset academic year when level changes
        };
        setFilterData(newFilters);
        get(route('center.owner.students'), {
            data: newFilters,
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        const emptyFilters = {
            search: '',
            group_id: '',
            academic_year_id: '',
            teacher_id: '',
            level: '',
        };
        setFilterData(emptyFilters);
        get(route('center.owner.students'), {
            data: emptyFilters,
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Filter groups based on selected teacher and academic year
    const getFilteredGroups = (teacherId, academicYearId) => {
        if (!teacherId) return [];
        let filteredGroups = groups?.filter(group => group.user_id == teacherId) || [];
        if (academicYearId) {
            filteredGroups = filteredGroups.filter(group => group.academic_year_id == academicYearId);
        }
        return filteredGroups;
    };

    // Filter academic years based on selected level
    const getFilteredAcademicYears = (selectedLevel) => {
        if (!selectedLevel || !academicYears) return [];
        return academicYears[selectedLevel] || [];
    };

    // Ensure students is always an array or has data property for pagination
    const studentsArray = students?.data ? students.data : (Array.isArray(students) ? students : []);
    const hasStudents = studentsArray && studentsArray.length > 0;
    
    const StudentCard = ({ student }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100">
                        <AcademicCapIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mr-3">
                        <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                        <p className="text-sm text-gray-500">
                            {student.level && educationLevels.find(l => l.value === student.level)?.label}
                            {student.academic_year && ` - ${student.academic_year.name_ar}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {student.is_active ? 'نشط' : 'غير نشط'}
                    </div>
                    <div className="flex space-x-1 space-x-reverse">
                        <button
                            onClick={() => handleEdit(student)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="تعديل الطالب"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteConfirm(student)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="حذف الطالب"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
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
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center"
                        >
                            <FunnelIcon className="h-4 w-4 ml-1" />
                            تصفية
                        </button>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                            disabled={!canAddMore}
                        >
                            <PlusIcon className="h-4 w-4 ml-1" />
                            إضافة طالب جديد
                        </button>
                        {!canAddMore && (
                            <div className="text-sm text-red-600 mt-2">
                                لقد وصلت إلى الحد الأقصى للطلاب ({maxStudents})
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="إدارة الطلاب" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Search and Filter Section */}
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <div className="flex flex-col space-y-4">
                            {/* Search Bar */}
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="البحث عن طالب..."
                                        value={filterData.search}
                                        onChange={(e) => handleFilter('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    مسح الفلاتر
                                </button>
                            </div>
                            
                            {/* Filter Dropdowns */}
                            {showFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">المعلم</label>
                                        <select
                                            value={filterData.teacher_id}
                                            onChange={(e) => handleFilter('teacher_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">جميع المعلمين</option>
                                            {teachers?.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">المجموعة</label>
                                        <select
                                            value={filterData.group_id}
                                            onChange={(e) => handleFilter('group_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">جميع المجموعات</option>
                                            <option value="unassigned">بدون مجموعة</option>
                                            {groups?.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                                        <select
                                            value={filterData.level}
                                            onChange={(e) => handleLevelChange(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">جميع المستويات</option>
                                            {educationLevels.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">العام الدراسي</label>
                                        <select
                                            value={filterData.academic_year_id}
                                            onChange={(e) => handleFilter('academic_year_id', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">جميع السنوات الدراسية</option>
                                            {filterData.level && academicYears[filterData.level] ? 
                                                academicYears[filterData.level].map((year) => (
                                                    <option key={year.id} value={year.id}>
                                                        {year.name_ar}
                                                    </option>
                                                )) :
                                                academicYears && Object.entries(academicYears).map(([level, years]) => (
                                                    <optgroup key={level} label={level}>
                                                        {years.map((year) => (
                                                            <option key={year.id} value={year.id}>
                                                                {year.name_ar}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={AcademicCapIcon}
                            title="إجمالي الطلاب"
                            value={studentCount || 0}
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
                            title="الحد الأقصى"
                            value={maxStudents || 'غير محدود'}
                            color="yellow"
                        />
                    </div>

                    {/* Students List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">قائمة الطلاب</h3>
                        </div>
                        <div className="p-6">
                            {hasStudents ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {studentsArray.map((student) => (
                                            <StudentCard key={student.id} student={student} />
                                        ))}
                                    </div>
                                    
                                    {/* Pagination */}
                                    {students.links && (
                                        <div className="mt-6 flex justify-center">
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                {students.links.map((link, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => link.url && get(link.url, {
                                                            data: filterData,
                                                            preserveState: true,
                                                            preserveScroll: true,
                                                        })}
                                                        disabled={!link.url}
                                                        className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                                                            link.active
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                        } ${
                                                            index === 0 ? 'rounded-l-md' : ''
                                                        } ${
                                                            index === students.links.length - 1 ? 'rounded-r-md' : ''
                                                        } ${
                                                            !link.url ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                        }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        ابدأ بإضافة طلاب جدد إلى المركز.
                                    </p>
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => setShowAddModal(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center mx-auto"
                                        >
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

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">إضافة طالب جديد</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم الطالب
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل اسم الطالب"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        المعلم
                                    </label>
                                    <select
                                        id="teacher_id"
                                        value={data.teacher_id}
                                        onChange={(e) => {
                                            setData('teacher_id', e.target.value);
                                            setData('group_id', ''); // Reset group when teacher changes
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.teacher_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">اختر المعلم</option>
                                        {teachers?.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} {teacher.subject ? `(${teacher.subject})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.teacher_id && <p className="mt-1 text-sm text-red-600">{errors.teacher_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                                        المستوى الدراسي *
                                    </label>
                                    <select
                                        id="level"
                                        value={data.level}
                                        onChange={(e) => {
                                            setData('level', e.target.value);
                                            setData('academic_year_id', ''); // Reset academic year when level changes
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.level ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">اختر المستوى الدراسي</option>
                                        {educationLevels.map((level) => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
                                </div>

                                <div>
                                    <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        العام الدراسي *
                                    </label>
                                    <select
                                        id="academic_year_id"
                                        value={data.academic_year_id}
                                        onChange={(e) => setData('academic_year_id', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.academic_year_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                        disabled={!data.level}
                                    >
                                        <option value="">
                                            {data.level ? 'اختر العام الدراسي' : 'اختر المستوى الدراسي أولاً'}
                                        </option>
                                        {data.level && getFilteredAcademicYears(data.level).map((year) => (
                                            <option key={year.id} value={year.id}>
                                                {year.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.academic_year_id && <p className="mt-1 text-sm text-red-600">{errors.academic_year_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        المجموعة (اختياري)
                                    </label>
                                    <select
                                        id="group_id"
                                        value={data.group_id}
                                        onChange={(e) => setData('group_id', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.group_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={!data.teacher_id}
                                    >
                                        <option value="">اختر المجموعة</option>
                                        {getFilteredGroups(data.teacher_id, data.academic_year_id).map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name} ({group.subject})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.group_id && <p className="mt-1 text-sm text-red-600">{errors.group_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        رقم الهاتف
                                    </label>
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.phone ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل رقم الهاتف"
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label htmlFor="guardian_phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        رقم هاتف ولي الأمر
                                    </label>
                                    <input
                                        id="guardian_phone"
                                        type="tel"
                                        value={data.guardian_phone}
                                        onChange={(e) => setData('guardian_phone', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.guardian_phone ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل رقم هاتف ولي الأمر"
                                    />
                                    {errors.guardian_phone && <p className="mt-1 text-sm text-red-600">{errors.guardian_phone}</p>}
                                </div>

                                {errors.error && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <p className="text-sm text-red-600">{errors.error}</p>
                                    </div>
                                )}

                                <div className="flex space-x-3 space-x-reverse pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'جارٍ الحفظ...' : 'إضافة الطالب'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {showEditModal && selectedStudent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">تعديل بيانات الطالب</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedStudent(null);
                                        resetEdit();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="edit_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        اسم الطالب
                                    </label>
                                    <input
                                        id="edit_name"
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل اسم الطالب"
                                        required
                                    />
                                    {editErrors.name && <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_teacher_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        المعلم
                                    </label>
                                    <select
                                        id="edit_teacher_id"
                                        value={editData.teacher_id}
                                        onChange={(e) => {
                                            setEditData('teacher_id', e.target.value);
                                            setEditData('group_id', ''); // Reset group when teacher changes
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.teacher_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">اختر المعلم</option>
                                        {teachers?.map((teacher) => (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name} {teacher.subject ? `(${teacher.subject})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.teacher_id && <p className="mt-1 text-sm text-red-600">{editErrors.teacher_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_level" className="block text-sm font-medium text-gray-700 mb-1">
                                        المستوى الدراسي *
                                    </label>
                                    <select
                                        id="edit_level"
                                        value={editData.level}
                                        onChange={(e) => {
                                            setEditData('level', e.target.value);
                                            setEditData('academic_year_id', ''); // Reset academic year when level changes
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.level ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">اختر المستوى الدراسي</option>
                                        {educationLevels.map((level) => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.level && <p className="mt-1 text-sm text-red-600">{editErrors.level}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_academic_year_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        العام الدراسي *
                                    </label>
                                    <select
                                        id="edit_academic_year_id"
                                        value={editData.academic_year_id}
                                        onChange={(e) => setEditData('academic_year_id', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.academic_year_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                        disabled={!editData.level}
                                    >
                                        <option value="">
                                            {editData.level ? 'اختر العام الدراسي' : 'اختر المستوى الدراسي أولاً'}
                                        </option>
                                        {editData.level && getFilteredAcademicYears(editData.level).map((year) => (
                                            <option key={year.id} value={year.id}>
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.academic_year_id && <p className="mt-1 text-sm text-red-600">{editErrors.academic_year_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_group_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        المجموعة (اختياري)
                                    </label>
                                    <select
                                        id="edit_group_id"
                                        value={editData.group_id}
                                        onChange={(e) => setEditData('group_id', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.group_id ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        disabled={!editData.teacher_id}
                                    >
                                        <option value="">اختر المجموعة</option>
                                        {getFilteredGroups(editData.teacher_id, editData.academic_year_id).map((group) => (
                                            <option key={group.id} value={group.id}>
                                                {group.name} ({group.subject})
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.group_id && <p className="mt-1 text-sm text-red-600">{editErrors.group_id}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        رقم الهاتف
                                    </label>
                                    <input
                                        id="edit_phone"
                                        type="tel"
                                        value={editData.phone}
                                        onChange={(e) => setEditData('phone', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.phone ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل رقم الهاتف"
                                    />
                                    {editErrors.phone && <p className="mt-1 text-sm text-red-600">{editErrors.phone}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_guardian_phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        رقم هاتف ولي الأمر
                                    </label>
                                    <input
                                        id="edit_guardian_phone"
                                        type="tel"
                                        value={editData.guardian_phone}
                                        onChange={(e) => setEditData('guardian_phone', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.guardian_phone ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل رقم هاتف ولي الأمر"
                                    />
                                    {editErrors.guardian_phone && <p className="mt-1 text-sm text-red-600">{editErrors.guardian_phone}</p>}
                                </div>

                                {editErrors.error && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                        <p className="text-sm text-red-600">{editErrors.error}</p>
                                    </div>
                                )}

                                <div className="flex space-x-3 space-x-reverse pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedStudent(null);
                                            resetEdit();
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={editProcessing}
                                        className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {editProcessing ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedStudent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">تأكيد حذف الطالب</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    هل أنت متأكد من حذف الطالب <strong>{selectedStudent.name}</strong>؟
                                </p>
                                <p className="text-sm text-red-600 mt-2">
                                    سيتم حذف جميع السجلات المرتبطة بالطالب (المدفوعات، الحضور، إلخ).
                                </p>
                                <p className="text-sm text-red-600 mt-1">
                                    هذا الإجراء لا يمكن التراجع عنه.
                                </p>
                            </div>
                            <div className="flex space-x-3 space-x-reverse justify-center mt-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedStudent(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleteProcessing}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteProcessing ? 'جارٍ الحذف...' : 'حذف الطالب'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CenterOwnerLayout>
    );
}
