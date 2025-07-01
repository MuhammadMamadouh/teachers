import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function UserApproval({ unapprovedUsers }) {
    const handleApprove = (userId) => {
        router.post(`/admin/users/${userId}/approve`, {}, {
            preserveScroll: true,
        });
    };

    const handleReject = (userId) => {
        if (confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
            router.delete(`/admin/users/${userId}/reject`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    User Approval Panel
                </h2>
            }
        >
            <Head title="User Approval" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="mb-6 text-lg font-medium text-gray-900">
                                Pending Teacher Approvals ({unapprovedUsers.length})
                            </h3>

                            {unapprovedUsers.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                                        <svg
                                            className="h-8 w-8 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500">No pending approvals!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {unapprovedUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="rounded-lg border border-gray-200 bg-gray-50 p-6"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">
                                                            {user.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Phone:</span> {user.phone}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">City:</span> {user.city}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Subject:</span> {user.subject}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-medium">Registered:</span>{' '}
                                                            {new Date(user.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleApprove(user.id)}
                                                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(user.id)}
                                                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
