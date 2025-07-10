import { Link } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-green-50" dir="rtl">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" className="flex items-center">
                            <BookOpen className="h-8 w-8 text-indigo-600 ml-3" />
                            <span className="text-xl font-bold text-gray-900">نظام إدارة المعلمين</span>
                        </Link>
                        <div className="flex items-center space-x-reverse space-x-4">
                            <Link
                                href={route('login')}
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                                تسجيل الدخول
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="w-full max-w-5xl">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك في منصة المعلمين</h1>
                                <p className="text-indigo-100">أنشئ حسابك الآن وابدأ رحلة تعليمية منظمة واحترافية</p>
                            </div>
                        </div>
                        <div className="px-8 py-6">
                            {children}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8 text-sm text-gray-600">
                        <p>© {new Date().getFullYear()} نظام إدارة المعلمين - جميع الحقوق محفوظة</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
