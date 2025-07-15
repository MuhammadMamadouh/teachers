import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ groups, academicYears, lastStudent }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        guardian_phone: '',
        academic_year_id: '',
        group_id: '',
        redirectTo: 'index', // Default redirect option
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter groups based on selected academic year
    const filteredGroups = groups ? groups.filter(group => 
        !data.academic_year_id || group.academic_year_id == data.academic_year_id
    ) : [];

    const submit = (e, redirectTo = 'index') => {
        e.preventDefault();
        setIsSubmitting(true);

        // Set the redirect preference
        setData('redirectTo', redirectTo);
        
        
        const requestData = {
            ...data
        };
        
        post(route('students.store'), requestData, {
            onSuccess: () => {
                if (redirectTo === 'create') {
                    reset('name', 'phone', 'guardian_phone'); // Keep academic_year_id and group_id
                } else {
                    reset();
                }
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        إضافة طالب جديد
                    </h2>
                    <Link
                        href={route('students.index')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 whitespace-nowrap"
                    >
                        العودة للطلاب
                    </Link>
                </div>
            }
        >
            <Head title="إضافة طالب" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            {/* Success message for last added student */}
                            {lastStudent && (
                                <div className="mb-6 rounded-md bg-green-50 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800">
                                                تم إضافة الطالب &quot;<span className="font-bold">{lastStudent}</span>&quot; بنجاح!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={(e) => submit(e, data)} className="space-y-6">
                                {/* Subscription Error */}
                                {errors.subscription && (
                                    <div className="rounded-md bg-red-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-red-800">
                                                    {errors.subscription}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Student Information */}
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="name" value="اسم الطالب" />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="phone" value="هاتف الطالب" />
                                        <TextInput
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            className="mt-1 block w-full"
                                            autoComplete="tel"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="academic_year_id" value="الصف الدراسي" />
                                        <select
                                            id="academic_year_id"
                                            name="academic_year_id"
                                            value={data.academic_year_id}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            onChange={(e) => {
                                                setData('academic_year_id', e.target.value);
                                                // Reset group selection when academic year changes
                                                if (data.group_id) {
                                                    setData('group_id', '');
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">اختر الصف الدراسي</option>
                                            {academicYears && academicYears.map((year) => (
                                                <option key={year.id} value={year.id}>
                                                    {year.name_ar}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.academic_year_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="group_id" value="المجموعة" />
                                        <select
                                            id="group_id"
                                            name="group_id"
                                            value={data.group_id}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            onChange={(e) => setData('group_id', e.target.value)}
                                            disabled={!data.academic_year_id}
                                        >
                                            <option value="">اختر المجموعة (اختياري)</option>
                                            {filteredGroups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name} 
                                                    {group.academic_year && ` - ${group.academic_year.name_ar}`}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.group_id} className="mt-2" />
                                        {!data.academic_year_id && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                يرجى اختيار الصف الدراسي أولاً
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات ولي الأمر</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                                        <div>
                                            <InputLabel htmlFor="guardian_phone" value="هاتف ولي الأمر" />
                                            <TextInput
                                                id="guardian_phone"
                                                type="tel"
                                                name="guardian_phone"
                                                value={data.guardian_phone}
                                                className="mt-1 block w-full"
                                                autoComplete="tel"
                                                onChange={(e) => setData('guardian_phone', e.target.value)}
                                                
                                            />
                                            <InputError message={errors.guardian_phone} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                    <Link
                                        href={route('students.index')}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-center"
                                    >
                                        إلغاء
                                    </Link>
                                    
                                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
                                        
                                        
                                        <PrimaryButton 
                                            type="button"
                                            onClick={(e) => submit(e, 'create')}
                                            disabled={processing || isSubmitting}
                                        >
                                            {processing && data.redirect_to === 'index' ? 'جاري الإضافة...' : 'إضافة والعودة للقائمة'}
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
}
