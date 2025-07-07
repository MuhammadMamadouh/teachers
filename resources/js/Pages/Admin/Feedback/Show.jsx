import React from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/Components/ui/select';
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
    Reply,
    ArrowLeft,
    Settings
} from 'lucide-react';

export default function Show() {
    const { feedback } = usePage().props;

    const { data: statusData, setData: setStatusData, patch: patchStatus, processing: statusProcessing } = useForm({
        status: feedback.status,
    });

    const { data: replyData, setData: setReplyData, patch: patchReply, processing: replyProcessing, errors, reset } = useForm({
        reply: feedback.reply || '',
    });

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

    const handleStatusUpdate = (e) => {
        e.preventDefault();
        patchStatus(route('admin.feedback.update-status', feedback.id), {
            onSuccess: () => {
                // Status updated successfully
            }
        });
    };

    const handleReplySubmit = (e) => {
        e.preventDefault();
        patchReply(route('admin.feedback.reply', feedback.id), {
            onSuccess: () => {
                // Reply sent successfully
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        تفاصيل التعليق #{feedback.id}
                    </h2>
                    <Button 
                        variant="outline"
                        onClick={() => router.get(route('admin.feedback.index'))}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة للقائمة
                    </Button>
                </div>
            }
        >
            <Head title={`تفاصيل التعليق #${feedback.id}`} />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Feedback Details */}
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
                            {/* User & Date Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
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
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">مقروء:</span>
                                    <Badge className={feedback.is_read_by_admin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                        {feedback.is_read_by_admin ? 'نعم' : 'لا'}
                                    </Badge>
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
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Status Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-right">
                                    <Settings className="h-5 w-5" />
                                    إدارة الحالة
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleStatusUpdate} className="space-y-4">
                                    <div>
                                        <Label htmlFor="status">الحالة الحالية</Label>
                                        <Select 
                                            value={statusData.status} 
                                            onValueChange={(value) => setStatusData('status', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="new">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        جديد
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="in_progress">
                                                    <div className="flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        قيد المراجعة
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="resolved">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4" />
                                                        تم الحل
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={statusProcessing || statusData.status === feedback.status}
                                        className="w-full"
                                    >
                                        {statusProcessing ? 'جاري التحديث...' : 'تحديث الحالة'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Reply Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-right">
                                    <Reply className="h-5 w-5" />
                                    الرد على التعليق
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {feedback.reply && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <Label className="text-sm font-medium text-blue-800">الرد الحالي:</Label>
                                        <p className="text-sm text-blue-700 mt-1 text-right">{feedback.reply}</p>
                                        <p className="text-xs text-blue-600 mt-2 text-right">
                                            تم الرد في: {new Date(feedback.responded_at).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                )}
                                
                                <form onSubmit={handleReplySubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="reply">
                                            {feedback.reply ? 'تحديث الرد' : 'كتابة رد'}
                                        </Label>
                                        <Textarea
                                            id="reply"
                                            placeholder="اكتب ردك على التعليق..."
                                            className="min-h-32 text-right"
                                            value={replyData.reply}
                                            onChange={(e) => setReplyData('reply', e.target.value)}
                                        />
                                        {errors.reply && (
                                            <div className="text-red-600 text-sm mt-1">{errors.reply}</div>
                                        )}
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={replyProcessing || !replyData.reply.trim()}
                                        className="w-full"
                                    >
                                        <Reply className="h-4 w-4 mr-2" />
                                        {replyProcessing ? 'جاري الإرسال...' : (feedback.reply ? 'تحديث الرد' : 'إرسال الرد')}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
