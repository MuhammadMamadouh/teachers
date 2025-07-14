import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ academicYears }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        max_students: 10,
        is_active: true,
        payment_type: 'monthly',
        student_price: 0,
        academic_year_id: '',
        schedules: []
    });

    const [selectedDays, setSelectedDays] = useState({});

    const days = [
        { value: 0, label: 'الأحد' },
        { value: 1, label: 'الاثنين' },
        { value: 2, label: 'الثلاثاء' },
        { value: 3, label: 'الأربعاء' },
        { value: 4, label: 'الخميس' },
        { value: 5, label: 'الجمعة' },
        { value: 6, label: 'السبت' },
    ];

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
        post(route('groups.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    إضافة مجموعة جديدة
                </h2>
            }
        >
            <Head title="إضافة مجموعة جديدة" />

            <div className="py-12" dir="rtl">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            <div className="space-y-6">
                                {/* Group Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right">
                                        اسم المجموعة *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                                        required
                                    />
                                    {errors.name && <div className="text-red-600 text-sm mt-1 text-right">{errors.name}</div>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-right">
                                        الوصف
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                                    />
                                    {errors.description && <div className="text-red-600 text-sm mt-1 text-right">{errors.description}</div>}
                                </div>

                                {/* Academic Year */}
                                <div>
                                    <label htmlFor="academic_year_id" className="block text-sm font-medium text-gray-700 text-right">
                                        الصف الدراسي *
                                    </label>
                                    <select
                                        id="academic_year_id"
                                        value={data.academic_year_id}
                                        onChange={(e) => setData('academic_year_id', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                                        required
                                    >
                                        <option value="">اختر الصف الدراسي</option>
                                        {academicYears && academicYears.map((year) => (
                                            <option key={year.id} value={year.id}>
                                                {year.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.academic_year_id && <div className="text-red-600 text-sm mt-1 text-right">{errors.academic_year_id}</div>}
                                </div>

                                {/* Max Students */}
                                <div>
                                    <label htmlFor="max_students" className="block text-sm font-medium text-gray-700 text-right">
                                        الحد الأقصى للطلاب *
                                    </label>
                                    <input
                                        id="max_students"
                                        type="number"
                                        min="1"
                                        value={data.max_students}
                                        onChange={(e) => setData('max_students', parseInt(e.target.value))}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                                        required
                                    />
                                    {errors.max_students && <div className="text-red-600 text-sm mt-1 text-right">{errors.max_students}</div>}
                                </div>

                                {/* Payment Type */}
                                <div>
                                    <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 text-right">
                                        نوع الدفع *
                                    </label>
                                    <select
                                        id="payment_type"
                                        value={data.payment_type}
                                        onChange={(e) => setData('payment_type', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
                                        required
                                    >
                                        <option value="monthly">شهري</option>
                                        <option value="per_session">بالجلسة</option>
                                    </select>
                                    {errors.payment_type && <div className="text-red-600 text-sm mt-1 text-right">{errors.payment_type}</div>}
                                </div>

                                {/* Student Price */}
                                <div>
                                    <label htmlFor="student_price" className="block text-sm font-medium text-gray-700 text-right">
                                        سعر الطالب (جنيه مصري) *
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            id="student_price"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={data.student_price}
                                            onChange={(e) => setData('student_price', parseFloat(e.target.value) || 0)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 pr-12 text-right"
                                            placeholder="0.00"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">ج.م</span>
                                        </div>
                                    </div>
                                    {errors.student_price && <div className="text-red-600 text-sm mt-1 text-right">{errors.student_price}</div>}
                                    <p className="mt-1 text-xs text-gray-500 text-right">
                                        {data.payment_type === 'monthly' 
                                            ? 'المبلغ الذي يدفعه كل طالب شهرياً' 
                                            : 'المبلغ الذي يدفعه كل طالب عن كل جلسة حضور'
                                        }
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="flex items-center text-right">
                                        <span className="mr-2 text-sm text-gray-700">المجموعة نشطة</span>
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ml-2 mr-2"
                                        />
                                    </label>
                                </div>

                                {/* Schedule */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
                                        الجدول الأسبوعي * (اختر على الأقل يوم واحد)
                                    </label>
                                    <div className="space-y-4">
                                        {days.map((day) => (
                                            <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center mb-3">
                                                    <label htmlFor={`day_${day.value}`} className="mr-2 text-sm font-medium text-gray-700">
                                                        {day.label}
                                                    </label>
                                                    <input
                                                        type="checkbox"
                                                        id={`day_${day.value}`}
                                                        checked={!!selectedDays[day.value]}
                                                        onChange={(e) => handleDayChange(day.value, e.target.checked)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 ml-2 mr-2"
                                                    />
                                                </div>
                                                
                                                {selectedDays[day.value] && (
                                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1 text-right">
                                                                وقت البداية
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={selectedDays[day.value].start_time}
                                                                onChange={(e) => handleTimeChange(day.value, 'start_time', e.target.value)}
                                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm text-right"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-600 mb-1 text-right">
                                                                وقت النهاية
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={selectedDays[day.value].end_time}
                                                                onChange={(e) => handleTimeChange(day.value, 'end_time', e.target.value)}
                                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm text-right"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.schedules && <div className="text-red-600 text-sm mt-1 text-right">{errors.schedules}</div>}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex items-center justify-start space-x-4 space-x-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    >
                                        {processing ? 'جاري الحفظ...' : 'حفظ المجموعة'}
                                    </button>
                                    <a
                                        href={route('groups.index')}
                                        className="text-gray-600 hover:text-gray-800 text-sm font-medium ml-2 mr-2"
                                    >
                                        إلغاء
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
