import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { successAlert, errorAlert } from '@/utils/sweetAlert';

export default function Index({ groups, selectedGroup, selectedDate, students, attendances, searchTerm = '' }) {
    const [localSelectedGroup, setLocalSelectedGroup] = useState(selectedGroup?.id || '');
    const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
    const [selectAll, setSelectAll] = useState(false);
    
    const { data, setData, post, processing } = useForm({
        group_id: selectedGroup?.id || '',
        date: selectedDate,
        attendances: []
    });

    // Initialize attendance data when students change
    useEffect(() => {
        if (students && students.data) {
            const attendanceData = students.data.map(student => ({
                student_id: student.id,
                is_present: attendances[student.id]?.is_present || false,
                notes: attendances[student.id]?.notes || ''
            }));
            setData('attendances', attendanceData);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [students, attendances]);

    // Handle bulk select all for current page
    const handleSelectAll = (isChecked) => {
        setSelectAll(isChecked);
        const newAttendances = [...data.attendances];
        
        // Update all students on current page
        if (students && students.data) {
            students.data.forEach((student, index) => {
                if (newAttendances[index]) {
                    newAttendances[index].is_present = isChecked;
                }
            });
        }
        
        setData('attendances', newAttendances);
    };

    // Update selectAll state when individual checkboxes change
    useEffect(() => {
        if (students && students.data && students.data.length > 0) {
            const allCurrentStudentsPresent = students.data.every((student, index) => 
                data.attendances[index]?.is_present || false
            );
            setSelectAll(allCurrentStudentsPresent);
        }
    }, [data.attendances, students]);

    // Handle page navigation
    const handlePageChange = (url) => {
        router.get(url, {}, {
            preserveState: true,
            replace: true
        });
    };

    // Get valid days for the selected group
    const getValidDays = () => {
        if (!selectedGroup || !selectedGroup.schedules) return [];
        return selectedGroup.schedules.map(schedule => schedule.day_of_week);
    };

    // Check if a date is valid (matches group schedule days)
    const isDateValid = (dateString) => {
        if (!selectedGroup || !selectedGroup.schedules) return true;
        
        const date = new Date(dateString);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const validDays = getValidDays();
        
        return validDays.includes(dayOfWeek);
    };

    const handleGroupChange = (groupId) => {
        setLocalSelectedGroup(groupId);
        
        // Find the selected group
        const group = groups.find(g => g.id == groupId);
        
        // If group has schedules, set to next valid date
        if (group && group.schedules && group.schedules.length > 0) {
            const validDays = group.schedules.map(schedule => schedule.day_of_week);
            const today = new Date();
            
            // Find the next valid date starting from today
            let nextValidDate = today.toISOString().split('T')[0];
            for (let i = 0; i < 14; i++) { // Check next 14 days
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() + i);
                
                if (validDays.includes(checkDate.getDay())) {
                    nextValidDate = checkDate.toISOString().split('T')[0];
                    break;
                }
            }
            
            setLocalSelectedDate(nextValidDate);
            router.get(route('attendance.index'), { 
                group_id: groupId, 
                date: nextValidDate 
            });
        } else {
            router.get(route('attendance.index'), { 
                group_id: groupId, 
                date: localSelectedDate 
            });
        }
    };

    const handleDateChange = (date) => {
        setLocalSelectedDate(date);
        
        // Check if the selected date is valid for the group's schedule
        if (selectedGroup && selectedGroup.schedules && !isDateValid(date)) {
            errorAlert({
                title: 'تاريخ غير صالح',
                text: 'يرجى اختيار تاريخ يتطابق مع أيام جدول المجموعة.',
            });
            return;
        }
        
        if (localSelectedGroup) {
            router.get(route('attendance.index'), { 
                group_id: localSelectedGroup, 
                date: date 
            });
        }
    };

    const handleSearchChange = (term) => {
        setLocalSearchTerm(term);
    };

    const handleSearchSubmit = () => {
        if (localSelectedGroup) {
            router.get(route('attendance.index'), {
                group_id: localSelectedGroup,
                date: localSelectedDate,
                search: localSearchTerm
            });
        }
    };

    const handleAttendanceChange = (studentIndex, field, value) => {
        const newAttendances = [...data.attendances];
        if (newAttendances[studentIndex]) {
            newAttendances[studentIndex][field] = value;
            setData('attendances', newAttendances);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('attendance.store'), {
            onSuccess: () => {
                successAlert({
                    title: 'تم بنجاح!',
                    text: 'تم حفظ سجل الحضور بنجاح',
                    timer: 3000,
                    timerProgressBar: true
                });
            },
            onError: () => {
                errorAlert({
                    title: 'خطأ!',
                    text: 'حدث خطأ أثناء حفظ سجل الحضور. يرجى المحاولة مرة أخرى.',
                });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" dir="rtl">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 text-right">
                        تسجيل الحضور
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3 sm:space-x-reverse w-full sm:w-auto">
                        <button
                            onClick={() => router.get(route('attendance.last-month-report'))}
                            className="inline-flex items-center justify-center px-3 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">تقرير الشهر الماضي</span>
                            <span className="sm:hidden">تقرير الشهر</span>
                        </button>
                        {selectedGroup && (
                            <button
                                onClick={() => router.get(route('attendance.summary', selectedGroup.id))}
                                className="inline-flex items-center justify-center px-3 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                تقرير الحضور
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="تسجيل الحضور" />

            <div className="py-6 sm:py-12" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6">
                            {/* Group and Date Selection */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 mb-6">
                                <div>
                                    <label htmlFor="group_select" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                                        اختر المجموعة
                                    </label>
                                    <select
                                        id="group_select"
                                        value={localSelectedGroup}
                                        onChange={(e) => handleGroupChange(e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right text-sm"
                                    >
                                        <option value="">اختر المجموعة</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.id}> 
                                                {group.name} ({group.assigned_students_count} طلاب)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="date_select" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                                        اختر التاريخ
                                    </label>
                                    <input
                                        id="date_select"
                                        type="date"
                                        value={localSelectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        disabled={!localSelectedGroup}
                                        className={`block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right text-sm ${
                                            !localSelectedGroup ? 'bg-gray-100 cursor-not-allowed' : ''
                                        } ${
                                            selectedGroup && selectedGroup.schedules && !isDateValid(localSelectedDate) 
                                                ? 'border-red-300 bg-red-50' 
                                                : ''
                                        }`}
                                    />
                                    {selectedGroup && selectedGroup.schedules && (
                                        <span className="text-xs text-gray-500 block mt-1">
                                            أيام المجموعة: {selectedGroup.schedules.map(schedule => {
                                                const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
                                                return days[schedule.day_of_week];
                                            }).join(', ')}
                                        </span>
                                    )}
                                    {!localSelectedGroup && (
                                        <p className="mt-1 text-xs text-gray-500 text-right">
                                            اختر مجموعة أولاً
                                        </p>
                                    )}
                                    {selectedGroup && selectedGroup.schedules && !isDateValid(localSelectedDate) && (
                                        <p className="mt-1 text-xs text-red-600 text-right">
                                            هذا التاريخ لا يتطابق مع أيام جدول المجموعة
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Search bar for students */}
                            {selectedGroup && (
                                <div className="mb-6">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2 text-right">
                                        البحث في الطلاب
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            id="search"
                                            value={localSearchTerm}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                            placeholder="البحث بالاسم أو رقم الهاتف..."
                                            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right text-sm"
                                        />
                                        <button
                                            onClick={handleSearchSubmit}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            بحث
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Student count and pagination info */}
                            {selectedGroup && students && students.data && (
                                <div className="mb-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
                                    <span className="text-right">
                                        عرض {students.from} إلى {students.to} من {students.total} طالب
                                    </span>
                                    <span className="text-right">
                                        الصفحة {students.current_page} من {students.last_page}
                                    </span>
                                </div>
                            )}

                            {selectedGroup && students && students.data ? (
                                students.data.length > 0 ? (
                                    <>
                                        {/* Info note for large groups */}
                                        {students.total > 50 && (
                                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800 text-right">
                                                    💡 تم تقسيم الطلاب إلى صفحات (20 طالب في كل صفحة) لتسهيل التنقل والتحكم
                                                </p>
                                            </div>
                                        )}
                                        
                                        <form onSubmit={submit}>
                                            <div className="mb-6">
                                                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 text-right">
                                                        قائمة طلاب {selectedGroup.name} - {new Date(selectedDate).toLocaleDateString('ar-EG', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </h3>
                                                    
                                                    {/* Bulk actions */}
                                                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectAll}
                                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                                className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500 ml-2"
                                                            />
                                                            <span className="text-sm text-gray-700">تحديد الكل</span>
                                                        </label>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3 sm:space-y-4">
                                                    {students.data.map((student, index) => {
                                                        return (
                                                            <div key={student.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                                                    {/* Student Info */}
                                                                    <div className="flex items-center space-x-3 space-x-reverse">
                                                                        <div className="flex-shrink-0">
                                                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                                <span className="text-sm font-medium text-gray-600">
                                                                                    {student.name.charAt(0)}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                                                                            <p className="text-xs sm:text-sm text-gray-500">{student.phone}</p>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    {/* Attendance Controls */}
                                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                                                        <label className="flex items-center justify-center sm:justify-start">
                                                                            <span className="ml-2 text-sm text-gray-700">حاضر</span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={data.attendances[index]?.is_present || false}
                                                                                onChange={(e) => handleAttendanceChange(index, 'is_present', e.target.checked)}
                                                                                className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
                                                                            />
                                                                        </label>
                                                                        
                                                                        <input
                                                                            type="text"
                                                                            placeholder="ملاحظات (اختياري)"
                                                                            value={data.attendances[index]?.notes || ''}
                                                                            onChange={(e) => handleAttendanceChange(index, 'notes', e.target.value)}
                                                                            className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right w-full sm:w-auto"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {/* Pagination controls */}
                                                {students.links && students.links.length > 3 && (
                                                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                                            {students.links.map((link, index) => {
                                                                if (index === 0) {
                                                                    return (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            onClick={() => link.url && handlePageChange(link.url)}
                                                                            disabled={!link.url}
                                                                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            السابق
                                                                        </button>
                                                                    );
                                                                }
                                                                
                                                                if (index === students.links.length - 1) {
                                                                    return (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            onClick={() => link.url && handlePageChange(link.url)}
                                                                            disabled={!link.url}
                                                                            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        >
                                                                            التالي
                                                                        </button>
                                                                    );
                                                                }
                                                                
                                                                return (
                                                                    <button
                                                                        key={index}
                                                                        type="button"
                                                                        onClick={() => link.url && handlePageChange(link.url)}
                                                                        disabled={!link.url}
                                                                        className={`px-3 py-1 text-sm rounded-md ${
                                                                            link.active
                                                                                ? 'bg-blue-600 text-white'
                                                                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                                                                        }`}
                                                                    >
                                                                        {link.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        <div className="text-sm text-gray-600 text-right">
                                                            عرض {students.from} إلى {students.to} من {students.total} طالب
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                <div className="text-sm text-gray-500 text-right order-2 sm:order-1">
                                                    المجموع: {students.total} طالب
                                                    {searchTerm && (
                                                        <span className="mr-2 sm:mr-4"> | 
                                                            النتائج: {students.data.length}
                                                        </span>
                                                    )}
                                                    {data.attendances && (
                                                        <span className="mr-2 sm:mr-4"> | 
                                                            الحاضرين: {data.attendances.filter(a => a.is_present).length}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto order-1 sm:order-2"
                                                >
                                                    {processing && (
                                                        <svg className="animate-spin -mr-1 ml-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                    )}
                                                    {processing ? 'جاري الحفظ...' : 'حفظ الحضور'}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب</h3>
                                        <p className="mt-1 text-sm text-gray-500">لم يتم العثور على طلاب في هذه المجموعة.</p>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">اختر مجموعة</h3>
                                    <p className="mt-1 text-sm text-gray-500">اختر مجموعة وتاريخ لبدء تسجيل الحضور.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
