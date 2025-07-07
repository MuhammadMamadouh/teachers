import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { confirmDialog, errorAlert, questionDialog, successAlert } from '@/utils/sweetAlert';
import { 
    Users, 
    UserPlus, 
    Search, 
    Filter, 
    MoreVertical, 
    Edit, 
    Trash2, 
    Eye, 
    CheckCircle, 
    XCircle,
    RotateCcw,
    UserCheck,
    UserX
} from 'lucide-react';

export default function TeachersIndex({ teachers, filters, stats }) {
    const [loading, setLoading] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    const handleSearch = () => {
        router.get(route('admin.teachers.index'), {
            search: searchTerm,
            status: statusFilter,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (teacher) => {
        confirmDialog({
            title: 'هل أنت متأكد؟',
            text: `سيتم حذف المعلم "${teacher.name}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('admin.teachers.destroy', teacher.id), {
                    preserveScroll: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                });
            }
        });
    };

    const handleActivate = (teacher) => {
        questionDialog({
            title: 'تفعيل المعلم',
            text: `هل تريد تفعيل المعلم "${teacher.name}"؟ سيتم اعتماده وتفعيل اشتراكه.`,
            confirmButtonText: 'نعم، فعّل',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.teachers.activate', teacher.id), {}, {
                    preserveScroll: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                    onSuccess: () => {
                        successAlert({
                            title: 'تم التفعيل بنجاح',
                            text: `تم تفعيل المعلم "${teacher.name}" بنجاح.`,
                        });
                    }
                });
            }
        });
    };

    const handleDeactivate = (teacher) => {
        questionDialog({
            title: 'إلغاء تفعيل المعلم',
            text: `هل تريد إلغاء تفعيل المعلم "${teacher.name}"؟ سيتم إلغاء اعتماده وتعطيل اشتراكه.`,
            confirmButtonText: 'نعم، ألغي التفعيل',
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.teachers.deactivate', teacher.id), {}, {
                    preserveScroll: true,
                    onStart: () => setLoading(true),
                    onFinish: () => setLoading(false),
                    onSuccess: () => {
                        successAlert({
                            title: 'تم إلغاء التفعيل بنجاح',
                            text: `تم إلغاء تفعيل المعلم "${teacher.name}" بنجاح.`,
                        });
                    }
                });
            }
        });
    };

    const handleBulkAction = (action) => {
        if (selectedTeachers.length === 0) {
            errorAlert({
                title: 'لم يتم تحديد معلمين',
                text: 'يرجى تحديد معلم واحد على الأقل لتنفيذ هذا الإجراء.',
            });
            return;
        }

        let title, text, confirmText;
        switch (action) {
            case 'activate':
                title = 'تفعيل المعلمين المحددين';
                text = `هل تريد تفعيل ${selectedTeachers.length} معلم؟`;
                confirmText = 'نعم، فعّل الجميع';
                break;
            case 'deactivate':
                title = 'إلغاء تفعيل المعلمين المحددين';
                text = `هل تريد إلغاء تفعيل ${selectedTeachers.length} معلم؟`;
                confirmText = 'نعم، ألغي تفعيل الجميع';
                break;
            case 'delete':
                title = 'حذف المعلمين المحددين';
                text = `هل تريد حذف ${selectedTeachers.length} معلم نهائياً؟`;
                confirmText = 'نعم، احذف الجميع';
                break;
        }

        confirmDialog({
            title,
            text,
            confirmButtonText: confirmText,
            cancelButtonText: 'إلغاء',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('admin.teachers.bulk-action'), {
                    action,
                    teacher_ids: selectedTeachers,
                }, {
                    preserveScroll: true,
                    onStart: () => setLoading(true),
                    onFinish: () => {
                        setLoading(false);
                        setSelectedTeachers([]);
                    }
                });
            }
        });
    };

    const toggleSelectAll = () => {
        if (selectedTeachers.length === teachers.data.length) {
            setSelectedTeachers([]);
        } else {
            setSelectedTeachers(teachers.data.map(teacher => teacher.id));
        }
    };

    const toggleSelectTeacher = (teacherId) => {
        setSelectedTeachers(prev => 
            prev.includes(teacherId) 
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const getStatusBadge = (teacher) => {
        if (teacher.is_approved && teacher.subscription_status === 'active') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">نشط</span>;
        } else if (teacher.is_approved && teacher.subscription_status === 'inactive') {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">معتمد - لا يوجد اشتراك</span>;
        } else if (!teacher.is_approved) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">في انتظار الاعتماد</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">غير محدد</span>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        إدارة المعلمين
                    </h2>
                    <Link
                        href={route('admin.teachers.create')}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        إضافة معلم جديد
                    </Link>
                </div>
            }
        >
            <Head title="إدارة المعلمين" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">إجمالي المعلمين</h4>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserCheck className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">معلمين معتمدين</h4>
                                        <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <UserX className="h-8 w-8 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">في انتظار الاعتماد</h4>
                                        <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CheckCircle className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">نشطين</h4>
                                        <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="البحث عن معلم بالاسم أو البريد الإلكتروني..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">جميع الحالات</option>
                                        <option value="approved">معتمدين</option>
                                        <option value="pending">في انتظار الاعتماد</option>
                                        <option value="active">نشطين</option>
                                        <option value="inactive">غير نشطين</option>
                                    </select>
                                    
                                    <select
                                        value={`${sortBy}:${sortOrder}`}
                                        onChange={(e) => {
                                            const [field, order] = e.target.value.split(':');
                                            setSortBy(field);
                                            setSortOrder(order);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="created_at:desc">الأحدث أولاً</option>
                                        <option value="created_at:asc">الأقدم أولاً</option>
                                        <option value="name:asc">الاسم (أ-ي)</option>
                                        <option value="name:desc">الاسم (ي-أ)</option>
                                        <option value="email:asc">البريد الإلكتروني (أ-ي)</option>
                                    </select>
                                    
                                    <button
                                        onClick={handleSearch}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        بحث
                                    </button>
                                </div>
                            </div>

                            {/* Bulk Actions */}
                            {selectedTeachers.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                    <span className="text-sm text-gray-600 py-2">
                                        تم تحديد {selectedTeachers.length} معلم
                                    </span>
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                    >
                                        تفعيل المحدد
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('deactivate')}
                                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                                    >
                                        إلغاء تفعيل المحدد
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                    >
                                        حذف المحدد
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Teachers Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={selectedTeachers.length === teachers.data.length && teachers.data.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المعلم
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الخطة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الطلاب
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المجموعات
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            تاريخ التسجيل
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            إجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {teachers.data.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTeachers.includes(teacher.id)}
                                                    onChange={() => toggleSelectTeacher(teacher.id)}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {teacher.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {teacher.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {teacher.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(teacher)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {teacher.plan_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {teacher.students_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {teacher.groups_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(teacher.created_at).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    <Link
                                                        href={route('admin.teachers.show', teacher.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="عرض التفاصيل"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.teachers.edit', teacher.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="تعديل"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    
                                                    {teacher.is_approved ? (
                                                        <button
                                                            onClick={() => handleDeactivate(teacher)}
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            title="إلغاء التفعيل"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleActivate(teacher)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="تفعيل"
                                                        >
                                                            <UserCheck className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => handleDelete(teacher)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="حذف"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {teachers.links && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex justify-between flex-1 sm:hidden">
                                        {teachers.links.prev && (
                                            <Link
                                                href={teachers.links.prev}
                                                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                السابق
                                            </Link>
                                        )}
                                        {teachers.links.next && (
                                            <Link
                                                href={teachers.links.next}
                                                className="relative mr-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                            >
                                                التالي
                                            </Link>
                                        )}
                                    </div>
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                عرض{' '}
                                                <span className="font-medium">{teachers.from}</span>
                                                {' '}إلى{' '}
                                                <span className="font-medium">{teachers.to}</span>
                                                {' '}من{' '}
                                                <span className="font-medium">{teachers.total}</span>
                                                {' '}نتيجة
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                {teachers.links.map((link, index) => (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                            link.active 
                                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                                                : link.url 
                                                                    ? 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50' 
                                                                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                                        } border`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        disabled={!link.url}
                                                    />
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
