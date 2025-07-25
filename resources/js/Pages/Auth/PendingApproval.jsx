
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PendingApproval() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('01018314398');
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <GuestLayout>
            <Head title="بانتظار الموافقة" />

            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100" dir="rtl">
                <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-md">
                    <div className="px-6 py-8">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                                <svg
                                    className="h-8 w-8 text-yellow-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            
                            <h2 className="mb-4 text-2xl font-bold text-gray-900">
                                الحساب بانتظار الموافقة
                            </h2>
                            
                            <p className="mb-6 text-gray-600">
                                حسابك بانتظار الموافقة من قبل المشرفين. 
                            </p>
                            <p className="mb-6 text-gray-600">
                                 يمكنك الدفع عن طريق فودافون كاش أو إنستا باي على الرقم
                                <span className="block my-2">
                                    <div className="flex items-center gap-2 justify-center">
                                        <input
                                            type="text"
                                            value="01018314398"
                                            readOnly
                                            className="border border-gray-300 rounded px-2 py-1 text-center w-40 bg-gray-50 text-gray-800 select-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                            id="payment-number"
                                            onFocus={e => e.target.select()}
                                        />
                                        <button
                                            type="button"
                                            className="text-indigo-600 hover:text-indigo-800 text-sm border border-indigo-200 rounded px-2 py-1 bg-white relative"
                                            onClick={handleCopy}
                                        >
                                            {copied ? 'تم النسخ!' : 'نسخ'}
                                        </button>
                                    </div>
                                </span>
                                 من فضلك أرسل الإيصال الخاص بعملية الدفع للإدارة عبر الواتساب مع ذكر الاسم المستخدم الخاص بك على الموقع.
                                <a
                                    href="https://wa.me/+201270770613"
                                    className="text-indigo-600 hover:underline ml-1"
                                >
                                    01270770613
                                </a>
                            </p>
                            
                            <p className="text-sm text-gray-500">
                                هذا عادة ما يستغرق 1-2 أيام عمل. شكراً لصبرك!
                            </p>
                            
                            <div className="mt-6">
                                <button
                                    type="button"
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-900"
                                    onClick={() => {
                                        router.post(route('logout'));
                                    }}
                                >
                                    تسجيل الخروج
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
