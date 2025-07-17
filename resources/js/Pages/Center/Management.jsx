import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    UserIcon, 
    AcademicCapIcon, 
    UserGroupIcon, 
    ChartBarIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Pagination from '@/Components/Pagination';

export default function CenterManagement({ 
    center = {}, 
    statistics = {}, 
    users = [], 
    teachers = [],
    students = [], 
    groups = [], 
    subscription = null, 
    subscriptionLimits = {}, 
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showCreateUserModal, setShowCreateUserModal] = useState(false);
    const [showCreateStudentModal, setShowCreateStudentModal] = useState(false);
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [showInviteUserModal, setShowInviteUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editingGroup, setEditingGroup] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [teacherGroups, setTeacherGroups] = useState([]);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        role: 'teacher',
        teacher_id: '',
        group_id: '',
        level: '',
        max_students: '',
        student_price: '',
        payment_type: 'monthly',
    });

    // Load teacher groups when teacher is selected
    useEffect(() => {
        if (selectedTeacher && (activeTab === 'students' || activeTab === 'groups')) {
            fetchTeacherGroups(selectedTeacher);
        }
    }, [selectedTeacher, activeTab]);

    const fetchTeacherGroups = async (teacherId) => {
        try {
            const response = await fetch(route('center.manage.api.teacher-groups', { teacher_id: teacherId }));
            if (response.ok) {
                const groups = await response.json();
                setTeacherGroups(groups);
            }
        } catch {
            // Handle error silently or show user-friendly message
        }
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        post(route('center.manage.users.create'), {
            onSuccess: () => {
                reset();
                setShowCreateUserModal(false);
            }
        });
    };

    const handleInviteUser = (e) => {
        e.preventDefault();
        post(route('center.manage.users.invite'), {
            onSuccess: () => {
                reset();
                setShowInviteUserModal(false);
            }
        });
    };

    const handleCreateStudent = (e) => {
        e.preventDefault();
        post(route('center.manage.students.create'), {
            onSuccess: () => {
                reset();
                setShowCreateStudentModal(false);
                setSelectedTeacher('');
            }
        });
    };

    const handleCreateGroup = (e) => {
        e.preventDefault();
        post(route('center.manage.groups.create'), {
            onSuccess: () => {
                reset();
                setShowCreateGroupModal(false);
                setSelectedTeacher('');
            }
        });
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            subject: user.subject || '',
            role: user.roles?.[0] || 'teacher',
        });
        setShowCreateUserModal(true);
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setSelectedTeacher(student.teacher?.id || '');
        setData({
            name: student.name,
            phone: student.phone || '',
            level: student.level || '',
            teacher_id: student.teacher?.id || '',
            group_id: student.group?.id || '',
        });
        setShowCreateStudentModal(true);
    };

    const handleEditGroup = (group) => {
        setEditingGroup(group);
        setSelectedTeacher(group.teacher?.id || '');
        setData({
            name: group.name,
            subject: group.subject || '',
            level: group.level || '',
            teacher_id: group.teacher?.id || '',
            max_students: group.max_students || '',
            student_price: group.student_price || '',
            payment_type: group.payment_type || 'monthly',
        });
        setShowCreateGroupModal(true);
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        put(route('center.manage.users.update', editingUser.id), {
            onSuccess: () => {
                reset();
                setShowCreateUserModal(false);
                setEditingUser(null);
            }
        });
    };

    const handleUpdateStudent = (e) => {
        e.preventDefault();
        put(route('center.manage.students.update', editingStudent.id), {
            onSuccess: () => {
                reset();
                setShowCreateStudentModal(false);
                setEditingStudent(null);
                setSelectedTeacher('');
            }
        });
    };

    const handleUpdateGroup = (e) => {
        e.preventDefault();
        put(route('center.manage.groups.update', editingGroup.id), {
            onSuccess: () => {
                reset();
                setShowCreateGroupModal(false);
                setEditingGroup(null);
                setSelectedTeacher('');
            }
        });
    };

    const handleDeleteUser = (user) => {
        if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
            router.delete(route('center.manage.users.delete', user.id));
        }
    };

    const handleDeleteStudent = (student) => {
        if (confirm(`هل أنت متأكد من حذف الطالب ${student.name}؟`)) {
            router.delete(route('center.manage.students.delete', student.id));
        }
    };

    const handleDeleteGroup = (group) => {
        if (confirm(`هل أنت متأكد من حذف المجموعة ${group.name}؟`)) {
            router.delete(route('center.manage.groups.delete', group.id));
        }
    };

    const handleStudentPageChange = (page) => {
        router.get(route('center.manage.index'), { page }, {
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

    const TabButton = ({ label, isActive, onClick }) => (
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

    const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary' }) => {
        const baseClasses = "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md";
        const variantClasses = {
            primary: "bg-blue-600 text-white hover:bg-blue-700",
            secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
            danger: "bg-red-600 text-white hover:bg-red-700"
        };

        return (
            <button
                onClick={onClick}
                className={`${baseClasses} ${variantClasses[variant]}`}
            >
                <Icon className="h-4 w-4 mr-1" />
                {label}
            </button>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    إدارة المركز - {center.name}
                </h2>
            }
        >
            <Head title="إدارة المركز" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* Tab Navigation */}
                    <div className="mb-8">
                        <nav className="flex space-x-8">
                            <TabButton
                                label="نظرة عامة"
                                isActive={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                            />
                            <TabButton
                                label="المستخدمون"
                                isActive={activeTab === 'users'}
                                onClick={() => setActiveTab('users')}
                            />
                            <TabButton
                                label="الطلاب"
                                isActive={activeTab === 'students'}
                                onClick={() => setActiveTab('students')}
                            />
                            <TabButton
                                label="المجموعات"
                                isActive={activeTab === 'groups'}
                                onClick={() => setActiveTab('groups')}
                            />
                            <TabButton
                                label="الاشتراك"
                                isActive={activeTab === 'subscription'}
                                onClick={() => setActiveTab('subscription')}
                            />
                        </nav>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    icon={UserIcon}
                                    title="إجمالي المستخدمين"
                                    value={statistics.total_users || 0}
                                    subtitle={`${statistics.teachers_count || 0} معلم, ${statistics.assistants_count || 0} مساعد`}
                                    color="blue"
                                />
                                <StatCard
                                    icon={AcademicCapIcon}
                                    title="إجمالي الطلاب"
                                    value={statistics.students_count || 0}
                                    subtitle={`من ${subscriptionLimits.max_students || 0} متاح`}
                                    color="green"
                                />
                                <StatCard
                                    icon={UserGroupIcon}
                                    title="إجمالي المجموعات"
                                    value={statistics.groups_count || 0}
                                    subtitle={`${statistics.active_groups_count || 0} نشط`}
                                    color="purple"
                                />
                                <StatCard
                                    icon={ChartBarIcon}
                                    title="التسجيلات الأخيرة"
                                    value={statistics.recent_registrations || 0}
                                    subtitle="هذا الأسبوع"
                                    color="yellow"
                                />
                            </div>

                            {/* Center Information */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات المركز</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">اسم المركز</p>
                                        <p className="text-lg text-gray-900">{center.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">نوع المركز</p>
                                        <p className="text-lg text-gray-900">{center.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">العنوان</p>
                                        <p className="text-lg text-gray-900">{center.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">تاريخ الإنشاء</p>
                                        <p className="text-lg text-gray-900">
                                            {new Date(center.created_at).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">إدارة المستخدمين</h3>
                                <div className="flex space-x-2">
                                    <PrimaryButton onClick={() => setShowCreateUserModal(true)}>
                                        <PlusIcon className="h-5 w-5 mr-2" />
                                        إضافة مستخدم
                                    </PrimaryButton>
                                    <SecondaryButton onClick={() => setShowInviteUserModal(true)}>
                                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                                        دعوة مستخدم
                                    </SecondaryButton>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                                المادة
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الطلاب
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
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                                        {user.roles?.[0] || 'لا يوجد'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.subject || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.students_count || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <ActionButton
                                                        onClick={() => handleEditUser(user)}
                                                        icon={PencilIcon}
                                                        label="تعديل"
                                                        variant="secondary"
                                                    />
                                                    <ActionButton
                                                        onClick={() => handleDeleteUser(user)}
                                                        icon={TrashIcon}
                                                        label="حذف"
                                                        variant="danger"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Students Tab */}
                    {activeTab === 'students' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">إدارة الطلاب</h3>
                                <PrimaryButton onClick={() => setShowCreateStudentModal(true)}>
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    إضافة طالب جديد
                                </PrimaryButton>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الاسم
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المرحلة
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المعلم
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                المجموعة
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الإجراءات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {students.data && students.data.length > 0 ? (
                                            students.data.map((student) => (
                                                <tr key={student.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {student.name}
                                                        </div>
                                                    <div className="text-sm text-gray-500">
                                                        {student.phone}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {student.level || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {student.teacher?.name || 'لا يوجد'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {student.teacher?.subject || ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {student.group?.name || 'لا يوجد'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <ActionButton
                                                        onClick={() => handleEditStudent(student)}
                                                        icon={PencilIcon}
                                                        label="تعديل"
                                                        variant="secondary"
                                                    />
                                                    <ActionButton
                                                        onClick={() => router.visit(route('students.show', student.id))}
                                                        icon={EyeIcon}
                                                        label="عرض"
                                                        variant="secondary"
                                                    />
                                                    <ActionButton
                                                        onClick={() => handleDeleteStudent(student)}
                                                        icon={TrashIcon}
                                                        label="حذف"
                                                        variant="danger"
                                                    />
                                                </td>
                                            </tr>
                                        ))) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                                    لا توجد طلاب
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Students Pagination */}
                            {students.last_page > 1 && (
                                <Pagination
                                    currentPage={students.current_page}
                                    lastPage={students.last_page}
                                    onPageChange={handleStudentPageChange}
                                    showingFrom={students.from}
                                    showingTo={students.to}
                                    total={students.total}
                                />
                            )}
                        </div>
                    )}

                    {/* Groups Tab */}
                    {activeTab === 'groups' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">إدارة المجموعات</h3>
                                <PrimaryButton onClick={() => setShowCreateGroupModal(true)}>
                                    <PlusIcon className="h-5 w-5 mr-2" />
                                    إضافة مجموعة جديدة
                                </PrimaryButton>
                            </div>
                            
                            <div className="bg-white rounded-lg shadow overflow-hidden">
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
                                                الطلاب
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                السعر
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                الإجراءات
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {groups.map((group) => (
                                            <tr key={group.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {group.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {group.level || ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {group.subject || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {group.teacher?.name || 'لا يوجد'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {group.teacher?.subject || ''}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {group.students_count || 0}/{group.max_students || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {group.student_price || 0} ر.س
                                                    <div className="text-xs text-gray-500">
                                                        {group.payment_type === 'monthly' ? 'شهري' : 'للحصة'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <ActionButton
                                                        onClick={() => handleEditGroup(group)}
                                                        icon={PencilIcon}
                                                        label="تعديل"
                                                        variant="secondary"
                                                    />
                                                    <ActionButton
                                                        onClick={() => router.visit(route('groups.show', group.id))}
                                                        icon={EyeIcon}
                                                        label="عرض"
                                                        variant="secondary"
                                                    />
                                                    <ActionButton
                                                        onClick={() => handleDeleteGroup(group)}
                                                        icon={TrashIcon}
                                                        label="حذف"
                                                        variant="danger"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Subscription Tab */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">إدارة الاشتراك</h3>
                            
                            {subscription && (
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">الخطة الحالية</h4>
                                            <p className="text-2xl font-bold text-blue-600">{subscription.plan?.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {subscription.plan?.price}ج. م/ شهر
                                            </p>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">حالة الاشتراك</h4>
                                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                                                subscription.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {subscription.status === 'active' ? 'نشط' : 'منتهي'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600">الحد الأقصى للطلاب</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {statistics.students_count || 0} / {subscriptionLimits.max_students || 0}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600">الحد الأقصى للمعلمين</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {statistics.teachers_count || 0} / {subscriptionLimits.max_teachers || 0}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600">الحد الأقصى للمساعدين</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {statistics.assistants_count || 0} / {subscriptionLimits.max_assistants || 0}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <PrimaryButton
                                            onClick={() => router.visit(route('center.subscription.upgrade'))}
                                        >
                                            ترقية الاشتراك
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Create/Edit User Modal */}
            <Modal show={showCreateUserModal} onClose={() => {
                setShowCreateUserModal(false);
                setEditingUser(null);
                reset();
            }}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
                    </h3>
                    
                    <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="الاسم" />
                            <TextInput
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1 block w-full"
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
                                required
                                className="mt-1 block w-full"
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
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="teacher">معلم</option>
                                <option value="assistant">مساعد</option>
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
                        
                        <div className="flex justify-end space-x-2">
                            <SecondaryButton onClick={() => {
                                setShowCreateUserModal(false);
                                setEditingUser(null);
                                reset();
                            }}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'جاري الحفظ...' : editingUser ? 'تحديث' : 'إضافة'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Invite User Modal */}
            <Modal show={showInviteUserModal} onClose={() => {
                setShowInviteUserModal(false);
                reset();
            }}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">دعوة مستخدم جديد</h3>
                    <p className="text-sm text-gray-600 mb-4">سيتم إرسال دعوة بكلمة مرور افتراضية</p>
                    
                    <form onSubmit={handleInviteUser} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="invite_name" value="الاسم" />
                            <TextInput
                                id="invite_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="invite_email" value="البريد الإلكتروني" />
                            <TextInput
                                id="invite_email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="invite_phone" value="رقم الهاتف" />
                            <TextInput
                                id="invite_phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="invite_role" value="الدور" />
                            <select
                                id="invite_role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="teacher">معلم</option>
                                <option value="assistant">مساعد</option>
                            </select>
                            <InputError message={errors.role} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="invite_subject" value="المادة" />
                            <TextInput
                                id="invite_subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.subject} className="mt-2" />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <SecondaryButton onClick={() => {
                                setShowInviteUserModal(false);
                                reset();
                            }}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'جاري الإرسال...' : 'إرسال الدعوة'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Create/Edit Student Modal */}
            <Modal show={showCreateStudentModal} onClose={() => {
                setShowCreateStudentModal(false);
                setEditingStudent(null);
                setSelectedTeacher('');
                reset();
            }}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingStudent ? 'تعديل الطالب' : 'إضافة طالب جديد'}
                    </h3>
                    
                    <form onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="student_name" value="اسم الطالب" />
                            <TextInput
                                id="student_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="student_phone" value="رقم الهاتف" />
                            <TextInput
                                id="student_phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.phone} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="student_level" value="المرحلة الدراسية" />
                            <select
                                id="student_level"
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">اختر المرحلة</option>
                                <option value="ابتدائي">ابتدائي</option>
                                <option value="متوسط">متوسط</option>
                                <option value="ثانوي">ثانوي</option>
                                <option value="جامعي">جامعي</option>
                            </select>
                            <InputError message={errors.level} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="teacher_select" value="المعلم المسؤول" />
                            <select
                                id="teacher_select"
                                value={data.teacher_id}
                                onChange={(e) => {
                                    const teacherId = e.target.value;
                                    setData('teacher_id', teacherId);
                                    setSelectedTeacher(teacherId);
                                }}
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">اختر المعلم</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name} {teacher.subject ? `- ${teacher.subject}` : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.teacher_id} className="mt-2" />
                        </div>
                        
                        {selectedTeacher && (
                            <div>
                                <InputLabel htmlFor="group_select" value="المجموعة (اختياري)" />
                                <select
                                    id="group_select"
                                    value={data.group_id}
                                    onChange={(e) => setData('group_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">بدون مجموعة</option>
                                    {teacherGroups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name} ({group.students_count}/{group.max_students})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.group_id} className="mt-2" />
                            </div>
                        )}
                        
                        <div className="flex justify-end space-x-2">
                            <SecondaryButton onClick={() => {
                                setShowCreateStudentModal(false);
                                setEditingStudent(null);
                                setSelectedTeacher('');
                                reset();
                            }}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'جاري الحفظ...' : editingStudent ? 'تحديث' : 'إضافة'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Create/Edit Group Modal */}
            <Modal show={showCreateGroupModal} onClose={() => {
                setShowCreateGroupModal(false);
                setEditingGroup(null);
                setSelectedTeacher('');
                reset();
            }}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingGroup ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
                    </h3>
                    
                    <form onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="group_name" value="اسم المجموعة" />
                            <TextInput
                                id="group_name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="group_subject" value="المادة" />
                            <TextInput
                                id="group_subject"
                                value={data.subject}
                                onChange={(e) => setData('subject', e.target.value)}
                                required
                                className="mt-1 block w-full"
                            />
                            <InputError message={errors.subject} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="group_level" value="المرحلة الدراسية" />
                            <select
                                id="group_level"
                                value={data.level}
                                onChange={(e) => setData('level', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">اختر المرحلة</option>
                                <option value="ابتدائي">ابتدائي</option>
                                <option value="متوسط">متوسط</option>
                                <option value="ثانوي">ثانوي</option>
                                <option value="جامعي">جامعي</option>
                            </select>
                            <InputError message={errors.level} className="mt-2" />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="group_teacher_select" value="المعلم المسؤول" />
                            <select
                                id="group_teacher_select"
                                value={data.teacher_id}
                                onChange={(e) => {
                                    const teacherId = e.target.value;
                                    setData('teacher_id', teacherId);
                                    setSelectedTeacher(teacherId);
                                }}
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">اختر المعلم</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name} {teacher.subject ? `- ${teacher.subject}` : ''}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.teacher_id} className="mt-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="max_students" value="عدد الطلاب الأقصى" />
                                <TextInput
                                    id="max_students"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={data.max_students}
                                    onChange={(e) => setData('max_students', e.target.value)}
                                    required
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.max_students} className="mt-2" />
                            </div>
                            
                            <div>
                                <InputLabel htmlFor="student_price" value="سعر الطالب" />
                                <TextInput
                                    id="student_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.student_price}
                                    onChange={(e) => setData('student_price', e.target.value)}
                                    required
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.student_price} className="mt-2" />
                            </div>
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="payment_type" value="نوع الدفع" />
                            <select
                                id="payment_type"
                                value={data.payment_type}
                                onChange={(e) => setData('payment_type', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="monthly">شهري</option>
                                <option value="session">للحصة</option>
                            </select>
                            <InputError message={errors.payment_type} className="mt-2" />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <SecondaryButton onClick={() => {
                                setShowCreateGroupModal(false);
                                setEditingGroup(null);
                                setSelectedTeacher('');
                                reset();
                            }}>
                                إلغاء
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing ? 'جاري الحفظ...' : editingGroup ? 'تحديث' : 'إضافة'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
