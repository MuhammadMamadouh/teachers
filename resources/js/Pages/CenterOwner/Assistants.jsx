import { Head, useForm, router } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { useState } from 'react';
import { 
    UserPlusIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    PencilIcon,
    TrashIcon,
    ShieldCheckIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Assistants({ assistants, assistantCount, maxAssistants, canAddMore }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAssistant, setSelectedAssistant] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        permissions: [],
    });

    const availablePermissions = [
        { key: 'view_students', label: 'عرض الطلاب', description: 'يمكن للمساعد رؤية قائمة الطلاب' },
        { key: 'manage_attendance', label: 'إدارة الحضور', description: 'يمكن للمساعد تسجيل الحضور والغياب' },
        { key: 'view_groups', label: 'عرض المجموعات', description: 'يمكن للمساعد رؤية المجموعات والحصص' },
        { key: 'view_reports', label: 'عرض التقارير', description: 'يمكن للمساعد الوصول للتقارير الأساسية' },
        { key: 'manage_payments', label: 'إدارة المدفوعات', description: 'يمكن للمساعد تسجيل المدفوعات' },
    ];

    const openAddModal = () => {
        reset();
        setData('permissions', ['view_students']); // Default permission
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const openDeleteModal = (assistant) => {
        setSelectedAssistant(assistant);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setSelectedAssistant(null);
        setIsDeleteModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('assistants.store'), {
            onSuccess: () => {
                closeAddModal();
            },
        });
    };

    const handleDelete = () => {
        if (selectedAssistant) {
            router.delete(route('assistants.destroy', selectedAssistant.id), {
                onSuccess: () => {
                    closeDeleteModal();
                },
            });
        }
    };

    const togglePermission = (permission) => {
        const currentPermissions = data.permissions || [];
        if (currentPermissions.includes(permission)) {
            setData('permissions', currentPermissions.filter(p => p !== permission));
        } else {
            setData('permissions', [...currentPermissions, permission]);
        }
    };

    const stats = [
        {
            name: 'إجمالي المساعدين',
            value: assistantCount,
            max: maxAssistants,
            icon: UserIcon,
            color: 'blue'
        },
        {
            name: 'المساعدين النشطين',
            value: assistants.filter(a => a.is_active).length,
            icon: ShieldCheckIcon,
            color: 'green'
        },
        {
            name: 'المساعدين المتاحين',
            value: maxAssistants - assistantCount,
            icon: UserPlusIcon,
            color: 'purple'
        }
    ];

    return (
        <CenterOwnerLayout>
            <Head title="إدارة المساعدين" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">إدارة المساعدين</h1>
                        <p className="text-gray-600">إضافة وإدارة المساعدين لمساعدتك في إدارة المركز</p>
                    </div>
                    <PrimaryButton
                        onClick={openAddModal}
                        disabled={!canAddMore}
                        className="flex items-center"
                    >
                        <UserPlusIcon className="w-5 h-5 ml-2" />
                        إضافة مساعد
                    </PrimaryButton>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                                <div className="mr-4">
                                    <div className="flex items-center">
                                        <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                                        {stat.max && <span className="text-lg text-gray-500 mr-1">/{stat.max}</span>}
                                    </div>
                                    <p className="text-sm text-gray-600">{stat.name}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Assistants List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">قائمة المساعدين</h2>
                    </div>
                    
                    {assistants.length === 0 ? (
                        <div className="p-12 text-center">
                            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد مساعدين</h3>
                            <p className="mt-1 text-sm text-gray-500">ابدأ بإضافة أول مساعد لك</p>
                            {canAddMore && (
                                <div className="mt-6">
                                    <PrimaryButton onClick={openAddModal}>
                                        <UserPlusIcon className="w-5 h-5 ml-2" />
                                        إضافة مساعد
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {assistants.map((assistant) => (
                                <div key={assistant.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="p-2 rounded-full bg-gray-100">
                                                <UserIcon className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div className="mr-4">
                                                <h3 className="text-lg font-medium text-gray-900">{assistant.name}</h3>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    {assistant.phone && (
                                                        <div className="flex items-center">
                                                            <PhoneIcon className="w-4 h-4 text-gray-400 ml-1" />
                                                            <span className="text-sm text-gray-600">{assistant.phone}</span>
                                                        </div>
                                                    )}
                                                    {assistant.email && (
                                                        <div className="flex items-center">
                                                            <EnvelopeIcon className="w-4 h-4 text-gray-400 ml-1" />
                                                            <span className="text-sm text-gray-600">{assistant.email}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center">
                                                        <ClockIcon className="w-4 h-4 text-gray-400 ml-1" />
                                                        <span className="text-sm text-gray-600">
                                                            منذ {formatDistanceToNow(new Date(assistant.created_at), { 
                                                                addSuffix: false, 
                                                                locale: ar 
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                assistant.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {assistant.is_active ? 'نشط' : 'غير نشط'}
                                            </div>
                                            <SecondaryButton
                                                as="a"
                                                href={route('assistants.edit', assistant.id)}
                                                className="p-2"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </SecondaryButton>
                                            <DangerButton
                                                onClick={() => openDeleteModal(assistant)}
                                                className="p-2"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </DangerButton>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Subscription Info */}
                {!canAddMore && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ShieldCheckIcon className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="mr-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    وصلت للحد الأقصى من المساعدين
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        لإضافة المزيد من المساعدين، يمكنك ترقية خطتك للحصول على المزيد من المساعدين.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <SecondaryButton
                                        as="a"
                                        href={route('subscription.index')}
                                        className="text-sm"
                                    >
                                        ترقية الخطة
                                    </SecondaryButton>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Assistant Modal */}
            <Modal show={isAddModalOpen} onClose={closeAddModal} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">إضافة مساعد جديد</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="الاسم الكامل" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="رقم الهاتف" />
                                <TextInput
                                    id="phone"
                                    name="phone"
                                    value={data.phone}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('phone', e.target.value)}
                                    required
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="البريد الإلكتروني (اختياري)" />
                                <TextInput
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="كلمة المرور" />
                                <TextInput
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="password_confirmation" value="تأكيد كلمة المرور" />
                                <TextInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password_confirmation} className="mt-2" />
                            </div>
                        </div>

                        {/* Permissions */}
                        <div>
                            <InputLabel value="الصلاحيات" />
                            <div className="mt-2 space-y-3">
                                {availablePermissions.map((permission) => (
                                    <div key={permission.key} className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id={permission.key}
                                                name="permissions"
                                                type="checkbox"
                                                checked={data.permissions?.includes(permission.key) || false}
                                                onChange={() => togglePermission(permission.key)}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="mr-3 text-sm">
                                            <label htmlFor={permission.key} className="font-medium text-gray-700 cursor-pointer">
                                                {permission.label}
                                            </label>
                                            <p className="text-gray-500">{permission.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.permissions} className="mt-2" />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <SecondaryButton onClick={closeAddModal}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                إضافة المساعد
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">تأكيد الحذف</h2>
                    <p className="text-gray-600 mb-6">
                        هل أنت متأكد من حذف المساعد &ldquo;{selectedAssistant?.name}&rdquo;؟ 
                        هذا الإجراء لا يمكن التراجع عنه.
                    </p>
                    <div className="flex justify-end space-x-3">
                        <SecondaryButton onClick={closeDeleteModal}>
                            إلغاء
                        </SecondaryButton>
                        <DangerButton onClick={handleDelete}>
                            حذف
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </CenterOwnerLayout>
    );
}
