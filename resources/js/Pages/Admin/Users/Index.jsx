import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon
} from '@heroicons/react/24/outline';

export default function AdminUsersIndex({ 
    auth, 
    users, 
    center, 
    subscriptionLimits, 
    availableTeachers 
}) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        role: 'assistant',
        teacher_id: '',
        permissions: [],
        is_active: true,
    });

    const availablePermissions = {
        'Student Management': [
            { name: 'view own students', label: 'عرض الطلاب المخصصين' },
            { name: 'view all students', label: 'عرض جميع الطلاب' },
            { name: 'create students', label: 'إنشاء طلاب جدد' },
            { name: 'edit students', label: 'تعديل بيانات الطلاب' },
            { name: 'delete students', label: 'حذف الطلاب' },
        ],
        'Group Management': [
            { name: 'view own groups', label: 'عرض المجموعات المخصصة' },
            { name: 'view all groups', label: 'عرض جميع المجموعات' },
            { name: 'create groups', label: 'إنشاء مجموعات جديدة' },
            { name: 'edit groups', label: 'تعديل بيانات المجموعات' },
            { name: 'delete groups', label: 'حذف المجموعات' },
        ],
        'Attendance Management': [
            { name: 'view own attendance', label: 'عرض الحضور المخصص' },
            { name: 'view all attendance', label: 'عرض جميع سجلات الحضور' },
            { name: 'manage attendance', label: 'إدارة الحضور' },
        ],
        'Reports': [
            { name: 'view own reports', label: 'عرض التقارير المخصصة' },
            { name: 'view all reports', label: 'عرض جميع التقارير' },
        ],
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                reset();
                setShowCreateModal(false);
            }
        });
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        put(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                reset();
                setShowEditModal(false);
                setSelectedUser(null);
            }
        });
    };

    const handleDeleteUser = (user) => {
        if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            subject: user.subject || '',
            role: user.type,
            teacher_id: user.teacher_id || '',
            permissions: user.permissions?.map(p => p.name) || [],
            is_active: user.is_active,
        });
        setShowEditModal(true);
    };

    const handlePermissionsChange = (permissionName, checked) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionName]);
        } else {
            setData('permissions', data.permissions.filter(p => p !== permissionName));
        }
    };

    const getUsageColor = (current, max) => {
        const percentage = (current / max) * 100;
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 75) return 'text-yellow-600';
        return 'text-green-600';
    };

    const canAddUser = (role) => {
        const limits = subscriptionLimits;
        switch (role) {
            case 'teacher':
                return limits.current_teachers < limits.max_teachers;
            case 'assistant':
                return limits.current_assistants < limits.max_assistants;
            default:
                return false;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        إدارة المستخدمين - {center.name}
                    </h2>
                    <PrimaryButton onClick={() => setShowCreateModal(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        إضافة مستخدم جديد
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="إدارة المستخدمين" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Subscription Limits Overview */}
                    <div className="mb-8 bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">حدود الاشتراك</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">المعلمين</span>
                                <span className={`font-medium ${getUsageColor(subscriptionLimits.current_teachers, subscriptionLimits.max_teachers)}`}>
                                    {subscriptionLimits.current_teachers} / {subscriptionLimits.max_teachers}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">المساعدين</span>
                                <span className={`font-medium ${getUsageColor(subscriptionLimits.current_assistants, subscriptionLimits.max_assistants)}`}>
                                    {subscriptionLimits.current_assistants} / {subscriptionLimits.max_assistants}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">المستخدمين</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المستخدم
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الدور
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            المعلم المشرف
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الحالة
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {user.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="mr-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {user.email}
                                                        </div>
                                                        {user.subject && (
                                                            <div className="text-sm text-gray-500">
                                                                {user.subject}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.type === 'teacher' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {user.type === 'teacher' ? 'معلم' : 'مساعد'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.teacher ? user.teacher.name : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    user.is_active 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.is_active ? 'نشط' : 'معطل'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة مستخدم جديد</h3>
                    
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="الاسم" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="رقم الهاتف" />
                            <TextInput
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="الدور" />
                            <select
                                id="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="teacher" disabled={!canAddUser('teacher')}>
                                    معلم {!canAddUser('teacher') && '(تم الوصول للحد الأقصى)'}
                                </option>
                                <option value="assistant" disabled={!canAddUser('assistant')}>
                                    مساعد {!canAddUser('assistant') && '(تم الوصول للحد الأقصى)'}
                                </option>
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>

                        {data.role === 'assistant' && (
                            <div>
                                <InputLabel htmlFor="teacher_id" value="المعلم المشرف" />
                                <select
                                    id="teacher_id"
                                    value={data.teacher_id}
                                    onChange={(e) => setData('teacher_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                >
                                    <option value="">اختر المعلم</option>
                                    {availableTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.teacher_id} className="mt-2" />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="subject" value="المادة" />
                            <TextInput
                                id="subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.subject} className="mt-2" />
                        </div>

                        {/* Permissions */}
                        <div>
                            <InputLabel value="الصلاحيات" />
                            <div className="mt-2 space-y-4">
                                {Object.entries(availablePermissions).map(([category, permissions]) => (
                                    <div key={category} className="border rounded-md p-3">
                                        <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                                        <div className="space-y-2">
                                            {permissions.map((permission) => (
                                                <label key={permission.name} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.permissions.includes(permission.name)}
                                                        onChange={(e) => handlePermissionsChange(permission.name, e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="mr-2 text-sm text-gray-700">{permission.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                            <SecondaryButton onClick={() => setShowCreateModal(false)}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'جاري الحفظ...' : 'حفظ'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Edit User Modal */}
            {selectedUser && (
                <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">تعديل المستخدم</h3>
                        
                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div>
                                <InputLabel htmlFor="edit_name" value="الاسم" />
                                <TextInput
                                    id="edit_name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_email" value="البريد الإلكتروني" />
                                <TextInput
                                    id="edit_email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_phone" value="رقم الهاتف" />
                                <TextInput
                                    id="edit_phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="edit_subject" value="المادة" />
                                <TextInput
                                    id="edit_subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="mr-2 text-sm text-gray-700">مستخدم نشط</span>
                                </label>
                            </div>

                            {/* Permissions */}
                            <div>
                                <InputLabel value="الصلاحيات" />
                                <div className="mt-2 space-y-4">
                                    {Object.entries(availablePermissions).map(([category, permissions]) => (
                                        <div key={category} className="border rounded-md p-3">
                                            <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                                            <div className="space-y-2">
                                                {permissions.map((permission) => (
                                                    <label key={permission.name} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.permissions.includes(permission.name)}
                                                            onChange={(e) => handlePermissionsChange(permission.name, e.target.checked)}
                                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                        />
                                                        <span className="mr-2 text-sm text-gray-700">{permission.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <SecondaryButton onClick={() => setShowEditModal(false)}>
                                    إلغاء
                                </SecondaryButton>
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? 'جاري التحديث...' : 'تحديث'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
