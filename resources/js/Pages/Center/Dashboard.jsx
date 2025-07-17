import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PlusIcon, UserIcon, AcademicCapIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Pagination from '@/Components/Pagination';

export default function CenterDashboard({ 
    auth, 
    center = {}, 
    statistics = {}, 
    users = [], 
    students = [], 
    groups = [], 
    subscription = null, 
    subscriptionLimits = {}, 
    availablePlans: _availablePlans = [], 
    roles: _roles = [] 
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        role: 'teacher',
        teacher_id: '',
    });

    const handleCreateUser = (e) => {
        e.preventDefault();
        post(route('center.users.create'), {
            onSuccess: () => {
                reset();
                setShowCreateUserModal(false);
            }
        });
    };

    const handleDeleteUser = (user) => {
        if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
            router.delete(route('center.users.delete', user.id));
        }
    };

    const handleStudentPageChange = (page) => {
        router.get(route('center.dashboard'), { page }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
                <div className={`p-3 rounded-md bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>
        </div>
    );

    const TabButton = ({ tab: _tab, label, isActive, onClick }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {label}
        </button>
    );

    const UserTable = ({ users }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            البريد الإلكتروني
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الدور
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الطلاب
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المجموعات
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الإجراءات
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <UserIcon className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <div className="mr-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.phone}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.roles?.includes('admin') ? 'bg-red-100 text-red-800' :
                                    user.roles?.includes('teacher') ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {user.roles?.includes('admin') ? 'مدير' :
                                     user.roles?.includes('teacher') ? 'معلم' : 'مساعد'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.students_count || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {user.groups_count || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {user.is_approved ? 'مفعل' : 'معلق'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600 hover:text-red-900"
                                    disabled={user.id === auth.user.id}
                                >
                                    حذف
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const StudentsTable = ({ students, onPageChange }) => (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                اسم الطالب
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                رقم الهاتف
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                المعلم
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                المجموعة
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                السنة الدراسية
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                تاريخ التسجيل
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.data && students.data.length > 0 ? (
                            students.data.map((student) => (
                                <tr key={student.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.guardian_phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.teacher?.name || 'غير محدد'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.group?.name || 'غير محدد'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {student.academic_year || 'غير محدد'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(student.created_at).toLocaleDateString('ar-SA')}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    لا توجد طلاب
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {students.last_page > 1 && (
                <Pagination
                    currentPage={students.current_page}
                    lastPage={students.last_page}
                    onPageChange={onPageChange}
                    showingFrom={students.from}
                    showingTo={students.to}
                    total={students.total}
                />
            )}
        </div>
    );

    const GroupsTable = ({ groups }) => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            اسم المجموعة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المادة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            المعلم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            عدد الطلاب
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            تاريخ البدء
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            الحالة
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {groups.map((group) => (
                        <tr key={group.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{group.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {group.subject || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {group.teacher?.name || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {group.students_count || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {group.start_date ? new Date(group.start_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    group.start_date ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {group.start_date ? 'نشط' : 'غير نشط'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        لوحة تحكم المركز - {center?.name || 'غير محدد'}
                    </h2>
                    <div className="flex space-x-2">
                        <PrimaryButton onClick={() => setShowCreateUserModal(true)}>
                            <PlusIcon className="h-4 w-4 ml-2" />
                            إضافة مستخدم
                        </PrimaryButton>
                        <SecondaryButton onClick={() => router.visit(route('center.subscription.upgrade'))}>
                            ترقية الخطة
                        </SecondaryButton>
                    </div>
                </div>
            }
        >
            <Head title="لوحة تحكم المركز" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={UserIcon}
                            title="إجمالي المستخدمين"
                            value={statistics?.total_users || 0}
                            subtitle={`${statistics?.recent_registrations || 0} جديد هذا الأسبوع`}
                            color="blue"
                        />
                        <StatCard
                            icon={AcademicCapIcon}
                            title="المعلمين"
                            value={statistics?.teachers_count || 0}
                            subtitle={`من ${subscriptionLimits?.max_teachers || 0} مسموح`}
                            color="green"
                        />
                        <StatCard
                            icon={UserGroupIcon}
                            title="الطلاب"
                            value={statistics?.students_count || 0}
                            subtitle={`من ${subscriptionLimits?.max_students || 0} مسموح`}
                            color="yellow"
                        />
                        <StatCard
                            icon={ChartBarIcon}
                            title="المجموعات"
                            value={statistics?.groups_count || 0}
                            subtitle={`${statistics?.active_groups_count || 0} نشط`}
                            color="purple"
                        />
                    </div>

                    {/* Subscription Status */}
                    <div className="bg-white rounded-lg shadow p-6 mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">حالة الاشتراك</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">الخطة الحالية</p>
                                <p className="text-lg font-semibold">{subscription?.plan?.name || 'غير محدد'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">نوع الخطة</p>
                                <p className="text-lg font-semibold">
                                    {subscriptionLimits?.plan_type === 'individual' ? 'فردي' : 'متعدد المعلمين'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">الاستخدام</p>
                                <p className="text-lg font-semibold">
                                    {subscriptionLimits?.current_students || 0}/{subscriptionLimits?.max_students || 0} طالب
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6 py-4">
                                <TabButton
                                    tab="overview"
                                    label="نظرة عامة"
                                    isActive={activeTab === 'overview'}
                                    onClick={() => setActiveTab('overview')}
                                />
                                <TabButton
                                    tab="users"
                                    label="المستخدمين"
                                    isActive={activeTab === 'users'}
                                    onClick={() => setActiveTab('users')}
                                />
                                <TabButton
                                    tab="students"
                                    label="الطلاب"
                                    isActive={activeTab === 'students'}
                                    onClick={() => setActiveTab('students')}
                                />
                                <TabButton
                                    tab="groups"
                                    label="المجموعات"
                                    isActive={activeTab === 'groups'}
                                    onClick={() => setActiveTab('groups')}
                                />
                            </nav>
                        </div>

                        <div className="p-6">
                            {activeTab === 'overview' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">نظرة عامة على المركز</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">معلومات المركز</h4>
                                            <p><strong>النوع:</strong> {center?.type === 'individual' ? 'فردي' : 'مؤسسة'}</p>
                                            <p><strong>العنوان:</strong> {center?.address || 'غير محدد'}</p>
                                            <p><strong>الهاتف:</strong> {center?.phone || 'غير محدد'}</p>
                                            <p><strong>البريد الإلكتروني:</strong> {center?.email || 'غير محدد'}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">الأداء الشهري</h4>
                                            <p><strong>النمو:</strong> {statistics?.monthly_growth || 0}%</p>
                                            <p><strong>التسجيلات الجديدة:</strong> {statistics?.recent_registrations || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">المستخدمين</h3>
                                        <PrimaryButton onClick={() => setShowCreateUserModal(true)}>
                                            <PlusIcon className="h-4 w-4 ml-2" />
                                            إضافة مستخدم
                                        </PrimaryButton>
                                    </div>
                                    <UserTable users={users} />
                                </div>
                            )}

                            {activeTab === 'students' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">الطلاب</h3>
                                    <StudentsTable students={students} onPageChange={handleStudentPageChange} />
                                </div>
                            )}

                            {activeTab === 'groups' && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">المجموعات</h3>
                                    <GroupsTable groups={groups} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            <Modal show={showCreateUserModal} onClose={() => setShowCreateUserModal(false)}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">إضافة مستخدم جديد</h3>
                    <form onSubmit={handleCreateUser}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="الاسم" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="رقم الهاتف" />
                                <TextInput
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="role" value="الدور" />
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="teacher">معلم</option>
                                    <option value="assistant">مساعد</option>
                                    <option value="admin">مدير</option>
                                </select>
                                <InputError message={errors.role} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="subject" value="المادة" />
                                <TextInput
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex justify-end mt-6 space-x-2">
                            <SecondaryButton onClick={() => setShowCreateUserModal(false)}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                إنشاء المستخدم
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
