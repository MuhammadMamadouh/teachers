import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, Users, Star, Crown, Gift, Shield } from 'lucide-react';

export default function Register({ governorates = [], plans = [], selectedPlan = null, centerTypes = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        subject: '',
        governorate_id: '',
        plan_id: selectedPlan ? selectedPlan.id.toString() : '',
        center_name: '',
        center_type: 'individual',
        center_address: '',
        is_teacher: true, // Default to true, will be managed based on center type
    });
    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div dir="rtl">
            {/* Announcement about upcoming center plans */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-900 text-center">
                <strong>قريباً:</strong> سيتم إطلاق خطط جديدة للمراكز التعليمية لتناسب احتياجاتكم بشكل أفضل!
            </div>
            <GuestLayout>
                <Head title="إنشاء حساب جديد - انضم لمنصة المعلمين" />

                {selectedPlan && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Star className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                            <div className="mr-3">
                                <h4 className="text-sm font-semibold text-green-900">
                                    ✨ تم اختيار خطة: {selectedPlan.name}
                                </h4>
                                <p className="text-sm text-green-700">
                                    اختيار ممتاز! يمكنك تغييره أدناه إذا رغبت في ذلك
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    {/* Center Information Section - FIRST */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Users className="w-5 h-5 text-green-600 ml-2" />
                            معلومات المركز التعليمي
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="center_name" value="اسم المركز" />
                                <TextInput
                                    id="center_name"
                                    name="center_name"
                                    value={data.center_name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('center_name', e.target.value)}
                                    required
                                    placeholder="مثال: مركز أحمد للرياضيات"
                                    isFocused={true}
                                />
                                <InputError message={errors.center_name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="center_type" value="نوع المركز" />
                                <select
                                    id="center_type"
                                    name="center_type"
                                    value={data.center_type}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-right"
                                    onChange={(e) => {
                                        const centerType = e.target.value;
                                        setData('center_type', centerType);

                                        // Auto-set teacher status based on center type
                                        if (centerType === 'individual') {
                                            setData('is_teacher', true);
                                            // Don't clear subject for individual centers as they need it
                                        } else if (centerType === 'organization') {
                                            // For organizations, default to false (admin only)
                                            setData('is_teacher', false);
                                            setData('subject', ''); // Clear subject since not teaching by default
                                        }
                                    }}
                                    required
                                >
                                    {centerTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.center_type} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="governorate_id" value="المحافظة" />
                                <select
                                    id="governorate_id"
                                    name="governorate_id"
                                    value={data.governorate_id}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-right"
                                    onChange={(e) => setData('governorate_id', e.target.value)}
                                    required
                                >
                                    <option value="">اختر المحافظة</option>
                                    {governorates.map((governorate) => (
                                        <option key={governorate.id} value={governorate.id}>
                                            {governorate.name_ar}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.governorate_id} className="mt-2" />
                            </div>
                            <div className="">
                                <InputLabel htmlFor="center_address" value="عنوان المركز" />
                                <TextInput
                                    id="center_address"
                                    name="center_address"
                                    value={data.center_address}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('center_address', e.target.value)}
                                    placeholder=""
                                />
                                <InputError message={errors.center_address} className="mt-2" />
                            </div>


                        </div>

                        <div className="mt-4 p-3 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>نصيحة:</strong> {' '}
                                {data.center_type === 'individual'
                                    ? 'للمراكز الفردية، يمكنك استخدام اسمك مع المادة (مثل: مركز أحمد للرياضيات). ستكون معلماً ومالك المركز تلقائياً.'
                                    : 'للمؤسسات التعليمية، استخدم اسم المركز أو المدرسة الرسمي. يمكنك اختيار إذا كنت ستدرس أيضاً أم ستكتفي بالإدارة فقط.'
                                }
                            </p>
                        </div>

                        {/* Show teacher checkbox only for organization centers */}
                        {data.center_type === 'organization' && (
                            <div className="mt-4">
                                <div className="flex items-center">
                                    <input
                                        id="is_teacher"
                                        name="is_teacher"
                                        type="checkbox"
                                        checked={data.is_teacher}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setData('is_teacher', isChecked);
                                            // Clear subject if unchecking teacher role
                                            if (!isChecked) {
                                                setData('subject', '');
                                            }
                                        }}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ml-3"
                                    />
                                    <InputLabel htmlFor="is_teacher" value="أنا معلم أيضاً" className="cursor-pointer" />
                                </div>
                                <p className="text-sm text-gray-600 mt-1 mr-7">
                                    إذا كنت ستقوم بالتدريس بنفسك بالإضافة لإدارة المؤسسة، اختر هذا الخيار
                                </p>
                                <InputError message={errors.is_teacher} className="mt-2" />
                            </div>
                        )}

                        {/* Informational message for individual centers */}
                        {data.center_type === 'individual' && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                            <Users className="w-3 h-3 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="mr-2">
                                        <p className="text-sm text-blue-800">
                                            <strong>مركز فردي:</strong> ستكون معلماً ومالك المركز تلقائياً. يمكنك إضافة مساعدين حسب خطتك.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Personal Information Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Users className="w-5 h-5 text-indigo-600 ml-2" />
                            المعلومات الشخصية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="الاسم الكامل" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    autoComplete="name"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="مثال: أحمد محمد علي"
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="رقم الهاتف" />
                                <TextInput
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    value={data.phone}
                                    className="mt-1 block w-full"
                                    autoComplete="tel"
                                    onChange={(e) => setData('phone', e.target.value)}
                                    required
                                    placeholder="مثال: 01012345678"
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    placeholder="مثال: ahmed@example.com"
                                />
                                <InputError message={errors.email} className="mt-2" />
                            </div>
                        </div>

                        {/* Teacher-specific information - only show if user is a teacher */}
                        {data.is_teacher && (
                            <div className="mt-4">
                                <InputLabel htmlFor="subject" value="المادة التي تدرسها" />
                                <TextInput
                                    id="subject"
                                    type="text"
                                    name="subject"
                                    value={data.subject}
                                    className="mt-1 block w-full"
                                    placeholder="مثال: رياضيات، لغة عربية، فيزياء، تحفيظ قرآن"
                                    onChange={(e) => setData('subject', e.target.value)}
                                    required={data.is_teacher}
                                />
                                <InputError message={errors.subject} className="mt-2" />
                            </div>
                        )}
                    </div>

                    {/* Security Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 text-indigo-600 ml-2" />
                            كلمة المرور وتأمين الحساب
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="password" value="كلمة المرور" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    placeholder="أدخل كلمة مرور قوية"
                                />
                                <InputError message={errors.password} className="mt-2" />
                                <p className="text-xs text-gray-500 mt-1">
                                    يجب أن تحتوي على 8 أحرف على الأقل
                                </p>
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password_confirmation"
                                    value="تأكيد كلمة المرور"
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    required
                                    placeholder="أعد إدخال كلمة المرور"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Plan Selection Section */}
                    {plans.length > 0 && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-indigo-600 ml-2" />
                                    اختر خطة الاشتراك المناسبة لك
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    اختر الخطة التي تناسب عدد طلابك واحتياجاتك التعليمية. يمكنك ترقية خطتك في أي وقت.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {plans.map((plan) => {
                                    const isSelected = data.plan_id === plan.id.toString();
                                    const isPopular = plan.is_default;
                                    const isTrial = plan.is_trial;

                                    // Enhanced feature list
                                    const planFeatures = [
                                        { icon: Users, text: `حتى ${plan.max_students} طالب` },
                                        {
                                            icon: Shield,
                                            text: plan.max_assistants > 0 ? `${plan.max_assistants} مساعد${plan.max_assistants > 1 ? 'ين' : ''}` : 'بدون مساعدين'
                                        },
                                        { icon: CheckCircle, text: 'إدارة المجموعات والحصص' },
                                        { icon: CheckCircle, text: 'تتبع الحضور والغياب' },
                                        { icon: CheckCircle, text: 'إدارة المدفوعات والرسوم' },
                                        { icon: CheckCircle, text: 'تقارير شاملة ومفصلة' },
                                    ];

                                    return (
                                        <div
                                            key={plan.id}
                                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${isSelected
                                                ? 'border-indigo-500 bg-white shadow-xl ring-4 ring-indigo-100'
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                                                }`}
                                            onClick={() => setData('plan_id', plan.id.toString())}
                                        >
                                            {/* Popular Badge */}
                                            {isPopular && !isTrial && (
                                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                        ⭐ شائع
                                                    </div>
                                                </div>
                                            )}

                                            {/* Trial Badge */}
                                            {isTrial && (
                                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                        🎁 مجاني
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start" dir="rtl">
                                                <input
                                                    type="radio"
                                                    id={`plan_${plan.id}`}
                                                    name="plan_id"
                                                    value={plan.id}
                                                    checked={isSelected}
                                                    onChange={(e) => setData('plan_id', e.target.value)}
                                                    className="mt-1 text-indigo-600 border-gray-300 focus:ring-indigo-500 h-4 w-4 ml-2"
                                                />
                                                <div className="flex-1">
                                                    {/* Plan Header */}
                                                    <div className="mb-3">
                                                        <h4 className="text-lg font-bold text-gray-900 text-right leading-tight">{plan.name}</h4>
                                                    </div>

                                                    {/* Plan Pricing */}
                                                    <div className="mb-3 text-center">
                                                        {isTrial ? (
                                                            <div>
                                                                <div className="text-xl font-bold text-green-600">مجاني</div>
                                                                <div className="text-xs text-gray-500">لمدة {plan.duration_days} يوم</div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div className="flex items-baseline justify-center">
                                                                    <span className="text-sm text-gray-500 ml-1">ج.م</span>
                                                                    <span className="text-l font-bold text-gray-900">{plan.price}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {plan.duration_days >= 365 ? 'سنوياً' :
                                                                        plan.duration_days >= 90 ? 'ربع سنوي' : 'شهرياً'}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Plan Features - Compact */}
                                                    <div className="space-y-2">
                                                        {planFeatures.map((feature, index) => (
                                                            <div key={index} className="flex items-center text-right">
                                                                <feature.icon className="w-3 h-3 text-green-500 ml-1 flex-shrink-0" />
                                                                <span className="text-gray-700 text-xs">{feature.text}</span>
                                                            </div>
                                                        ))}
                                                        {/* {planFeatures.length > 3 && (
                                                            <div className="text-xs text-gray-500 italic text-right">
                                                                + {planFeatures.length - 3} ميزة أخرى
                                                            </div>
                                                        )} */}
                                                    </div>

                                                    {/* Plan Benefits */}
                                                    {isTrial && (
                                                        <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
                                                            <div className="flex items-center text-right">
                                                                <Gift className="w-3 h-3 text-green-600 ml-1" />
                                                                <span className="text-xs text-green-800 font-medium">
                                                                    ابدأ مجاناً!
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <InputError message={errors.plan_id} className="mt-4" />

                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-blue-600" />
                                        </div>
                                    </div>
                                    <div className="mr-2">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-1 text-right">
                                            💡 نصائح سريعة:
                                        </h4>
                                        <ul className="text-xs text-blue-800 space-y-1 text-right">
                                            <li>• ابدأ بالخطة التجريبية المجانية</li>
                                            <li>• اختر حسب عدد الطلاب الحالي</li>
                                            <li>• يمكنك الترقية في أي وقت</li>
                                            <li>• دعم فني مجاني لجميع الخطط</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Submit Section */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">جاهز للبدء؟</h3>
                            <p className="text-indigo-100 mb-6">
                                انضم إلى آلاف المعلمين الذين يستخدمون نظامنا لتنظيم تعليمهم
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <PrimaryButton
                                    className="w-full sm:w-autotext-indigo-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 ml-2"></div>
                                            جاري إنشاء الحساب...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 ml-2" />
                                            إنشاء حساب جديد
                                        </div>
                                    )}
                                </PrimaryButton>

                                <Link
                                    href={route('login')}
                                    className="text-indigo-100 hover:text-white underline text-sm transition-colors duration-200"
                                >
                                    لديك حساب بالفعل؟ سجل دخولك
                                </Link>
                            </div>

                            <div className="mt-4 text-xs text-indigo-200">
                                بإنشاء الحساب، أنت توافق على شروط الخدمة وسياسة الخصوصية
                            </div>
                        </div>
                    </div>
                </form>
            </GuestLayout>
        </div>
    );
}
