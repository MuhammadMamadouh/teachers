import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { PlusIcon, TrashIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const Index = ({ auth, assistants, assistantCount, maxAssistants, canAddMore }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAssistant, setSelectedAssistant] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
        subject: '',
        city: '',
        notes: '',
    });
    
    const openAddModal = () => {
        reset();
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
    
    const resendInvitation = (assistantId) => {
        router.post(route('assistants.resend-invitation', assistantId));
    };
    
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">إدارة المساعدين</h2>}
        >
            <Head title="إدارة المساعدين" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold">المساعدين</h3>
                                    <p className="text-sm text-gray-500">
                                        {assistantCount} من {maxAssistants} مساعد
                                    </p>
                                </div>
                                <PrimaryButton
                                    onClick={openAddModal}
                                    disabled={!canAddMore}
                                    className="flex items-center"
                                    title="إضافة مساعد"
                                >
                                    <PlusIcon className="h-5 w-5 ml-1" />
                                    إضافة مساعد
                                </PrimaryButton>
                            </div>

                            {assistantCount === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">لم تقم بإضافة أي مساعدين حتى الآن.</p>
                                    {canAddMore && (
                                        <PrimaryButton
                                            onClick={openAddModal}
                                            className="mt-4"
                                            title="إضافة مساعدك الأول"
                                        >
                                            إضافة مساعدك الأول
                                        </PrimaryButton>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    الاسم
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    رقم الهاتف
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    تاريخ الإضافة
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    الإجراءات
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {assistants.map((assistant) => (
                                                <tr key={assistant.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm font-medium text-gray-900">{assistant.name}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm text-gray-500">{assistant.phone}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="text-sm text-gray-500">
                                                            {formatDistanceToNow(new Date(assistant.created_at), { addSuffix: true, locale: ar })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                                        <Link
                                                            href={route('assistants.edit', assistant.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 ml-4"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                            </svg>
                                                            <span className="sr-only">تعديل</span>
                                                        </Link>
                                                        
                                                        <button
                                                            onClick={() => openDeleteModal(assistant)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-5 w-5 inline" />
                                                            <span className="sr-only">إزالة</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Assistant Modal */}
            <Modal show={isAddModalOpen} onClose={closeAddModal}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4 text-right">إضافة مساعد جديد</h2>
                        
                        <div className="mb-4">
                            <TextInput
                                id="name"
                                label="الاسم"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                error={errors.name}
                                placeholder="أدخل اسم المساعد"
                                required
                            />
                        </div>
                        
                        <div className="mb-4">
                            <TextInput
                                id="phone"
                                type="tel"
                                label="رقم الهاتف"
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                error={errors.phone}
                                placeholder="أدخل رقم هاتف المساعد"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <TextInput
                                id="email"
                                type="email"
                                label="البريد الإلكتروني (اختياري)"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                error={errors.email}
                                placeholder="أدخل البريد الإلكتروني للمساعد"
                            />
                        </div>

                        <div className="mb-4">
                            <TextInput
                                id="password"
                                type="password"
                                label="كلمة المرور"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                error={errors.password}
                                placeholder="أدخل كلمة المرور"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                label="تأكيد كلمة المرور"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                error={errors.password_confirmation}
                                placeholder="أدخل كلمة المرور مرة أخرى"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <TextInput
                                id="subject"
                                label="المادة التعليمية (اختياري)"
                                value={data.subject}
                                onChange={e => setData('subject', e.target.value)}
                                error={errors.subject}
                                placeholder="مثال: الرياضيات، اللغة الإنجليزية"
                            />
                        </div>

                        <div className="mb-4">
                            <TextInput
                                id="city"
                                label="المدينة (اختياري)"
                                value={data.city}
                                onChange={e => setData('city', e.target.value)}
                                error={errors.city}
                                placeholder="أدخل المدينة"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                ملاحظات إضافية (اختياري)
                            </label>
                            <textarea
                                id="notes"
                                value={data.notes}
                                onChange={e => setData('notes', e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-full text-right"
                                rows={3}
                                placeholder="أدخل أي ملاحظات إضافية عن المساعد"
                                dir="rtl"
                            />
                            {errors.notes && <p className="mt-1 text-sm text-red-600 text-right">{errors.notes}</p>}
                        </div>
                        
                        {errors.limit && (
                            <div className="mb-4 text-sm text-red-600 text-right">{errors.limit}</div>
                        )}
                        
                        <div className="flex justify-end mt-6">
                            <SecondaryButton
                                type="button"
                                onClick={closeAddModal}
                                className="ml-2"
                                title="إلغاء"
                            >
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                                title="إضافة المساعد"
                            >
                                إضافة المساعد
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Delete Assistant Modal */}
            <Modal show={isDeleteModalOpen} onClose={closeDeleteModal}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">إزالة المساعد</h2>
                    
                    <p className="mb-4">
                        هل أنت متأكد أنك تريد إزالة {selectedAssistant?.name}؟ 
                        لن يتمكن بعد ذلك من الوصول إلى طلابك ومجموعاتك.
                    </p>
                    
                    <div className="flex justify-end">
                        <SecondaryButton
                            type="button"
                            onClick={closeDeleteModal}
                            className="ml-2"
                            title="إلغاء"
                        >
                            إلغاء
                        </SecondaryButton>
                        <DangerButton
                            type="button"
                            onClick={handleDelete}
                            title="إزالة المساعد"
                        >
                            إزالة المساعد
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
};

export default Index;
