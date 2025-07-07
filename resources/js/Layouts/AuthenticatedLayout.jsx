import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { successAlert, errorAlert } from '@/utils/sweetAlert';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, errors, flash } = usePage().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Handle flash messages globally for all authenticated pages
    useEffect(() => {
        if (flash?.success) {
            successAlert({
                title: 'تم بنجاح',
                text: flash.success
            });
        }
        
        if (flash?.error) {
            errorAlert({
                title: 'خطأ',
                text: flash.error
            });
        }
        
        if (errors && Object.keys(errors).length > 0) {
            // Show first error message
            const firstError = Object.values(errors)[0];
            errorAlert({
                title: 'خطأ',
                text: firstError
            });
        }
    }, [flash, errors]);

    return (
        <div className="min-h-screen bg-gray-100" dir="rtl">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-reverse space-x-8 sm:-my-px sm:mr-10 sm:flex">                        <NavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            لوحة التحكم
                        </NavLink>
                        {!user.is_admin && (
                            <>
                                <NavLink
                                    href={route('students.index')}
                                    active={route().current('students.*')}
                                >
                                    الطلاب
                                </NavLink>
                                <NavLink
                                    href={route('groups.index')}
                                    active={route().current('groups.*')}
                                >
                                    المجموعات
                                </NavLink>
                                <NavLink
                                    href={route('attendance.index')}
                                    active={route().current('attendance.*')}
                                >
                                    الحضور
                                </NavLink>
                                <NavLink
                                    href={route('payments.index')}
                                    active={route().current('payments.*')}
                                >
                                    المدفوعات
                                </NavLink>
                                <NavLink
                                    href={route('plans.index')}
                                    active={route().current('plans.*')}
                                >
                                    الخطط
                                </NavLink>
                                <NavLink
                                    href={route('assistants.index')}
                                    active={route().current('assistants.*')}
                                >
                                    المساعدين
                                </NavLink>
                                <NavLink
                                    href={route('feedback.index')}
                                    active={route().current('feedback.*')}
                                >
                                    التواصل والاقتراحات
                                </NavLink>
                            </>
                        )}
                        {user.is_admin && (
                            <>
                                <NavLink
                                    href={route('admin.users')}
                                    active={route().current('admin.users')}
                                >
                                    موافقات المعلمين
                                </NavLink>
                                <NavLink
                                    href={route('admin.plans.index')}
                                    active={route().current('admin.plans.*')}
                                >
                                    إدارة الخطط
                                </NavLink>
                                <NavLink
                                    href={route('admin.plan-upgrade-requests.index')}
                                    active={route().current('admin.plan-upgrade-requests.*')}
                                >
                                    طلبات ترقية الخطط
                                </NavLink>
                                <NavLink
                                    href={route('admin.feedback.index')}
                                    active={route().current('admin.feedback.*')}
                                >
                                    إدارة التواصل والاقتراحات
                                </NavLink>
                            </>
                        )}
                            </div>
                        </div>

                        <div className="hidden sm:mr-6 sm:flex sm:items-center">
                            <div className="relative mr-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-ml-0.5 mr-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            الملف الشخصي
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            تسجيل الخروج
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            لوحة التحكم
                        </ResponsiveNavLink>
                        {!user.is_admin && (
                            <>
                                <ResponsiveNavLink
                                    href={route('students.index')}
                                    active={route().current('students.*')}
                                >
                                    الطلاب
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('groups.index')}
                                    active={route().current('groups.*')}
                                >
                                    المجموعات
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('attendance.index')}
                                    active={route().current('attendance.*')}
                                >
                                    الحضور
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('payments.index')}
                                    active={route().current('payments.*')}
                                >
                                    المدفوعات
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('plans.index')}
                                    active={route().current('plans.*')}
                                >
                                    الخطط
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('assistants.index')}
                                    active={route().current('assistants.*')}
                                >
                                    المساعدين
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('feedback.index')}
                                    active={route().current('feedback.*')}
                                >
                                    التواصل والاقتراحات
                                </ResponsiveNavLink>
                            </>
                        )}
                        {user.is_admin && (
                            <>
                                <ResponsiveNavLink
                                    href={route('admin.users')}
                                    active={route().current('admin.users')}
                                >
                                    موافقات المعلمين
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.plans.index')}
                                    active={route().current('admin.plans.*')}
                                >
                                    إدارة الخطط
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.plan-upgrade-requests.index')}
                                    active={route().current('admin.plan-upgrade-requests.*')}
                                >
                                    طلبات ترقية الخطط
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('admin.feedback.index')}
                                    active={route().current('admin.feedback.*')}
                                >
                                    إدارة التواصل والاقتراحات
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                الملف الشخصي
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                تسجيل الخروج
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
