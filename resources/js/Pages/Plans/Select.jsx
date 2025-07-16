import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function PlanSelection({ plans, currentPlan, isUpgrade = false }) {
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [selectedCategory, setSelectedCategory] = useState('individual');

    const { setData, post, processing } = useForm({
        plan_id: currentPlan?.id || null,
        billing_cycle: 'monthly',
    });

    const handlePlanSelect = (plan) => {
        setData('plan_id', plan.id);
        setData('billing_cycle', billingCycle);
        
        if (isUpgrade) {
            post(route('center.subscription.upgrade.process'));
        } else {
            post(route('subscription.subscribe'));
        }
    };

    const formatPrice = (plan) => {
        const price = billingCycle === 'yearly' ? plan.monthly_equivalent : plan.price;
        return price.toFixed(2);
    };

    const getOriginalYearlyPrice = (plan) => {
        return (plan.price * 12).toFixed(2);
    };

    const getSavingsAmount = (plan) => {
        if (billingCycle === 'yearly' && plan.yearly_discount_percentage > 0) {
            return plan.yearly_savings.toFixed(2);
        }
        return 0;
    };

    const individualPlans = plans.filter(plan => plan.category === 'individual');
    const multiTeacherPlans = plans.filter(plan => plan.category === 'multi_teacher');

    const PlanCard = ({ plan, isPopular = false }) => (
        <div className={`relative bg-white rounded-xl shadow-lg ${isPopular ? 'ring-2 ring-blue-500' : ''} transition-all duration-300 hover:shadow-xl`}>
            {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                        <StarIcon className="h-4 w-4 mr-1" />
                        الأكثر شعبية
                    </span>
                </div>
            )}
            
            <div className="p-6">
                {/* Plan Header */}
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{plan.target_audience}</p>
                    
                    <div className="flex items-center justify-center space-x-1">
                        <span className="text-4xl font-bold text-gray-900">
                            {formatPrice(plan)}
                        </span>
                        <span className="text-xl text-gray-600">ر.س</span>
                        <span className="text-sm text-gray-500">
                            /{billingCycle === 'yearly' ? 'شهر' : 'شهر'}
                        </span>
                    </div>
                    
                    {billingCycle === 'yearly' && plan.yearly_discount_percentage > 0 && (
                        <div className="mt-2">
                            <span className="text-sm text-gray-500 line-through">
                                {getOriginalYearlyPrice(plan)} ر.س/سنة
                            </span>
                            <span className="text-sm text-green-600 font-medium mr-2">
                                وفر {getSavingsAmount(plan)} ر.س
                            </span>
                        </div>
                    )}
                </div>

                {/* Plan Limits */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-blue-600">{plan.max_students}</div>
                        <div className="text-xs text-gray-600">طالب</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-green-600">{plan.max_teachers}</div>
                        <div className="text-xs text-gray-600">معلم</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-2xl font-bold text-purple-600">{plan.max_assistants}</div>
                        <div className="text-xs text-gray-600">مساعد</div>
                    </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">المميزات:</h4>
                    <ul className="space-y-2">
                        {plan.features?.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-700">
                                <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                    {plan.is_trial ? (
                        <PrimaryButton
                            onClick={() => handlePlanSelect(plan)}
                            disabled={processing}
                            className="w-full justify-center"
                        >
                            {processing ? 'جاري التسجيل...' : 'ابدأ التجربة المجانية'}
                        </PrimaryButton>
                    ) : currentPlan?.id === plan.id ? (
                        <SecondaryButton className="w-full justify-center" disabled>
                            الخطة الحالية
                        </SecondaryButton>
                    ) : (
                        <PrimaryButton
                            onClick={() => handlePlanSelect(plan)}
                            disabled={processing}
                            className="w-full justify-center"
                        >
                            {processing ? 'جاري التحديث...' : isUpgrade ? 'ترقية إلى هذه الخطة' : 'اختر هذه الخطة'}
                        </PrimaryButton>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title={isUpgrade ? 'ترقية الخطة' : 'اختر خطتك'} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {isUpgrade ? 'ترقية خطة الاشتراك' : 'اختر الخطة المناسبة لك'}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        خطط مرنة تناسب احتياجاتك، من المعلم الفردي إلى المراكز الكبيرة
                    </p>
                </div>

                {/* Billing Cycle Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                billingCycle === 'monthly'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            شهري
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                billingCycle === 'yearly'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            سنوي
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full mr-1">
                                وفر 17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setSelectedCategory('individual')}
                            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                                selectedCategory === 'individual'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            خطط المعلم الفردي
                        </button>
                        <button
                            onClick={() => setSelectedCategory('multi_teacher')}
                            className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                                selectedCategory === 'multi_teacher'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:text-gray-900'
                            }`}
                        >
                            خطط المراكز
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selectedCategory === 'individual' ? (
                        individualPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isPopular={plan.is_featured}
                            />
                        ))
                    ) : (
                        multiTeacherPlans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                isPopular={plan.is_featured}
                            />
                        ))
                    )}
                </div>

                {/* Trial Plan */}
                {!isUpgrade && (
                    <div className="mt-12 max-w-md mx-auto">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-6 text-white text-center">
                            <h3 className="text-xl font-bold mb-2">ابدأ بالتجربة المجانية</h3>
                            <p className="text-sm opacity-90 mb-4">
                                جرب النظام لمدة 7 أيام مجاناً، بدون الحاجة لبطاقة ائتمان
                            </p>
                            <PrimaryButton
                                onClick={() => handlePlanSelect(plans.find(p => p.is_trial))}
                                disabled={processing}
                                className="bg-white text-blue-600 hover:bg-gray-100"
                            >
                                {processing ? 'جاري التسجيل...' : 'ابدأ التجربة المجانية'}
                            </PrimaryButton>
                        </div>
                    </div>
                )}

                {/* FAQ Section */}
                <div className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                        أسئلة شائعة
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                هل يمكنني تغيير الخطة لاحقاً؟
                            </h3>
                            <p className="text-gray-600 text-sm">
                                نعم، يمكنك ترقية أو تقليل خطتك في أي وقت، وسيتم تطبيق التغييرات فوراً.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                هل التجربة المجانية تتطلب بطاقة ائتمان؟
                            </h3>
                            <p className="text-gray-600 text-sm">
                                لا، التجربة المجانية لا تتطلب بطاقة ائتمان، ولن يتم خصم أي مبلغ.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                ما الفرق بين الخطط الفردية وخطط المراكز؟
                            </h3>
                            <p className="text-gray-600 text-sm">
                                الخطط الفردية مخصصة للمعلمين الذين يعملون بشكل منفرد، بينما خطط المراكز تدعم عدة معلمين.
                            </p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                هل يمكنني إلغاء الاشتراك في أي وقت؟
                            </h3>
                            <p className="text-gray-600 text-sm">
                                نعم، يمكنك إلغاء الاشتراك في أي وقت، وسيستمر حسابك نشطاً حتى نهاية فترة الاشتراك.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
