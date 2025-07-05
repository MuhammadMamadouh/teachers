import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EditPlan({ plan }) {
    const { data, setData, put, processing, errors } = useForm({
        name: plan.name || '',
        max_students: plan.max_students || '',
        max_assistants: plan.max_assistants || '',
        duration_days: plan.duration_days || '',
        price: plan.price || '',
        is_trial: plan.is_trial || false,
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
                        تعديل الخطة: {plan.name}
                    </h2>
                    <Link
                        href={route('admin.plans.index')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                    >
                        العودة للخطط
                    </Link>
                </div>
            }
        >
            <Head title={`تعديل الخطة: ${plan.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    اسم الخطة
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="مثال: أساسية، قياسية، متقدمة"
                                    required
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="max_students" className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الأقصى للطلاب
                                </label>
                                <input
                                    type="number"
                                    id="max_students"
                                    value={data.max_students}
                                    onChange={(e) => setData('max_students', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="مثال: 10، 25، 100"
                                    min="1"
                                    max="10000"
                                    required
                                />
                                {errors.max_students && <p className="mt-1 text-sm text-red-600">{errors.max_students}</p>}
                                <p className="mt-1 text-sm text-gray-500">الحد الأقصى لعدد الطلاب المسموح به في هذه الخطة</p>
                            </div>

                            <div>
                                <label htmlFor="max_assistants" className="block text-sm font-medium text-gray-700 mb-2">
                                    الحد الأقصى للمساعدين
                                </label>
                                <input
                                    type="number"
                                    id="max_assistants"
                                    value={data.max_assistants}
                                    onChange={(e) => setData('max_assistants', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="مثال: 0، 1، 3"
                                    min="0"
                                    max="100"
                                    required
                                />
                                {errors.max_assistants && <p className="mt-1 text-sm text-red-600">{errors.max_assistants}</p>}
                                <p className="mt-1 text-sm text-gray-500">الحد الأقصى لعدد المساعدين المسموح به في هذه الخطة</p>
                            </div>

                            <div>
                                <label htmlFor="duration_days" className="block text-sm font-medium text-gray-700 mb-2">
                                    المدة (بالأيام)
                                </label>
                                <select
                                    id="duration_days"
                                    value={data.duration_days}
                                    onChange={(e) => setData('duration_days', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">اختر المدة</option>
                                    <option value="30">30 يوم (شهر واحد)</option>
                                    <option value="90">90 يوم (3 أشهر)</option>
                                    <option value="365">365 يوم (سنة واحدة)</option>
                                </select>
                                {errors.duration_days && <p className="mt-1 text-sm text-red-600">{errors.duration_days}</p>}
                                <p className="mt-1 text-sm text-gray-500">مدة صلاحية الاشتراك</p>
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                    السعر (بالجنيه المصري)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    placeholder="مثال: 100، 250، 500"
                                    min="0"
                                    max="99999"
                                    step="0.01"
                                    required
                                />
                                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                <p className="mt-1 text-sm text-gray-500">السعر بالجنيه المصري (مثال: 100 ج.م، 0 للخطط المجانية)</p>
                            </div>

                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        id="is_trial"
                                        checked={data.is_trial}
                                        onChange={(e) => setData('is_trial', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="is_trial" className="font-medium text-gray-700">
                                        خطة تجريبية
                                    </label>
                                    <p className="text-gray-500">هذه خطة تجريبية (يمكن للمستخدمين الحصول على خطة تجريبية واحدة فقط)</p>
                                </div>
                            </div>
                            {errors.is_trial && <p className="mt-1 text-sm text-red-600">{errors.is_trial}</p>}

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
                                        تعيين كخطة افتراضية
                                    </label>
                                    <p className="text-gray-500">سيتم تخصيص هذه الخطة تلقائياً للمستخدمين الجدد</p>
                                </div>
                            </div>
                            {errors.is_default && <p className="mt-1 text-sm text-red-600">{errors.is_default}</p>}

                            <div className="border-t pt-6">
                                <div className="flex items-center justify-end space-x-3">
                                    <Link
                                        href={route('admin.plans.index')}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        إلغاء
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {processing ? 'جاري التحديث...' : 'تحديث الخطة'}
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
