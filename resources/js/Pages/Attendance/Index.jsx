import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { successAlert, errorAlert } from '@/utils/sweetAlert';

export default function Index({ groups, selectedGroup, selectedDate, attendances }) {
    const [localSelectedGroup, setLocalSelectedGroup] = useState(selectedGroup?.id || '');
    const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);
    
    const { data, setData, post, processing } = useForm({
        group_id: selectedGroup?.id || '',
        date: selectedDate,
        attendances: []
    });

    useEffect(() => {
        if (selectedGroup && selectedGroup.assigned_students) {
            const attendanceData = selectedGroup.assigned_students.map(student => ({
                student_id: student.id,
                is_present: attendances[student.id]?.is_present || false,
                notes: attendances[student.id]?.notes || ''
            }));
            setData('attendances', attendanceData);
        }
    }, [selectedGroup, attendances]);

    const handleGroupChange = (groupId) => {
        setLocalSelectedGroup(groupId);
        router.get(route('attendance.index'), { 
            group_id: groupId, 
            date: localSelectedDate 
        });
    };

    const handleDateChange = (date) => {
        setLocalSelectedDate(date);
        if (localSelectedGroup) {
            router.get(route('attendance.index'), { 
                group_id: localSelectedGroup, 
                date: date 
            });
        }
    };

    const handleAttendanceChange = (studentIndex, field, value) => {
        const newAttendances = [...data.attendances];
        newAttendances[studentIndex][field] = value;
        setData('attendances', newAttendances);
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
            onError: (errors) => {
                console.error('Error saving attendance:', errors);
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
                                                {group.name} ({group.assigned_students.length} طلاب)
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
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right text-sm"
                                    />
                                </div>
                            </div>

                            {selectedGroup && selectedGroup.assigned_students ? (
                                selectedGroup.assigned_students.length > 0 ? (
                                    <form onSubmit={submit}>
                                        <div className="mb-6">
                                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 text-right">
                                                قائمة طلاب {selectedGroup.name} - {new Date(selectedDate).toLocaleDateString('ar-EG', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                            </h3>
                                            
                                            <div className="space-y-3 sm:space-y-4">
                                                {selectedGroup.assigned_students.map((student, index) => (
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
                                                                    <span className="mr-2 text-sm text-gray-700">حاضر</span>
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
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                            <div className="text-sm text-gray-500 text-right order-2 sm:order-1">
                                                المجموع: {selectedGroup.assigned_students.length} طالب
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
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب</h3>
                                        <p className="mt-1 text-sm text-gray-500">لم يتم تعيين أي طلاب لهذه المجموعة بعد.</p>
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
