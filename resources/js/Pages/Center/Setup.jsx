import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function CenterSetup({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: 'individual',
        address: '',
        phone: '',
        email: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('center.store'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">إعداد المركز</h2>}
        >
            <Head title="إعداد المركز" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900">مرحباً بك في منصة المعلمين</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    يرجى إعداد مركزك التعليمي للبدء في استخدام المنصة
                                </p>
                            </div>

                            <form onSubmit={submit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="name" value="اسم المركز" />
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
                                        <InputLabel htmlFor="type" value="نوع المركز" />
                                        <select
                                            id="type"
                                            name="type"
                                            value={data.type}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            onChange={(e) => setData('type', e.target.value)}
                                            required
                                        >
                                            <option value="individual">معلم فردي</option>
                                            <option value="organization">مؤسسة تعليمية</option>
                                        </select>
                                        <InputError message={errors.type} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="address" value="العنوان" />
                                        <TextInput
                                            id="address"
                                            name="address"
                                            value={data.address}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('address', e.target.value)}
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="phone" value="رقم الهاتف" />
                                        <TextInput
                                            id="phone"
                                            name="phone"
                                            value={data.phone}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="email" value="البريد الإلكتروني" />
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

                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="description" value="الوصف" />
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={data.description}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            rows="3"
                                            onChange={(e) => setData('description', e.target.value)}
                                        />
                                        <InputError message={errors.description} className="mt-2" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <PrimaryButton className="ms-4" disabled={processing}>
                                        إنشاء المركز
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
