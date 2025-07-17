import { useState, useEffect } from 'react';
import { usePage, Link } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { successAlert, errorAlert } from '@/utils/sweetAlert';

export default function CenterOwnerLayout({ header, children }) {
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
                                    <ApplicationLogo className="block h-32 w-auto fill-current text-gray-800" />
                                </Link>
                            </div>

                            <div className="hidden space-x-reverse space-x-8 sm:-my-px sm:mr-10 sm:flex">                        
                                <NavLink
                                    href={route('center.owner.dashboard')}
                                    active={route().current('center.owner.dashboard')}
                                >
                                    لوحة التحكم الرئيسية
                                </NavLink>
                                
                                <NavLink
                                    href={route('center.owner.overview')}
                                    active={route().current('center.owner.overview')}
                                >
                                    نظرة عامة على المركز
                                </NavLink>

                                <NavLink
                                    href={route('center.owner.teachers')}
                                    active={route().current('center.owner.teachers')}
                                >
                                    إدارة المعلمين
                                </NavLink>

                                <NavLink
                                    href={route('center.owner.students')}
                                    active={route().current('center.owner.students')}
                                >
                                    إدارة الطلاب
                                </NavLink>

                                <NavLink
                                    href={route('center.owner.groups')}
                                    active={route().current('center.owner.groups')}
                                >
                                    إدارة المجموعات
                                </NavLink>

                                <NavLink
                                    href={route('center.owner.reports')}
                                    active={route().current('center.owner.reports')}
                                >
                                    التقارير
                                </NavLink>

                                <NavLink
                                    href={route('center.owner.financial')}
                                    active={route().current('center.owner.financial')}
                                >
                                    التقارير المالية
                                </NavLink>

                                <NavLink
                                    href={route('center.owner.subscription')}
                                    active={route().current('center.owner.subscription')}
                                >
                                    إدارة الاشتراك
                                </NavLink>

                                <NavLink
                                    href={route('center.owner.settings')}
                                    active={route().current('center.owner.settings')}
                                >
                                    إعدادات المركز
                                </NavLink>

                                {/* Switch back to teacher dashboard if user is also a teacher */}
                                {user.is_teacher && (
                                    <div className="relative">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">
                                                    تبديل لوحة التحكم
                                                    <svg
                                                        className="mr-2 h-4 w-4"
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
                                            </Dropdown.Trigger>
                                            <Dropdown.Content>
                                                <Dropdown.Link href={route('dashboard')}>
                                                    لوحة تحكم المعلم
                                                </Dropdown.Link>
                                                <Dropdown.Link href={route('center.owner.dashboard')}>
                                                    لوحة تحكم مالك المركز
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
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
                                                    className="mr-2 h-4 w-4"
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
                                        <Dropdown.Link href={route('profile.edit')}>
                                            الملف الشخصي
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('center.owner.settings')}>
                                            إعدادات المركز
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('onboarding.show')}>
                                            الجولة التعريفية
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

                        <div className="-ml-2 flex items-center sm:hidden">
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

                {/* Responsive Navigation Menu */}
                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('center.owner.dashboard')}
                            active={route().current('center.owner.dashboard')}
                        >
                            لوحة التحكم الرئيسية
                        </ResponsiveNavLink>
                        
                        <ResponsiveNavLink
                            href={route('center.owner.overview')}
                            active={route().current('center.owner.overview')}
                        >
                            نظرة عامة على المركز
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('center.owner.teachers')}
                            active={route().current('center.owner.teachers')}
                        >
                            إدارة المعلمين
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('center.owner.students')}
                            active={route().current('center.owner.students')}
                        >
                            إدارة الطلاب
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('center.owner.groups')}
                            active={route().current('center.owner.groups')}
                        >
                            إدارة المجموعات
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('center.owner.reports')}
                            active={route().current('center.owner.reports')}
                        >
                            التقارير
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('center.owner.financial')}
                            active={route().current('center.owner.financial')}
                        >
                            التقارير المالية
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('center.owner.subscription')}
                            active={route().current('center.owner.subscription')}
                        >
                            إدارة الاشتراك
                        </ResponsiveNavLink>

                        <ResponsiveNavLink
                            href={route('center.owner.settings')}
                            active={route().current('center.owner.settings')}
                        >
                            إعدادات المركز
                        </ResponsiveNavLink>

                        {/* Switch back to teacher dashboard if user is also a teacher */}
                        {user.is_teacher && (
                            <div className="border-t border-gray-200 pt-2">
                                <div className="px-4 py-2">
                                    <div className="text-sm font-medium text-gray-400">تبديل لوحة التحكم</div>
                                </div>
                                <ResponsiveNavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    لوحة تحكم المعلم
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('center.owner.dashboard')}
                                    active={route().current('center.owner.dashboard')}
                                >
                                    لوحة تحكم مالك المركز
                                </ResponsiveNavLink>
                            </div>
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
                            <ResponsiveNavLink href={route('center.owner.settings')}>
                                إعدادات المركز
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('onboarding.show')}>
                                الجولة التعريفية
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
