import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EditPlan({ plan }) {
    const { data, setData, put, processing, errors } = useForm({
        name: plan.name || '',
        max_students: plan.max_students || '',
        price_per_month: plan.price_per_month || '',
        is_default: plan.is_default || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.plans.update', plan.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit Plan: {plan.name}
                    </h2>
                    <Link
                        href={route('admin.plans.index')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                        Back to Plans
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Plan: ${plan.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Plan Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="e.g., Basic, Standard, Pro"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Students
                                </label>
                                <input
                                    type="number"
                                    id="max_students"
                                    value={data.max_students}
                                    onChange={(e) => setData('max_students', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="e.g., 10, 25, 100"
                                    min="1"
                                    max="10000"
                                    required
                                />
                                {errors.max_students && <p className="mt-1 text-sm text-red-600">{errors.max_students}</p>}
                                <p className="mt-1 text-sm text-gray-500">Maximum number of students allowed for this plan</p>
                            </div>

                            <div>
                                <label htmlFor="price_per_month" className="block text-sm font-medium text-gray-700 mb-2">
                                    Price per Month ($)
                                </label>
                                <input
                                    type="number"
                                    id="price_per_month"
                                    value={data.price_per_month}
                                    onChange={(e) => setData('price_per_month', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="e.g., 9.99, 19.99, 39.99"
                                    min="0"
                                    step="0.01"
                                    max="9999.99"
                                    required
                                />
                                {errors.price_per_month && <p className="mt-1 text-sm text-red-600">{errors.price_per_month}</p>}
                                <p className="mt-1 text-sm text-gray-500">Reference price (no payment processing required)</p>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        checked={data.is_default}
                                        onChange={(e) => setData('is_default', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="is_default" className="font-medium text-gray-700">
                                        Set as Default Plan
                                    </label>
                                    <p className="text-gray-500">New users will be automatically assigned to this plan</p>
                                </div>
                            </div>
                            {errors.is_default && <p className="mt-1 text-sm text-red-600">{errors.is_default}</p>}

                            <div className="border-t pt-6">
                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('admin.plans.index')}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {processing ? 'Updating...' : 'Update Plan'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
