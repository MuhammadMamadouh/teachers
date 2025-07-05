import { useState } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { successAlert } from '@/utils/sweetAlert';

export default function StartNewTermModal({ isOpen, onClose }) {
    const [confirmationText, setConfirmationText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (confirmationText !== 'CONFIRM RESET') {
            setError('يجب كتابة "CONFIRM RESET" بالضبط للمتابعة');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const response = await axios.post(route('dashboard.reset-term'), {
                confirmation: confirmationText
            });

            if (response.data.success) {
                successAlert({
                    title: 'تم بنجاح',
                    text: response.data.message
                }).then(() => {
                    // Redirect to dashboard to refresh the page
                    router.visit(route('dashboard'));
                });
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            console.error('Error resetting term:', error);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('حدث خطأ أثناء إعادة تعيين البيانات. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setConfirmationText('');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center mb-4">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            بدء فصل دراسي جديد
                        </h3>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <AlertTriangle className="h-5 w-5 text-red-400 ml-2 mt-0.5" />
                                <div className="text-right">
                                    <h4 className="text-sm font-medium text-red-800 mb-2">
                                        تحذير: هذا الإجراء لا يمكن التراجع عنه!
                                    </h4>
                                    <div className="text-sm text-red-700 space-y-1">
                                        <p>سيتم حذف جميع البيانات التالية نهائياً:</p>
                                        <ul className="list-disc list-inside space-y-1 text-right">
                                            <li>جميع الطلاب والمجموعات</li>
                                            <li>سجلات الحضور والغياب</li>
                                            <li>المدفوعات والرسوم</li>
                                            <li>الجداول الزمنية والجلسات الخاصة</li>
                                        </ul>
                                        <p className="font-medium mt-2">
                                            سيتم الاحتفاظ بحسابك واشتراكك فقط.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="text-right">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    للمتابعة، يرجى كتابة: <span className="font-mono font-bold text-red-600">CONFIRM RESET</span>
                                </label>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500"
                                    placeholder="CONFIRM RESET"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-between space-x-2 space-x-reverse pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                                >
                                    إلغاء
                                </button>
                                
                                <button
                                    type="submit"
                                    disabled={isSubmitting || confirmationText !== 'CONFIRM RESET'}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                                            جاري الحذف...
                                        </>
                                    ) : (
                                        <>
                                            <RotateCcw className="w-4 h-4 ml-2" />
                                            بدء فصل جديد
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
