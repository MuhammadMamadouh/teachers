import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Expired({ plans, currentSubscription, _hasHadTrial }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    انتهت صلاحية الاشتراك
                </h2>
            }
        >
            <Head title="انتهت صلاحية الاشتراك" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-red-600 mb-4">
                                    انتهت صلاحية اشتراكك
                                </h1>
                                <p className="text-lg text-gray-600 mb-6">
                                    يرجى التواصل مع المدير لتجديد اشتراكك.
                                </p>

                                {currentSubscription && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                        <p className="text-sm text-red-700">
                                            انتهت صلاحية اشتراك {currentSubscription.plan.name} في{' '}
                                            {new Date(currentSubscription.end_date).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Plans Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {plans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                                    >
                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                {plan.name}
                                            </h3>
                                            <p className="text-3xl font-bold text-blue-600 mb-4">
                                                {plan.formatted_price}
                                                <span className="text-sm font-normal text-gray-500">
                                                    /{plan.formatted_duration}
                                                </span>
                                            </p>
                                            
                                            <ul className="space-y-2 mb-6">
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    حتى {plan.max_students} طالب
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    حتى {plan.max_assistants} مساعد
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {plan.formatted_duration} وصول
                                                </li>
                                            </ul>

                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 mb-4">
                                                    تواصل مع المدير للاشتراك في هذه الخطة.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-8">
                                <p className="text-sm text-gray-600">
                                    تحتاج مساعدة؟ تواصل مع الدعم الفني أو المدير.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
