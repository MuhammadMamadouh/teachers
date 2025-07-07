import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    governorates = [],
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            subject: user.subject || '',
            governorate_id: user.governorate_id || '',
        });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    معلومات الملف الشخصي
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    قم بتحديث معلومات ملفك الشخصي وعنوان بريدك الإلكتروني.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="الاسم" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="البريد الإلكتروني" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="phone" value="الهاتف" />

                    <TextInput
                        id="phone"
                        type="tel"
                        className="mt-1 block w-full"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        autoComplete="tel"
                    />

                    <InputError className="mt-2" message={errors.phone} />
                </div>

                <div>
                    <InputLabel htmlFor="subject" value="المادة" />

                    <TextInput
                        id="subject"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.subject}
                        onChange={(e) => setData('subject', e.target.value)}
                        placeholder="مثال: رياضيات، أدب إنجليزي، فيزياء"
                    />

                    <InputError className="mt-2" message={errors.subject} />
                </div>

                <div>
                    <InputLabel htmlFor="governorate_id" value="المحافظة" />

                    <select
                        id="governorate_id"
                        name="governorate_id"
                        value={data.governorate_id}
                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                        onChange={(e) => setData('governorate_id', e.target.value)}
                    >
                        <option value="">اختر المحافظة</option>
                        {governorates.map((governorate) => (
                            <option key={governorate.id} value={governorate.id}>
                                {governorate.name_ar}
                            </option>
                        ))}
                    </select>

                    <InputError className="mt-2" message={errors.governorate_id} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            بريدك الإلكتروني غير مؤكد.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                اضغط هنا لإعادة إرسال بريد التأكيد.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                تم إرسال رابط تأكيد جديد إلى عنوان بريدك الإلكتروني.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>حفظ</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            تم الحفظ.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
