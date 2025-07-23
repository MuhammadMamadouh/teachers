<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EnhancedPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable foreign key checks temporarily
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Clear existing plans
        Plan::truncate();
        
        // Re-enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Individual Teacher Plans
        $individualPlans = [
            [
                'name' => 'المعلم الفردي - أساسي',
                'price' => 50,
                'yearly_price' => 500,
                'yearly_discount_percentage' => 17,
                'max_students' => 150,
                'max_teachers' => 1,
                'max_assistants' => 1,
                'duration_days' => 30,
                'plan_type' => 'individual',
                'category' => 'individual',
                'target_audience' => 'معلم واحد',
                'is_featured' => false,
                'sort_order' => 1,
                'billing_cycle' => 'monthly',
                'features' => [
                    'إدارة حتى 150 طالب',
                    'تقارير متقدمة',
                    'دعم فني أساسي',

                ],
                'is_trial' => false,
                'is_default' => false,
            ],
            [
                'name' => 'المعلم الفردي - متقدم',
                'price' => 100,
                'yearly_price' => 1000,
                'yearly_discount_percentage' => 17,
                'max_students' => 300,
                'max_teachers' => 1,
                'max_assistants' => 1,
                'duration_days' => 30,
                'plan_type' => 'individual',
                'category' => 'individual',
                'target_audience' => 'معلم واحد',
                'is_featured' => true,
                'sort_order' => 2,
                'billing_cycle' => 'monthly',
                'features' => [
                    'إدارة حتى 300 طالب',
                    'معلم واحد + 1 مساعد',
                    'تقارير متقدمة',
                    'دعم فني أساسي',


                ],
                'is_trial' => false,
                'is_default' => true,
            ],
            [
                'name' => 'المعلم الفردي - احترافي',
                'price' => 250,
                'yearly_price' => 1499.99,
                'yearly_discount_percentage' => 17,
                'max_students' => 500,
                'max_teachers' => 1,
                'max_assistants' => 2,
                'duration_days' => 30,
                'plan_type' => 'individual',
                'category' => 'individual',
                'target_audience' => 'معلم واحد',
                'is_featured' => false,
                'sort_order' => 3,
                'billing_cycle' => 'monthly',
                'features' => [
                    'إدارة حتى 500 طالب',
                    'معلم واحد + 2 مساعد',

                ],
                'is_trial' => false,
                'is_default' => false,
            ],
            [
                'name' => 'المعلم الفردي - أسطوري',
                'price' => 500,
                'yearly_price' => 1499.99,
                'yearly_discount_percentage' => 17,
                'max_students' => 1000,
                'max_teachers' => 1,
                'max_assistants' => 3,
                'duration_days' => 30,
                'plan_type' => 'individual',
                'category' => 'individual',
                'target_audience' => 'معلم واحد',
                'is_featured' => false,
                'sort_order' => 3,
                'billing_cycle' => 'monthly',
                'features' => [
                    'إدارة حتى 1000 طالب',
                    'معلم واحد + 3 مساعد',
   
                ],
                'is_trial' => false,
                'is_default' => false,
            ],
        ];

        // Multi-Teacher Plans (Centers)
        // $multiTeacherPlans = [
        //     [
        //         'name' => 'المراكز الصغيرة - أساسي',
        //         'price' => 199.99,
        //         'yearly_price' => 1999.99,
        //         'yearly_discount_percentage' => 17,
        //         'max_students' => 100,
        //         'max_teachers' => 3,
        //         'max_assistants' => 5,
        //         'duration_days' => 30,
        //         'plan_type' => 'multi_teacher',
        //         'category' => 'multi_teacher',
        //         'target_audience' => 'مراكز صغيرة',
        //         'is_featured' => false,
        //         'sort_order' => 4,
        //         'billing_cycle' => 'monthly',
        //         'features' => [
        //             'إدارة حتى 100 طالب',
        //             'حتى 3 معلمين',
        //             'حتى 5 مساعدين',
        //             'إدارة متعددة المعلمين',
        //             'تقارير أساسية',
        //             'دعم فني أساسي',
        //             'النسخ الاحتياطي اليومي',
        //             'تطبيق الجوال'
        //         ],
        //         'is_trial' => false,
        //         'is_default' => false,
        //     ],
        //     [
        //         'name' => 'المراكز الصغيرة - متقدم',
        //         'price' => 299.99,
        //         'yearly_price' => 2999.99,
        //         'yearly_discount_percentage' => 17,
        //         'max_students' => 250,
        //         'max_teachers' => 5,
        //         'max_assistants' => 10,
        //         'duration_days' => 30,
        //         'plan_type' => 'multi_teacher',
        //         'category' => 'multi_teacher',
        //         'target_audience' => 'مراكز صغيرة',
        //         'is_featured' => true,
        //         'sort_order' => 5,
        //         'billing_cycle' => 'monthly',
        //         'features' => [
        //             'إدارة حتى 250 طالب',
        //             'حتى 5 معلمين',
        //             'حتى 10 مساعدين',
        //             'إدارة متعددة المعلمين',
        //             'تقارير متقدمة',
        //             'دعم فني متقدم',
        //             'النسخ الاحتياطي اليومي',
        //             'تطبيق الجوال',
        //             'تقارير مالية',
        //             'إشعارات SMS',
        //             'لوحة تحكم المدير'
        //         ],
        //         'is_trial' => false,
        //         'is_default' => false,
        //     ],
        //     [
        //         'name' => 'المراكز الكبيرة - احترافي',
        //         'price' => 499.99,
        //         'yearly_price' => 4999.99,
        //         'yearly_discount_percentage' => 17,
        //         'max_students' => 500,
        //         'max_teachers' => 10,
        //         'max_assistants' => 20,
        //         'duration_days' => 30,
        //         'plan_type' => 'multi_teacher',
        //         'category' => 'multi_teacher',
        //         'target_audience' => 'مراكز كبيرة',
        //         'is_featured' => false,
        //         'sort_order' => 6,
        //         'billing_cycle' => 'monthly',
        //         'features' => [
        //             'إدارة حتى 500 طالب',
        //             'حتى 10 معلمين',
        //             'حتى 20 مساعد',
        //             'إدارة متعددة المعلمين',
        //             'تقارير شاملة',
        //             'دعم فني احترافي',
        //             'النسخ الاحتياطي اليومي',
        //             'تطبيق الجوال',
        //             'تقارير مالية متقدمة',
        //             'إشعارات SMS',
        //             'لوحة تحكم المدير',
        //             'تكامل مع WhatsApp',
        //             'تقارير مخصصة',
        //             'API للتكامل',
        //             'دعم فني مخصص'
        //         ],
        //         'is_trial' => false,
        //         'is_default' => false,
        //     ],
        //     [
        //         'name' => 'المراكز الكبيرة - مؤسسي',
        //         'price' => 799.99,
        //         'yearly_price' => 7999.99,
        //         'yearly_discount_percentage' => 17,
        //         'max_students' => 1000,
        //         'max_teachers' => 25,
        //         'max_assistants' => 50,
        //         'duration_days' => 30,
        //         'plan_type' => 'multi_teacher',
        //         'category' => 'multi_teacher',
        //         'target_audience' => 'مراكز كبيرة',
        //         'is_featured' => false,
        //         'sort_order' => 7,
        //         'billing_cycle' => 'monthly',
        //         'features' => [
        //             'إدارة حتى 1000 طالب',
        //             'حتى 25 معلم',
        //             'حتى 50 مساعد',
        //             'إدارة متعددة المعلمين',
        //             'تقارير شاملة ومتقدمة',
        //             'دعم فني مؤسسي',
        //             'النسخ الاحتياطي اليومي',
        //             'تطبيق الجوال',
        //             'تقارير مالية متقدمة',
        //             'إشعارات SMS',
        //             'لوحة تحكم المدير',
        //             'تكامل مع WhatsApp',
        //             'تقارير مخصصة',
        //             'API للتكامل',
        //             'دعم فني مخصص 24/7',
        //             'تدريب مجاني للفريق',
        //             'استشارة تقنية'
        //         ],
        //         'is_trial' => false,
        //         'is_default' => false,
        //     ],
        // ];

        // Trial Plan
        $trialPlan = [
            'name' => 'تجربة مجانية',
            'price' => 0.00,
            'yearly_price' => 0.00,
            'yearly_discount_percentage' => 0,
            'max_students' => 50,
            'max_teachers' => 1,
            'max_assistants' => 0,
            'duration_days' => 30,
            'plan_type' => 'individual',
            'category' => 'individual',
            'target_audience' => 'معلم واحد',
            'is_featured' => false,
            'sort_order' => 0,
            'billing_cycle' => 'monthly',
            'features' => [
                'إدارة حتى 50 طلاب',
                'معلم واحد فقط',
                'تقارير أساسية',
                'دعم فني محدود',
                'تجربة لمدة 30 يوم'
            ],
            'is_trial' => true,
            'is_default' => false,
        ];

        // Create all plans
        $allPlans = array_merge([$trialPlan], $individualPlans
        // , $multiTeacherPlans
    );

        foreach ($allPlans as $planData) {
            Plan::create($planData);
        }

        $this->command->info('Enhanced plans created successfully!');
    }
}
