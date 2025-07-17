import { Head } from '@inertiajs/react';
import CenterOwnerLayout from '@/Layouts/CenterOwnerLayout';
import { 
    CogIcon, 
    BuildingOfficeIcon, 
    UserIcon,
    EnvelopeIcon,
    PencilIcon
} from '@heroicons/react/24/outline';

export default function Settings({ center }) {
    const SettingCard = ({ icon: Icon, title, children, color = 'blue' }) => (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                    <div className={`p-2 rounded-md bg-${color}-100 ml-3`}>
                        <Icon className={`h-5 w-5 text-${color}-600`} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );

    const InfoField = ({ label, value, editable = false }) => (
        <div className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
            <div>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <p className="mt-1 text-sm text-gray-900">{value || 'غير محدد'}</p>
            </div>
            {editable && (
                <button className="text-blue-600 hover:text-blue-700">
                    <PencilIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );

    return (
        <CenterOwnerLayout
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        إعدادات المركز
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        إدارة معلومات وإعدادات مركز {center?.name}
                    </p>
                </div>
            }
        >
            <Head title="إعدادات المركز" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Center Information */}
                        <SettingCard icon={BuildingOfficeIcon} title="معلومات المركز" color="blue">
                            <div className="space-y-0 divide-y divide-gray-200">
                                <InfoField 
                                    label="اسم المركز" 
                                    value={center?.name} 
                                    editable={true}
                                />
                                <InfoField 
                                    label="نوع المركز" 
                                    value={center?.type === 'individual' ? 'فردي' : 'مؤسسة'} 
                                    editable={true}
                                />
                                <InfoField 
                                    label="الوصف" 
                                    value={center?.description} 
                                    editable={true}
                                />
                                <InfoField 
                                    label="تاريخ التأسيس" 
                                    value={center?.created_at ? new Date(center.created_at).toLocaleDateString('ar-EG') : null}
                                />
                            </div>
                        </SettingCard>

                        {/* Contact Information */}
                        <SettingCard icon={EnvelopeIcon} title="معلومات الاتصال" color="green">
                            <div className="space-y-0 divide-y divide-gray-200">
                                <InfoField 
                                    label="البريد الإلكتروني" 
                                    value={center?.email} 
                                    editable={true}
                                />
                                <InfoField 
                                    label="رقم الهاتف" 
                                    value={center?.phone} 
                                    editable={true}
                                />
                                <InfoField 
                                    label="العنوان" 
                                    value={center?.address} 
                                    editable={true}
                                />
                                <InfoField 
                                    label="الموقع الإلكتروني" 
                                    value={center?.website} 
                                    editable={true}
                                />
                            </div>
                        </SettingCard>

                        {/* Owner Information */}
                        <SettingCard icon={UserIcon} title="معلومات المالك" color="purple">
                            <div className="space-y-0 divide-y divide-gray-200">
                                <InfoField 
                                    label="اسم المالك" 
                                    value={center?.owner?.name} 
                                />
                                <InfoField 
                                    label="بريد المالك الإلكتروني" 
                                    value={center?.owner?.email} 
                                />
                                <InfoField 
                                    label="هاتف المالك" 
                                    value={center?.owner?.phone} 
                                />
                            </div>
                        </SettingCard>

                        {/* System Settings */}
                        <SettingCard icon={CogIcon} title="إعدادات النظام" color="orange">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">حالة المركز</label>
                                        <p className="text-sm text-gray-500">تفعيل أو إلغاء تفعيل المركز</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        center?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {center?.is_active ? 'نشط' : 'غير نشط'}
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">الإشعارات</label>
                                        <p className="text-sm text-gray-500">إدارة إعدادات الإشعارات</p>
                                    </div>
                                    <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                        إدارة
                                    </button>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">النسخ الاحتياطي</label>
                                        <p className="text-sm text-gray-500">إعدادات النسخ الاحتياطي للبيانات</p>
                                    </div>
                                    <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                                        إعدادات
                                    </button>
                                </div>
                            </div>
                        </SettingCard>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 space-x-reverse">
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200">
                                إلغاء
                            </button>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                                حفظ التغييرات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CenterOwnerLayout>
    );
}
