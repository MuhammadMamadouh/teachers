import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/Components/ui/select';
import { 
    MessageSquare, 
    Send, 
    Bug, 
    Lightbulb, 
    HelpCircle,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

export default function Index() {
    const { feedbacks, feedbackTypes } = usePage().props;
    const [showForm, setShowForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('feedback.store'), {
            onSuccess: () => {
                reset();
                setShowForm(false);
            }
        });
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'suggestion':
                return <Lightbulb className="h-4 w-4" />;
            case 'bug':
                return <Bug className="h-4 w-4" />;
            case 'question':
                return <HelpCircle className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'in_progress':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'resolved':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getStatusBadge = (feedback) => {
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

        return (
            <Badge className={statusColors[feedback.status]}>
                {getStatusIcon(feedback.status)}
                <span className="mr-1">{statusTexts[feedback.status]}</span>
            </Badge>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        التعليقات والاقتراحات
                    </h2>
                    <Button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        {showForm ? 'إلغاء' : 'إرسال تعليق جديد'}
                    </Button>
                </div>
            }
        >
            <Head title="التعليقات والاقتراحات" />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* New Feedback Form */}
                    {showForm && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-right">
                                    <Send className="h-5 w-5" />
                                    إرسال تعليق جديد
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="type">نوع التعليق</Label>
                                        <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="اختر نوع التعليق" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="suggestion">
                                                    <div className="flex items-center gap-2">
                                                        <Lightbulb className="h-4 w-4" />
                                                        اقتراح
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="bug">
                                                    <div className="flex items-center gap-2">
                                                        <Bug className="h-4 w-4" />
                                                        مشكلة تقنية
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="question">
                                                    <div className="flex items-center gap-2">
                                                        <HelpCircle className="h-4 w-4" />
                                                        استفسار
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.type && <div className="text-red-600 text-sm mt-1">{errors.type}</div>}
                                    </div>

                                    <div>
                                        <Label htmlFor="message">رسالة التعليق</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="اكتب تعليقك أو اقتراحك هنا..."
                                            className="min-h-32 text-right"
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                        />
                                        <p className="text-sm text-gray-500 mt-1 text-right">
                                            الحد الأدنى 10 أحرف، الحد الأقصى 1000 حرف
                                        </p>
                                        {errors.message && <div className="text-red-600 text-sm mt-1">{errors.message}</div>}
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowForm(false)}
                                        >
                                            إلغاء
                                        </Button>
                                        <Button type="submit" disabled={processing}>
                                            <Send className="h-4 w-4 mr-2" />
                                            {processing ? 'جاري الإرسال...' : 'إرسال التعليق'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    {/* User's Feedbacks */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-right">تعليقاتي السابقة</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {feedbacks.data.length > 0 ? (
                                <div className="space-y-4">
                                    {feedbacks.data.map((feedback) => (
                                        <Card key={feedback.id} className="border">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(feedback.type)}
                                                        <span className="font-medium text-right">
                                                            {feedbackTypes[feedback.type]}
                                                        </span>
                                                    </div>
                                                    {getStatusBadge(feedback)}
                                                </div>
                                                
                                                <p className="text-gray-700 mb-3 text-right">
                                                    {feedback.message.length > 150 
                                                        ? feedback.message.substring(0, 150) + '...'
                                                        : feedback.message
                                                    }
                                                </p>
                                                
                                                {feedback.reply && (
                                                    <div className="bg-gray-50 p-3 rounded-md mt-3">
                                                        <Label className="text-sm font-medium text-gray-600">
                                                            رد الإدارة:
                                                        </Label>
                                                        <p className="text-sm text-gray-700 mt-1 text-right">
                                                            {feedback.reply}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-2 text-right">
                                                            تم الرد في: {new Date(feedback.responded_at).toLocaleDateString('ar-EG')}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                                                    <span>{new Date(feedback.created_at).toLocaleDateString('ar-EG')}</span>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => window.open(route('feedback.show', feedback.id), '_blank')}
                                                    >
                                                        عرض التفاصيل
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        لا توجد تعليقات
                                    </h3>
                                    <p className="text-gray-600">
                                        لم تقم بإرسال أي تعليقات بعد
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
