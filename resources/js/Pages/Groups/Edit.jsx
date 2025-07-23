import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Edit({ group, academicYears, teachers, educationLevels, defaultTeacherId, centerType }) {
    const { data, setData, put, processing, errors } = useForm({
        name: group.name || '',
        subject: group.subject || '',
        level: group.level || '',
        description: group.description || '',
        max_students: group.max_students || 10,
        is_active: group.is_active,
        payment_type: group.payment_type || 'monthly',
        student_price: group.student_price || 0,
        academic_year_id: group.academic_year_id || '',
        teacher_id: defaultTeacherId || group.user_id || '',
        schedules: []
    });

    const [selectedDays, setSelectedDays] = useState({});
    const [filteredAcademicYears, setFilteredAcademicYears] = useState([]);

    // Handle level change and filter academic years
    const handleLevelChange = (level) => {
        setData('level', level);
        
        // Only reset academic year if it doesn't match the new level
        if (level && academicYears && academicYears[level]) {
            setFilteredAcademicYears(academicYears[level]);
            
            // Check if current academic year is still valid for the new level
            const currentAcademicYear = academicYears[level].find(year => year.id.toString() === data.academic_year_id);
            if (!currentAcademicYear) {
                setData('academic_year_id', '');
            }
        } else {
            setFilteredAcademicYears([]);
            setData('academic_year_id', '');
        }
    };

    // Initialize filtered academic years on component mount
    useEffect(() => {
        if (data.level && academicYears && academicYears[data.level]) {
            setFilteredAcademicYears(academicYears[data.level]);
        }
    }, [data.level, academicYears]);

    const days = [
        { value: 0, label: 'الأحد' },
        { value: 1, label: 'الاثنين' },
        { value: 2, label: 'الثلاثاء' },
        { value: 3, label: 'الأربعاء' },
        { value: 4, label: 'الخميس' },
        { value: 5, label: 'الجمعة' },
        { value: 6, label: 'السبت' },
    ];

    // Initialize selected days from existing schedules
    useEffect(() => {
        if (group.schedules && group.schedules.length > 0) {
            const initialSelectedDays = {};
            group.schedules.forEach(schedule => {
                initialSelectedDays[schedule.day_of_week] = {
                    day_of_week: schedule.day_of_week,
                    start_time: schedule.start_time.substring(0, 5), // Remove seconds
                    end_time: schedule.end_time.substring(0, 5) // Remove seconds
                };
            });
            setSelectedDays(initialSelectedDays);
            setData('schedules', Object.values(initialSelectedDays));
        }
    }, [group.schedules, setData]);

    const handleDayChange = (dayValue, checked) => {
        const newSelectedDays = { ...selectedDays };
        
        if (checked) {
            newSelectedDays[dayValue] = {
                day_of_week: dayValue,
                start_time: '08:00',
                end_time: '10:00'
            };
        } else {
            delete newSelectedDays[dayValue];
        }
        
        setSelectedDays(newSelectedDays);
        setData('schedules', Object.values(newSelectedDays));
    };

    const handleTimeChange = (dayValue, field, value) => {
        const newSelectedDays = { ...selectedDays };
        if (newSelectedDays[dayValue]) {
            newSelectedDays[dayValue][field] = value;
            setSelectedDays(newSelectedDays);
            setData('schedules', Object.values(newSelectedDays));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('groups.update', group.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    تعديل المجموعة: {group.name}
                </h2>
            }
        >
            <Head title={`تعديل المجموعة: ${group.name}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="space-y-6">
                                {/* Group Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        اسم المجموعة *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                    {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                                </div>

                                {/* Subject */}
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                                        المادة
                                    </label>
                                    <input
                                        id="subject"
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="مثال: الرياضيات، العلوم، اللغة العربية"
                                    />
                                    {errors.subject && <div className="text-red-600 text-sm mt-1">{errors.subject}</div>}
                                </div>

                                {/* Level */}
                                <div>
                                    <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                                        المستوى التعليمي *
                                    </label>
                                    <select
                                        id="level"
                                        value={data.level}
                                        onChange={(e) => handleLevelChange(e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="">اختر المستوى</option>
                                        {educationLevels?.map((level) => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.level && <div className="text-red-600 text-sm mt-1">{errors.level}</div>}
                                </div>

                                {/* Teacher Selection - Only show if multiple teachers available */}
                                {teachers && teachers.length > 1 && (
                                    <div>
                                        <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">
                                            المعلم المسؤول *
                                        </label>
                                        <select
                                            id="teacher_id"
                                            value={data.teacher_id}
                                            onChange={(e) => setData('teacher_id', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            required
                                        >
                                            <option value="">اختر المعلم</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.name} {teacher.subject ? `- ${teacher.subject}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.teacher_id && <div className="text-red-600 text-sm mt-1">{errors.teacher_id}</div>}
                                    </div>
                                )}

                                {/* Display selected teacher for individual centers */}
                                {centerType === 'individual' && teachers && teachers.length === 1 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            المعلم المسؤول
                                        </label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <p className="text-sm text-gray-900">
                                                {teachers[0].name} {teachers[0].subject ? `- ${teachers[0].subject}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        الوصف
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description}</div>}
                                </div>

                                {/* Academic Year */}
                                <div>
                                    <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-700">
                                        الصف الدراسي *
                                    </label>
                                    <select
                                        id="academic_year_id"
                                        value={data.academic_year_id}
                                        onChange={(e) => setData('academic_year_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                        disabled={!data.level}
                                    >
                                        <option value="">
                                            {data.level ? 'اختر الصف الدراسي' : 'اختر المستوى التعليمي أولاً'}
                                        </option>
                                        {filteredAcademicYears.map((year) => (
                                            <option key={year.id} value={year.id}>
                                                {year.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.academic_year_id && <div className="text-red-600 text-sm mt-1">{errors.academic_year_id}</div>}
                                    {data.level && filteredAcademicYears.length === 0 && (
                                        <div className="text-amber-600 text-sm mt-1">
                                            لا توجد صفوف دراسية متاحة لهذا المستوى
                                        </div>
                                    )}
                                </div>

                                {/* Max Students */}
                                <div>
                                    <label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                                        الحد الأقصى للطلاب *
                                    </label>
                                    <input
                                        id="max_students"
                                        type="number"
                                        min="1"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', parseInt(e.target.value))}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    />
                                    {errors.max_students && <div className="text-red-600 text-sm mt-1">{errors.max_students}</div>}
                                </div>

                                {/* Payment Type */}
                                <div>
                                    <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700">
                                        نوع الدفع *
                                    </label>
                                    <select
                                        id="payment_type"
                                        value={data.payment_type}
                                        onChange={(e) => setData('payment_type', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                    >
                                        <option value="monthly">شهري</option>
                                        <option value="per_session">بالجلسة</option>
                                    </select>
                                    {errors.payment_type && <div className="text-red-600 text-sm mt-1">{errors.payment_type}</div>}
                                </div>

                                {/* Student Price */}
                                <div>
                                    <label htmlFor="student_price" className="block text-sm font-medium text-gray-700">
                                        سعر الطالب (جنيه مصري) *
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            id="student_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.student_price}
                                            onChange={(e) => setData('student_price', parseFloat(e.target.value) || 0)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pl-12"
                                            placeholder="0.00"
                                            required
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">ج.م</span>
                                        </div>
                                    </div>
                                    {errors.student_price && <div className="text-red-600 text-sm mt-1">{errors.student_price}</div>}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {data.payment_type === 'monthly' 
                                            ? 'المبلغ الذي يدفعه كل طالب شهرياً' 
                                            : 'المبلغ الذي يدفعه كل طالب عن كل جلسة حضور'
                                        }
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">المجموعة نشطة</span>
                                    </label>
                                </div>

                                {/* Schedule */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        الجدول الأسبوعي * (اختر على الأقل يوم واحد)
                                    </label>
                                    <div className="space-y-4">
                                        {days.map((day) => (
                                            <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center mb-3">
                                                    <input
                                                        type="checkbox"
                                                        id={`day_${day.value}`}
                                                        checked={!!selectedDays[day.value]}
                                                        onChange={(e) => handleDayChange(day.value, e.target.checked)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor={`day_${day.value}`} className="ml-2 text-sm font-medium text-gray-700">
                                                        {day.label}
                                                    </label>
                                                </div>
                                                
                                                {selectedDays[day.value] && (
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                وقت البداية
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={selectedDays[day.value].start_time}
                                                                onChange={(e) => handleTimeChange(day.value, 'start_time', e.target.value)}
                                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                وقت النهاية
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={selectedDays[day.value].end_time}
                                                                onChange={(e) => handleTimeChange(day.value, 'end_time', e.target.value)}
                                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.schedules && <div className="text-red-600 text-sm mt-1">{errors.schedules}</div>}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end space-x-4">
                                    <a
                                        href={route('groups.index')}
                                        className="text-gray-600 hover:text-gray-800 text-sm font-medium  ml-2 mr-2"
                                    >
                                        إلغاء
                                    </a>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    >
                                        {processing ? 'جاري التحديث...' : 'تحديث المجموعة'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
