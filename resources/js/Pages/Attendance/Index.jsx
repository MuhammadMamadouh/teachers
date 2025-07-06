import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ groups, selectedGroup, selectedDate, attendances }) {
    const [localSelectedGroup, setLocalSelectedGroup] = useState(selectedGroup?.id || '');
    const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate);
    
    const { data, setData, post, processing, errors } = useForm({
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
        post(route('attendance.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    تسجيل الحضور
                </h2>
            }
        >
            <Head title="تسجيل الحضور" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Group and Date Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label htmlFor="group_select" className="block text-sm font-medium text-gray-700 mb-2">
                                        اختر المجموعة
                                    </label>
                                    <select
                                        id="group_select"
                                        value={localSelectedGroup}
                                        onChange={(e) => handleGroupChange(e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                                    <label htmlFor="date_select" className="block text-sm font-medium text-gray-700 mb-2">
                                        اختر التاريخ
                                    </label>
                                    <input
                                        id="date_select"
                                        type="date"
                                        value={localSelectedDate}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {selectedGroup && selectedGroup.assigned_students ? (
                                selectedGroup.assigned_students.length > 0 ? (
                                    <form onSubmit={submit}>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                قائمة طلاب {selectedGroup.name} - {new Date(selectedDate).toLocaleDateString('ar-SA')}
                                            </h3>
                                            
                                            <div className="space-y-4">
                                                {selectedGroup.assigned_students.map((student, index) => (
                                                    <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                                        <span className="text-sm font-medium text-gray-600">
                                                                            {student.name.charAt(0)}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-sm font-medium text-gray-900">{student.name}</h4>
                                                                    <p className="text-sm text-gray-500">{student.phone}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center space-x-6">
                                                                <label className="flex items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={data.attendances[index]?.is_present || false}
                                                                        onChange={(e) => handleAttendanceChange(index, 'is_present', e.target.checked)}
                                                                        className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
                                                                    />
                                                                    <span className="ml-2 text-sm text-gray-700">حاضر</span>
                                                                </label>
                                                                
                                                                <input
                                                                    type="text"
                                                                    placeholder="ملاحظات (اختياري)"
                                                                    value={data.attendances[index]?.notes || ''}
                                                                    onChange={(e) => handleAttendanceChange(index, 'notes', e.target.value)}
                                                                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                المجموع: {selectedGroup.assigned_students.length} طالب
                                                {data.attendances && (
                                                    <span className="ml-4">
                                                        الحاضرين: {data.attendances.filter(a => a.is_present).length}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                            >
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
