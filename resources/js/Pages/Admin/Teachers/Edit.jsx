import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Save, User, Lock, CreditCard, CheckCircle, Eye } from 'lucide-react';

export default function TeachersEdit({ teacher, plans }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: teacher.name || '',
        email: teacher.email || '',
        password: '',
        password_confirmation: '',
        is_approved: teacher.is_approved || false,
        plan_id: teacher.active_subscription?.plan_id || '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [updatePassword, setUpdatePassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.teachers.update', teacher.id), {
            onSuccess: () => {
                reset('password', 'password_confirmation');
                setUpdatePassword(false);
            },
        });
    };

    const getStatusBadge = () => {
        if (teacher.is_approved && teacher.active_subscription) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">نشط</span>;
        } else if (teacher.is_approved && !teacher.active_subscription) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">معتمد - لا يوجد اشتراك</span>;
        } else if (!teacher.is_approved) {
            return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">في انتظار الاعتماد</span>;
        }
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">غير محدد</span>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                        <Link
                            href={route('admin.teachers.index')}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            تعديل المعلم: {teacher.name}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                        {getStatusBadge()}
                        <Link
                            href={route('admin.teachers.show', teacher.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            عرض التفاصيل
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`تعديل المعلم: ${teacher.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Teacher Info Summary */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">تاريخ التسجيل:</span>
                                            <div className="text-gray-900">{new Date(teacher.created_at).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">عدد الطلاب:</span>
                                            <div className="text-gray-900">{teacher.students?.length || 0}</div>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">عدد المجموعات:</span>
                                            <div className="text-gray-900">{teacher.groups?.length || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Information */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        <User className="inline w-5 h-5 mr-2" />
                                        المعلومات الأساسية
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                الاسم الكامل
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.name ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="أدخل الاسم الكامل للمعلم"
                                                required
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                البريد الإلكتروني
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.email ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                                placeholder="أدخل البريد الإلكتروني"
                                                required
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        <Lock className="inline w-5 h-5 mr-2" />
                                        كلمة المرور
                                    </h3>
                                    
                                    <div className="mb-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={updatePassword}
                                                onChange={(e) => setUpdatePassword(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="mr-2 text-sm text-gray-700">
                                                تحديث كلمة المرور
                                            </span>
                                        </label>
                                        <p className="text-sm text-gray-500 mt-1">
                                            اتركها فارغة إذا كنت لا تريد تغيير كلمة المرور
                                        </p>
                                    </div>

                                    {updatePassword && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                                    كلمة المرور الجديدة
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                            errors.password ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                        placeholder="أدخل كلمة المرور الجديدة"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute left-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPassword ? 'إخفاء' : 'إظهار'}
                                                    </button>
                                                </div>
                                                {errors.password && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                                    تأكيد كلمة المرور الجديدة
                                                </label>
                                                <input
                                                    id="password_confirmation"
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                    placeholder="أكد كلمة المرور الجديدة"
                                                />
                                                {errors.password_confirmation && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Plan Selection */}
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        <CreditCard className="inline w-5 h-5 mr-2" />
                                        خطة الاشتراك
                                    </h3>
                                    
                                    {teacher.active_subscription && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                                            <p className="text-sm text-blue-800">
                                                <strong>الخطة الحالية:</strong> {teacher.active_subscription.plan?.name} 
                                                - تنتهي في: {new Date(teacher.active_subscription.ends_at).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label htmlFor="plan_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            تغيير الخطة
                                        </label>
                                        <select
                                            id="plan_id"
                                            value={data.plan_id}
                                            onChange={(e) => setData('plan_id', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.plan_id ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        >
                                            <option value="">بدون خطة</option>
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name} - {plan.max_students} طالب - {plan.price} ر.س
                                                </option>
                                            ))}
                                        </select>
                                        {errors.plan_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500">
                                            تغيير الخطة سيؤثر على الاشتراك الحالي للمعلم
                                        </p>
                                    </div>
                                </div>

                                {/* Approval Status */}
                                <div className="pb-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        <CheckCircle className="inline w-5 h-5 mr-2" />
                                        حالة الاعتماد
                                    </h3>
                                    
                                    <div className="flex items-center">
                                        <input
                                            id="is_approved"
                                            type="checkbox"
                                            checked={data.is_approved}
                                            onChange={(e) => setData('is_approved', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_approved" className="mr-2 block text-sm text-gray-900">
                                            المعلم معتمد
                                        </label>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                        إلغاء الاعتماد سيمنع المعلم من الدخول للنظام
                                    </p>
                                    {errors.is_approved && (
                                        <p className="mt-1 text-sm text-red-600">{errors.is_approved}</p>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-end space-x-4 space-x-reverse pt-6 border-t border-gray-200">
                                    <Link
                                        href={route('admin.teachers.index')}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        إلغاء
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                جارٍ الحفظ...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                حفظ التغييرات
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
