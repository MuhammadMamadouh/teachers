import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
    MessageSquare, 
    User, 
    Calendar,
    Bug, 
    Lightbulb, 
    HelpCircle,
    Clock,
    CheckCircle,
    AlertTriangle,
    ArrowLeft
} from 'lucide-react';

export default function Show() {
    const { feedback } = usePage().props;

    const getTypeIcon = (type) => {
        switch (type) {
            case 'suggestion':
                return <Lightbulb className="h-5 w-5 text-yellow-500" />;
            case 'bug':
                return <Bug className="h-5 w-5 text-red-500" />;
            case 'question':
                return <HelpCircle className="h-5 w-5 text-blue-500" />;
            default:
                return <MessageSquare className="h-5 w-5" />;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new':
                return <Clock className="h-5 w-5 text-blue-500" />;
            case 'in_progress':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'resolved':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            default:
                return <Clock className="h-5 w-5" />;
        }
    };

    const statusColors = {
        'new': 'bg-blue-100 text-blue-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        'resolved': 'bg-green-100 text-green-800'
    };

    const statusTexts = {
        'new': 'جديد',
        'in_progress': 'قيد المراجعة',
        'resolved': 'تم الحل'
    };

    const typeTexts = {
        'suggestion': 'اقتراح',
        'bug': 'مشكلة تقنية',
        'question': 'استفسار'
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        تفاصيل التعليق
                    </h2>
                    <Button 
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة
                    </Button>
                </div>
            }
        >
            <Head title="تفاصيل التعليق" />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    {getTypeIcon(feedback.type)}
                                    <div>
                                        <CardTitle className="text-right">
                                            {typeTexts[feedback.type]}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            رقم التعليق: #{feedback.id}
                                        </p>
                                    </div>
                                </div>
                                <Badge className={statusColors[feedback.status]}>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(feedback.status)}
                                        <span>{statusTexts[feedback.status]}</span>
                                    </div>
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Feedback Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">المرسل:</span>
                                    <span className="font-medium">{feedback.user.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">تاريخ الإرسال:</span>
                                    <span className="font-medium">
                                        {new Date(feedback.created_at).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Feedback Message */}
                            <div>
                                <h3 className="text-lg font-medium mb-3 text-right">رسالة التعليق</h3>
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <p className="text-gray-700 leading-relaxed text-right whitespace-pre-wrap">
                                        {feedback.message}
                                    </p>
                                </div>
                            </div>

                            {/* Admin Reply */}
                            {feedback.reply && (
                                <div>
                                    <h3 className="text-lg font-medium mb-3 text-right">رد الإدارة</h3>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-gray-700 leading-relaxed text-right whitespace-pre-wrap">
                                            {feedback.reply}
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-blue-200">
                                            <p className="text-sm text-gray-600 text-right">
                                                تم الرد في: {new Date(feedback.responded_at).toLocaleDateString('ar-EG', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium mb-3 text-right">معلومات الحالة</h3>
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(feedback.status)}
                                    <span className="font-medium">{statusTexts[feedback.status]}</span>
                                </div>
                                {feedback.status === 'new' && (
                                    <p className="text-sm text-gray-600 mt-2 text-right">
                                        تعليقك تحت المراجعة وسيتم الرد عليه قريباً
                                    </p>
                                )}
                                {feedback.status === 'in_progress' && (
                                    <p className="text-sm text-gray-600 mt-2 text-right">
                                        تعليقك قيد المراجعة من قبل فريق الدعم
                                    </p>
                                )}
                                {feedback.status === 'resolved' && (
                                    <p className="text-sm text-gray-600 mt-2 text-right">
                                        تم حل التعليق بنجاح
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
