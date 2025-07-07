import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Governorates({ auth, governorates, statistics }) {
    const getPercentage = (count, total) => {
        if (total === 0) return 0;
        return ((count / total) * 100).toFixed(1);
    };

    const getBadgeClass = (count) => {
        if (count >= 20) return 'bg-green-100 text-green-800';
        if (count >= 10) return 'bg-yellow-100 text-yellow-800';
        if (count >= 5) return 'bg-orange-100 text-orange-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">تقرير المحافظات</h2>}
        >
            <Head title="تقرير المحافظات" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-blue-600">{statistics.total_teachers}</div>
                                <div className="text-gray-600">إجمالي المعلمين</div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-green-600">{statistics.approved_teachers}</div>
                                <div className="text-gray-600">المعلمين المعتمدين</div>
                            </div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <div className="text-3xl font-bold text-yellow-600">{statistics.pending_teachers}</div>
                                <div className="text-gray-600">المعلمين في الانتظار</div>
                            </div>
                        </div>
                    </div>

                    {/* Governorates Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">توزيع المعلمين حسب المحافظات</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المحافظة
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المعلمين المعتمدين
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المعلمين في الانتظار
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                إجمالي المعلمين
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                النسبة المئوية
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                التقييم
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {governorates.map((governorate) => (
                                            <tr key={governorate.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {governorate.name_ar}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {governorate.name_en}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {governorate.approved_teachers_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        {governorate.pending_teachers_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="font-medium">{governorate.total_teachers_count}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {getPercentage(governorate.total_teachers_count, statistics.total_teachers)}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeClass(governorate.approved_teachers_count)}`}>
                                                        {governorate.approved_teachers_count >= 20 ? 'ممتاز' : 
                                                         governorate.approved_teachers_count >= 10 ? 'جيد' :
                                                         governorate.approved_teachers_count >= 5 ? 'متوسط' : 'ضعيف'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Top Governorates */}
                            <div className="mt-8">
                                <h4 className="text-md font-medium text-gray-900 mb-4">أفضل المحافظات</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {governorates
                                        .filter(g => g.approved_teachers_count > 0)
                                        .slice(0, 3)
                                        .map((governorate, index) => (
                                            <div key={governorate.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-lg font-semibold text-gray-900">
                                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {governorate.name_ar}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {governorate.approved_teachers_count} معلم معتمد
                                                        </div>
                                                    </div>
                                                    <div className="text-2xl font-bold text-indigo-600">
                                                        #{index + 1}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
