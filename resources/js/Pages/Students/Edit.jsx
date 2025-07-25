import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ student, groups, academicYears, teachers, educationLevels }) {
    const { data, setData, put, processing, errors } = useForm({
        name: student.name,
        phone: student.phone,
        guardian_phone: student.guardian_phone,
        level: student.level || '',
        academic_year_id: student.academic_year_id || '',
        teacher_id: student.group?.teacher?.id || '',
        group_id: student.group_id || '',
    });

    // Filter academic years based on selected level
    const filteredAcademicYears = data.level && academicYears[data.level] ? academicYears[data.level] : [];

    // Filter groups based on selected academic year, teacher, and level
    const filteredGroups = groups ? groups.filter(group => {
        const academicYearMatch = !data.academic_year_id || group.academic_year_id == data.academic_year_id;
        const teacherMatch = !data.teacher_id || group.user_id == data.teacher_id;
        const levelMatch = !data.level || group.level === data.level;
        return academicYearMatch && teacherMatch && levelMatch;
    }) : [];

    const handleLevelChange = (level) => {
        setData(prevData => ({
            ...prevData,
            level: level,
            academic_year_id: '', // Reset academic year when level changes
            group_id: '' // Reset group when level changes
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        put(route('students.update', student.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        تعديل الطالب: {student.name}
                    </h2>
                    <Link
                        href={route('students.index')}
                        className="rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                        العودة للطلاب
                    </Link>
                </div>
            }
        >
            <Head title={`تعديل ${student.name}`} />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Student Information */}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="name" value="اسم الطالب" />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full"
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="phone" value="هاتف الطالب" />
                                        <TextInput
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={data.phone}
                                            className="mt-1 block w-full"
                                            autoComplete="tel"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="level" value="المستوى التعليمي" />
                                        <select
                                            id="level"
                                            name="level"
                                            value={data.level}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            onChange={(e) => handleLevelChange(e.target.value)}
                                            required
                                        >
                                            <option value="">اختر المستوى</option>
                                            {educationLevels?.map((level) => (
                                                <option key={level.value} value={level.value}>
                                                    {level.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.level} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="academic_year_id" value="الصف الدراسي" />
                                        <select
                                            id="academic_year_id"
                                            name="academic_year_id"
                                            value={data.academic_year_id}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            onChange={(e) => {
                                                setData('academic_year_id', e.target.value);
                                                // Reset group selection when academic year changes
                                                if (data.group_id) {
                                                    setData('group_id', '');
                                                }
                                            }}
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
                                        <InputError message={errors.academic_year_id} className="mt-2" />
                                        {data.level && filteredAcademicYears.length === 0 && (
                                            <div className="text-amber-600 text-sm mt-1">
                                                لا توجد صفوف دراسية متاحة لهذا المستوى
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="teacher_id" value="المعلم" />
                                        <select
                                            id="teacher_id"
                                            name="teacher_id"
                                            value={data.teacher_id}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            onChange={(e) => {
                                                setData('teacher_id', e.target.value);
                                                // Reset group selection when teacher changes
                                                if (data.group_id) {
                                                    setData('group_id', '');
                                                }
                                            }}
                                        >
                                            <option value="">اختر المعلم (اختياري)</option>
                                            {teachers && teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.id}>
                                                    {teacher.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.teacher_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="group_id" value="المجموعة" />
                                        <select
                                            id="group_id"
                                            name="group_id"
                                            value={data.group_id}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            onChange={(e) => setData('group_id', e.target.value)}
                                            disabled={!data.academic_year_id}
                                        >
                                            <option value="">اختر المجموعة (اختياري)</option>
                                            {filteredGroups.map((group) => (
                                                <option key={group.id} value={group.id}>
                                                    {group.name}
                                                    {group.academic_year && ` - ${group.academic_year.name_ar}`}
                                                    {group.teacher && ` - ${group.teacher.name}`}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.group_id} className="mt-2" />
                                        {!data.academic_year_id && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                يرجى اختيار الصف الدراسي أولاً
                                            </p>
                                        )}
                                        {filteredGroups.length === 0 && data.academic_year_id && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                لا توجد مجموعات متاحة للصف الدراسي {data.teacher_id ? 'والمعلم ' : ''}المحدد
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Guardian Information */}
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">معلومات ولي الأمر</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                                        <div>
                                            <InputLabel htmlFor="guardian_phone" value="هاتف ولي الأمر" />
                                            <TextInput
                                                id="guardian_phone"
                                                type="tel"
                                                name="guardian_phone"
                                                value={data.guardian_phone}
                                                className="mt-1 block w-full"
                                                autoComplete="tel"
                                                onChange={(e) => setData('guardian_phone', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.guardian_phone} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href={route('students.index')}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        إلغاء
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'جاري التحديث...' : 'تحديث الطالب'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
