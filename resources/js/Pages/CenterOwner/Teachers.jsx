import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    UserIcon, 
    AcademicCapIcon, 
    CurrencyDollarIcon,
    PlusIcon,
    EnvelopeIcon,
    PhoneIcon,
    XMarkIcon,
    EyeIcon,
    EyeSlashIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

export default function Teachers({ center, teachers }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        password: '',
        password_confirmation: '',
        is_active: true,
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
        email: '',
        phone: '',
        subject: '',
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const { delete: deleteTeacher, processing: deleteProcessing } = useForm();

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('center.owner.teachers.create'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        setEditData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone || '',
            subject: teacher.subject || '',
            password: '',
            password_confirmation: '',
            is_active: teacher.is_active,
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(route('center.owner.teachers.update', selectedTeacher.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedTeacher(null);
                resetEdit();
            },
        });
    };

    const handleDeleteConfirm = (teacher) => {
        setSelectedTeacher(teacher);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        deleteTeacher(route('center.owner.teachers.delete', selectedTeacher.id), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedTeacher(null);
            },
        });
    };
    const TeacherCard = ({ teacher }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100">
                        <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mr-3">
                        <h3 className="text-lg font-medium text-gray-900">{teacher.name}</h3>
                        <p className="text-sm text-gray-500">{teacher.subject || 'غير محدد'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        teacher.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {teacher.is_active ? 'نشط' : 'غير نشط'}
                    </div>
                    <div className="flex space-x-1 space-x-reverse">
                        <button
                            onClick={() => handleEdit(teacher)}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                            title="تعديل المعلم"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteConfirm(teacher)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                            title="حذف المعلم"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="space-y-2 mb-4">
                {teacher.email && (
                    <div className="flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">{teacher.email}</span>
                    </div>
                )}
                {teacher.phone && (
                    <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">{teacher.phone}</span>
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{teacher.students_count || 0}</div>
                    <div className="text-xs text-gray-500">الطلاب</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{teacher.groups_count || 0}</div>
                    <div className="text-xs text-gray-500">المجموعات</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{teacher.total_revenue || 0} ج.م</div>
                    <div className="text-xs text-gray-500">الإيرادات</div>
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
                            إدارة المعلمين
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            عرض وإدارة معلمي مركز {center?.name}
                        </p>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                        >
                            <PlusIcon className="h-4 w-4 ml-1" />
                            إضافة معلم جديد
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="إدارة المعلمين" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={UserIcon}
                            title="إجمالي المعلمين"
                            value={teachers?.length || 0}
                            color="blue"
                        />
                        <StatCard
                            icon={UserIcon}
                            title="المعلمين النشطين"
                            value={teachers?.filter(t => t.is_active)?.length || 0}
                            color="green"
                        />
                        <StatCard
                            icon={AcademicCapIcon}
                            title="إجمالي الطلاب"
                            value={teachers?.reduce((sum, t) => sum + (t.students_count || 0), 0) || 0}
                            color="purple"
                        />
                        <StatCard
                            icon={CurrencyDollarIcon}
                            title="إجمالي الإيرادات"
                            value={`${teachers?.reduce((sum, t) => sum + (t.total_revenue || 0), 0) || 0} ج.م`}
                            color="yellow"
                        />
                    </div>

                    {/* Teachers List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">قائمة المعلمين</h3>
                        </div>
                        <div className="p-6">
                            {teachers && teachers.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {teachers.map((teacher) => (
                                        <TeacherCard key={teacher.id} teacher={teacher} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد معلمين</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        ابدأ بإضافة معلمين جدد إلى المركز.
                                    </p>
                                    <div className="mt-6">
                                        <button 
                                            onClick={() => setShowAddModal(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center mx-auto"
                                        >
                                            <PlusIcon className="h-4 w-4 ml-1" />
                                            إضافة معلم جديد
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Teacher Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">إضافة معلم جديد</h3>
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
                                        الاسم الكامل
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل الاسم الكامل"
                                        required
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل البريد الإلكتروني"
                                        required
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        التخصص
                                    </label>
                                    <input
                                        id="subject"
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.subject ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل التخصص"
                                    />
                                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.password ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="أدخل كلمة المرور"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 left-0 flex items-center pl-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                        تأكيد كلمة المرور
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="أعد إدخال كلمة المرور"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 left-0 flex items-center pl-3"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>}
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
                                        {processing ? 'جارٍ الحفظ...' : 'إضافة المعلم'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Teacher Modal */}
            {showEditModal && selectedTeacher && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">تعديل بيانات المعلم</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedTeacher(null);
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
                                        الاسم الكامل
                                    </label>
                                    <input
                                        id="edit_name"
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل الاسم الكامل"
                                        required
                                    />
                                    {editErrors.name && <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_email" className="block text-sm font-medium text-gray-700 mb-1">
                                        البريد الإلكتروني
                                    </label>
                                    <input
                                        id="edit_email"
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل البريد الإلكتروني"
                                        required
                                    />
                                    {editErrors.email && <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>}
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
                                    <label htmlFor="edit_subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        التخصص
                                    </label>
                                    <input
                                        id="edit_subject"
                                        type="text"
                                        value={editData.subject}
                                        onChange={(e) => setEditData('subject', e.target.value)}
                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                            editErrors.subject ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="أدخل التخصص"
                                    />
                                    {editErrors.subject && <p className="mt-1 text-sm text-red-600">{editErrors.subject}</p>}
                                </div>

                                <div>
                                    <label htmlFor="edit_password" className="block text-sm font-medium text-gray-700 mb-1">
                                        كلمة المرور الجديدة (اختياري)
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="edit_password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={editData.password}
                                            onChange={(e) => setEditData('password', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                editErrors.password ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="اتركه فارغاً للاحتفاظ بكلمة المرور الحالية"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 left-0 flex items-center pl-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {editErrors.password && <p className="mt-1 text-sm text-red-600">{editErrors.password}</p>}
                                </div>

                                {editData.password && (
                                    <div>
                                        <label htmlFor="edit_password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                            تأكيد كلمة المرور
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="edit_password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={editData.password_confirmation}
                                                onChange={(e) => setEditData('password_confirmation', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                    editErrors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="أعد إدخال كلمة المرور"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 left-0 flex items-center pl-3"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {editErrors.password_confirmation && <p className="mt-1 text-sm text-red-600">{editErrors.password_confirmation}</p>}
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center">
                                        <input
                                            id="edit_is_active"
                                            type="checkbox"
                                            checked={editData.is_active}
                                            onChange={(e) => setEditData('is_active', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="edit_is_active" className="mr-2 block text-sm text-gray-900">
                                            حساب نشط
                                        </label>
                                    </div>
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
                                            setSelectedTeacher(null);
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
            {showDeleteModal && selectedTeacher && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <TrashIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-4">تأكيد حذف المعلم</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    هل أنت متأكد من حذف المعلم <strong>{selectedTeacher.name}</strong>؟
                                </p>
                                <p className="text-sm text-red-600 mt-2">
                                    هذا الإجراء لا يمكن التراجع عنه.
                                </p>
                                {(selectedTeacher.students_count > 0 || selectedTeacher.groups_count > 0) && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                                        <p className="text-sm text-yellow-800">
                                            تنبيه: هذا المعلم لديه {selectedTeacher.students_count} طالب و {selectedTeacher.groups_count} مجموعة.
                                            يجب نقلهم إلى معلم آخر أولاً.
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex space-x-3 space-x-reverse justify-center mt-4">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedTeacher(null);
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
                                    {deleteProcessing ? 'جارٍ الحذف...' : 'حذف المعلم'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CenterOwnerLayout>
    );
}
