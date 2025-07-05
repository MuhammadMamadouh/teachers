import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="التحقق من البريد الإلكتروني" />

            <div className="mb-4 text-sm text-gray-600">
                شكراً لك على التسجيل! قبل البدء، هل يمكنك التحقق من عنوان بريدك الإلكتروني 
                بالنقر على الرابط الذي أرسلناه إليك للتو؟ إذا لم تستلم البريد الإلكتروني، 
                فسنرسل لك رابطاً آخر بكل سرور.
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    تم إرسال رابط تحقق جديد إلى عنوان البريد الإلكتروني الذي قدمته أثناء التسجيل.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        إعادة إرسال بريد التحقق
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        تسجيل الخروج
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
