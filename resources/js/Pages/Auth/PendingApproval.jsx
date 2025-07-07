import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function PendingApproval() {
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
                                سيتم إشعارك عبر البريد الإلكتروني عند تفعيل حسابك.
                            </p>
                            <p className="mb-6 text-gray-600">
                                 من فضلك أرسل الإيصال الخاص بعملية الدفع للإدارة عبر الواتساب مع ذكر الاسم 
                                <a
                                    href="https://wa.me/+201270770613" // Replace with actual WhatsApp number
                                    className="text-indigo-600 hover:underline"
                                >
                                    01270770613
                                </a>
                            </p> 
                            
                            <p className="text-sm text-gray-500">
                                هذا عادة ما يستغرق 1-2 أيام عمل. شكراً لصبرك!
                            </p>
                            
                            <div className="mt-6">
                                <a
                                    href={route('logout')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-900"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const form = document.createElement('form');
                                        form.method = 'POST';
                                        form.action = route('logout');
                                        const token = document.createElement('input');
                                        token.type = 'hidden';
                                        token.name = '_token';
                                        token.value = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                                        form.appendChild(token);
                                        document.body.appendChild(form);
                                        form.submit();
                                    }}
                                >
                                    تسجيل الخروج
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
