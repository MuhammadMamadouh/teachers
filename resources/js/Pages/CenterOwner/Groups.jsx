import { Head, Link } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    UserGroupIcon, 
    AcademicCapIcon, 
    UserIcon,
    CalendarIcon,
    ClockIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function Groups({ center, groups }) {
    const GroupCard = ({ group }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="p-2 rounded-md bg-blue-100">
                        <UserGroupIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="mr-3">
                        <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                        <p className="text-sm text-gray-500">{group.subject || 'غير محدد'}</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    group.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {group.is_active ? 'نشطة' : 'غير نشطة'}
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-600">المعلم: {group.teacher?.name || 'غير محدد'}</span>
                </div>
                <div className="flex items-center">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-600">الطلاب: {group.students_count || 0}</span>
                </div>
                <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-600">المستوى: {group.level || 'غير محدد'}</span>
                </div>
                <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <span className="text-sm text-gray-600">الوقت: {group.schedule || 'غير محدد'}</span>
                </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    الأسعار: {group.price || 0} ج.م / الشهر
                </div>
                <div className="text-sm text-gray-500">
                    تاريخ الإنشاء: {group.created_at ? new Date(group.created_at).toLocaleDateString('ar-EG') : 'غير محدد'}
                </div>
            </div>
        </div>
    );

    const StatCard = ({ icon: Icon, title, value, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="mr-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                </div>
            </div>
        </div>
    );

    return (
        <CenterOwnerLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            إدارة المجموعات
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            عرض وإدارة مجموعات مركز {center?.name}
                        </p>
                    </div>
                    <div className="flex space-x-2 space-x-reverse">
                        <Link href={route('center.owner.groups.create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center">
                            <PlusIcon className="h-4 w-4 ml-1" />
                            إضافة مجموعة جديدة
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="إدارة المجموعات" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={UserGroupIcon}
                            title="إجمالي المجموعات"
                            value={groups?.length || 0}
                            color="blue"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            title="المجموعات النشطة"
                            value={groups?.filter(g => g.is_active)?.length || 0}
                            color="green"
                        />
                        <StatCard
                            icon={AcademicCapIcon}
                            title="إجمالي الطلاب"
                            value={groups?.reduce((sum, g) => sum + (g.students_count || 0), 0) || 0}
                            color="purple"
                        />
                        <StatCard
                            icon={CalendarIcon}
                            title="متوسط حجم المجموعة"
                            value={groups?.length > 0 ? Math.round(groups.reduce((sum, g) => sum + (g.students_count || 0), 0) / groups.length) : 0}
                            color="yellow"
                        />
                    </div>

                    {/* Groups List */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">قائمة المجموعات</h3>
                        </div>
                        <div className="p-6">
                            {groups && groups.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {groups.map((group) => (
                                        <GroupCard key={group.id} group={group} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد مجموعات</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        ابدأ بإضافة مجموعات جديدة إلى المركز.
                                    </p>
                                    <div className="mt-6">
                                        <Link href={route('center.owner.groups.create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center mx-auto">
                                            <PlusIcon className="h-4 w-4 ml-1" />
                                            إضافة مجموعة جديدة
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
