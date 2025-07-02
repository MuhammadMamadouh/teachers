import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ subscriptionLimits, currentStudentCount, canAddStudents, availablePlans }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium mb-2">Welcome back!</h3>
                            <p className="text-gray-600">Manage your students and track their attendance.</p>
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100">
                                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">Students</h4>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {currentStudentCount} of {subscriptionLimits.max_students || 0}
                                        </p>                        <p className="text-sm text-gray-500">
                            {subscriptionLimits.has_active_subscription ? 'Active Plan' : 'No Active Plan'}
                        </p>
                        {subscriptionLimits.plan && (
                            <p className="text-xs text-blue-600 font-medium mt-1">
                                {subscriptionLimits.plan.name} Plan
                            </p>
                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={`flex items-center justify-center h-12 w-12 rounded-md ${
                                            subscriptionLimits.has_active_subscription ? 'bg-green-100' : 'bg-red-100'
                                        }`}>
                                            <svg className={`h-6 w-6 ${
                                                subscriptionLimits.has_active_subscription ? 'text-green-600' : 'text-red-600'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">Subscription</h4>                        <p className={`text-sm font-medium ${
                            subscriptionLimits.has_active_subscription ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {subscriptionLimits.has_active_subscription ? 'Active' : 'Inactive'}
                        </p>
                        {subscriptionLimits.plan ? (
                            <p className="text-sm text-gray-500">{subscriptionLimits.plan.name} Plan</p>
                        ) : (
                            <p className="text-sm text-gray-500">No Plan</p>
                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={`flex items-center justify-center h-12 w-12 rounded-md ${
                                            canAddStudents ? 'bg-green-100' : 'bg-yellow-100'
                                        }`}>
                                            <svg className={`h-6 w-6 ${
                                                canAddStudents ? 'text-green-600' : 'text-yellow-600'
                                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h4 className="text-lg font-medium text-gray-900">Add Students</h4>
                                        <p className={`text-sm font-medium ${
                                            canAddStudents ? 'text-green-600' : 'text-yellow-600'
                                        }`}>
                                            {canAddStudents ? 'Available' : 'Limit Reached'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {subscriptionLimits.max_students - currentStudentCount} slots remaining
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Link
                                    href={canAddStudents ? route('students.create') : '#'}
                                    className={`p-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                                        canAddStudents
                                            ? 'border-gray-300 hover:border-gray-400'
                                            : 'border-gray-200 cursor-not-allowed opacity-50'
                                    }`}
                                    disabled={!canAddStudents}
                                >
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Add New Student</span>
                                    <span className="block text-xs text-gray-500 mt-1">
                                        {canAddStudents ? 'Add students to your class' : 'Subscription limit reached'}
                                    </span>
                                </Link>

                                <Link
                                    href={route('students.index')}
                                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors"
                                >
                                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-900">Manage Students</span>
                                    <span className="block text-xs text-gray-500 mt-1">View and edit your students</span>
                                </Link>

                                {availablePlans && availablePlans.length > 0 && (
                                    <Link
                                        href={route('plans.index')}
                                        className="p-4 border-2 border-dashed border-indigo-300 rounded-lg text-center hover:border-indigo-400 transition-colors bg-indigo-50"
                                    >
                                        <svg className="mx-auto h-12 w-12 text-indigo-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        <span className="text-sm font-medium text-indigo-900">Upgrade Plan</span>
                                        <span className="block text-xs text-indigo-700 mt-1">Get more student slots</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
