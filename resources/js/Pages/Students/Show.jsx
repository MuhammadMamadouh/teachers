import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function Show({ student }) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${student.name}?`)) {
            router.delete(route('students.destroy', student.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Student Details
                    </h2>
                    <Link
                        href={route('students.index')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        Back to Students
                    </Link>
                </div>
            }
        >
            <Head title={student.name} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Student Header */}
                            <div className="border-b border-gray-200 pb-6 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>
                                        <p className="text-sm text-gray-500">Student ID: #{student.id}</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('students.edit', student.id)}
                                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={handleDelete}
                                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Student Information */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Student Information</h4>
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                                <dd className="text-sm text-gray-900">{student.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                                <dd className="text-sm text-gray-900">
                                                    <a 
                                                        href={`tel:${student.phone}`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        {student.phone}
                                                    </a>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Guardian Information</h4>
                                        <dl className="space-y-3">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Guardian Name</dt>
                                                <dd className="text-sm text-gray-900">{student.guardian_name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Guardian Phone</dt>
                                                <dd className="text-sm text-gray-900">
                                                    <a 
                                                        href={`tel:${student.guardian_phone}`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        {student.guardian_phone}
                                                    </a>
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Date */}
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <dl>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Registered</dt>
                                        <dd className="text-sm text-gray-900">
                                            {new Date(student.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Quick Actions */}
                            <div className="border-t border-gray-200 pt-6 mt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <button className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Mark Attendance
                                    </button>
                                    <button className="flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Record Payment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
