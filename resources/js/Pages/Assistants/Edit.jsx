import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Link } from '@inertiajs/react';

const Edit = ({ auth, assistant }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: assistant.name || '',
        phone: assistant.phone || '',
        email: assistant.email || '',
        password: '',
        password_confirmation: '',
        subject: assistant.subject || '',
        city: assistant.city || '',
        notes: assistant.notes || '',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('assistants.update', assistant.id));
    };
    
    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">تعديل بيانات المساعد</h2>}
        >
            <Head title="تعديل بيانات المساعد" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
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
                                
                                <div className="mb-6">
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

                                <div className="mb-6">
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

                                <div className="mb-6">
                                    <TextInput
                                        id="password"
                                        type="password"
                                        label="كلمة المرور الجديدة (اتركها فارغة للإبقاء على كلمة المرور الحالية)"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        error={errors.password}
                                        placeholder="أدخل كلمة المرور الجديدة"
                                    />
                                </div>

                                <div className="mb-6">
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        label="تأكيد كلمة المرور الجديدة"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        error={errors.password_confirmation}
                                        placeholder="أدخل كلمة المرور الجديدة مرة أخرى"
                                    />
                                </div>

                                <div className="mb-6">
                                    <TextInput
                                        id="subject"
                                        label="المادة التعليمية (اختياري)"
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                        error={errors.subject}
                                        placeholder="مثال: الرياضيات، اللغة الإنجليزية"
                                    />
                                </div>

                                <div className="mb-6">
                                    <TextInput
                                        id="city"
                                        label="المدينة (اختياري)"
                                        value={data.city}
                                        onChange={e => setData('city', e.target.value)}
                                        error={errors.city}
                                        placeholder="أدخل المدينة"
                                    />
                                </div>

                                <div className="mb-6">
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
                                
                                <div className="flex justify-between mt-8">
                                    <Link
                                        href={route('assistants.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        العودة للقائمة
                                    </Link>
                                    
                                    <div className="flex">
                                        <SecondaryButton
                                            type="button"
                                            onClick={() => window.history.back()}
                                            className="ml-2"
                                        >
                                            إلغاء
                                        </SecondaryButton>
                                        <PrimaryButton
                                            type="submit"
                                            disabled={processing}
                                        >
                                            حفظ التغييرات
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Edit;
