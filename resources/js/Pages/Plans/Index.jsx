import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function PlansIndex({ currentPlan, availablePlans, currentStudentCount }) {
    const handleUpgrade = (planId) => {
        if (confirm('Are you sure you want to upgrade your plan? This change will take effect immediately.')) {
            router.post(route('plans.upgrade'), {
                plan_id: planId,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Upgrade Your Plan
                </h2>
            }
        >
            <Head title="Upgrade Plan" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Current Plan */}
                    {currentPlan && (
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">{currentPlan.name} Plan</h4>
                                            <p className="text-gray-600">Up to {currentPlan.max_students} students</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Currently using {currentStudentCount} of {currentPlan.max_students} students
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">${currentPlan.price_per_month}</p>
                                            <p className="text-sm text-gray-500">per month</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Available Upgrades */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Available Upgrades</h3>
                        {availablePlans.length === 0 ? (
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h4 className="mt-4 text-lg font-medium text-gray-900">You're on the highest plan!</h4>
                                    <p className="mt-2 text-gray-600">There are no upgrade options available.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availablePlans.map((plan) => (
                                    <div key={plan.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <div className="text-center">
                                                <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name} Plan</h4>
                                                <div className="mb-4">
                                                    <span className="text-3xl font-bold text-gray-900">${plan.price_per_month}</span>
                                                    <span className="text-gray-500">/month</span>
                                                </div>
                                                <div className="mb-6">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-700">Up to {plan.max_students} students</span>
                                                    </div>
                                                    <div className="flex items-center justify-center">
                                                        <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-700">All current features</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleUpgrade(plan.id)}
                                                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                >
                                                    Upgrade to {plan.name}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Benefits of Upgrading */}
                    <div className="mt-8">
                        <div className="bg-blue-50 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h4 className="text-lg font-medium text-blue-900 mb-4">Why Upgrade?</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">More Students</h5>
                                            <p className="text-sm text-blue-700">Add more students to grow your teaching practice</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">Instant Upgrade</h5>
                                            <p className="text-sm text-blue-700">Changes take effect immediately</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">Same Features</h5>
                                            <p className="text-sm text-blue-700">All current functionality plus more capacity</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <div>
                                            <h5 className="text-sm font-medium text-blue-900">No Payment Required</h5>
                                            <p className="text-sm text-blue-700">Manual approval system, no online payments</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
