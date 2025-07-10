import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
    Users, 
    CheckCircle, 
    TrendingUp,
    FileText,
    ArrowLeft,
    Eye,
    Clock,
    BarChart3
} from 'lucide-react';

export default function MonthlyReport() {
    const { groups, startDate, endDate, monthName } = usePage().props;

    // Calculate overall statistics
    const overallStats = React.useMemo(() => {
        let totalStudents = 0;
        let totalSessions = 0;
        let totalPresent = 0;
        let totalAbsent = 0;
        
        groups.forEach(group => {
            totalStudents += group.total_students;
            totalSessions += group.total_sessions;
            totalPresent += group.total_present;
            totalAbsent += group.total_absent;
        });

        const overallAttendanceRate = (totalPresent + totalAbsent) > 0 ? 
            ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(1) : 0;

        return {
            totalGroups: groups.length,
            totalStudents,
            totalSessions,
            totalPresent,
            totalAbsent,
            overallAttendanceRate
        };
    }, [groups]);

    const getAttendanceRateBadge = (rate) => {
        if (rate >= 90) return <Badge className="bg-green-500 text-green-800">ممتاز</Badge>;
        if (rate >= 80) return <Badge className="bg-blue-500 text-blue-800">جيد جداً</Badge>;
        if (rate >= 70) return <Badge className="bg-yellow-500 text-yellow-800">مقبول</Badge>;
        return <Badge className="bg-red-500 text-red-800">ضعيف</Badge>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        تقرير الحضور - {monthName}
                    </h2>
                    <div className="flex space-x-3">
                        <Button
                            onClick={() => router.get(route('attendance.index'))}
                            variant="outline"
                            className="inline-flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            العودة للحضور
                        </Button>
                        <Button
                            onClick={() => router.get(route('payments.index'))}
                            variant="outline"
                            className="inline-flex items-center"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            العودة للمدفوعات
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`تقرير الحضور - ${monthName}`} />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Report Header */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-800">
                                <BarChart3 className="h-6 w-6" />
                                ملخص تقرير الحضور - {monthName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-blue-700 text-right">
                                فترة التقرير: من {formatDate(startDate)} إلى {formatDate(endDate)}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Overall Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">إجمالي المجموعات</p>
                                        <p className="text-2xl font-bold text-right">{overallStats.totalGroups}</p>
                                    </div>
                                    <FileText className="h-5 w-5 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">إجمالي الطلاب</p>
                                        <p className="text-2xl font-bold text-right">{overallStats.totalStudents}</p>
                                    </div>
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">حضور</p>
                                        <p className="text-2xl font-bold text-green-600 text-right">{overallStats.totalPresent}</p>
                                    </div>
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">معدل الحضور</p>
                                        <p className="text-2xl font-bold text-right">{overallStats.overallAttendanceRate}%</p>
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Group-wise Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-right">
                                <BarChart3 className="h-5 w-5" />
                                إحصائيات الحضور حسب المجموعة
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {groups.length > 0 ? (
                                <div className="space-y-4">
                                    {groups.map((group) => (
                                        <Card key={group.id} className="border-2">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-center">
                                                    <div className="text-right">
                                                        <h3 className="text-lg font-semibold text-right">{group.name}</h3>
                                                        <p className="text-sm text-gray-600 text-right">
                                                            {group.payment_type === 'monthly' ? 'مجموعة شهرية' : 'مجموعة بالجلسة'}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getAttendanceRateBadge(group.attendance_rate)}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => router.get(route('attendance.summary', group.id))}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            تفاصيل
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-right">
                                                    <div>
                                                        <p className="text-sm text-gray-600">عدد الطلاب</p>
                                                        <p className="text-lg font-semibold">{group.total_students}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">الجلسات</p>
                                                        <p className="text-lg font-semibold">{group.total_sessions}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">حضور</p>
                                                        <p className="text-lg font-semibold text-green-600">{group.total_present}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">غياب</p>
                                                        <p className="text-lg font-semibold text-red-600">{group.total_absent}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">معدل الحضور</p>
                                                        <p className="text-lg font-semibold">{group.attendance_rate}%</p>
                                                    </div>
                                                </div>

                                                {/* Sessions details */}
                                                {Object.keys(group.attendances_by_date).length > 0 && (
                                                    <div className="mt-4 pt-4 border-t">
                                                        <h4 className="text-sm font-medium text-gray-700 mb-2 text-right">
                                                            تفاصيل الجلسات:
                                                        </h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {Object.entries(group.attendances_by_date).map(([date, attendances]) => (
                                                                <div key={date} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                    <span className="font-medium">{new Date(date).toLocaleDateString('ar-EG')}</span>
                                                                    <span className="text-gray-600 mr-1">
                                                                        ({attendances.filter(a => a.is_present).length}/{attendances.length})
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد بيانات حضور</h3>
                                    <p className="text-gray-600">
                                        لم يتم تسجيل أي حضور في شهر {monthName}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Summary Insights */}
                    {groups.length > 0 && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-green-800 mb-3 text-right">
                                    ملخص التقرير
                                </h3>
                                <div className="space-y-2 text-green-700 text-right">
                                    <p>• تم تسجيل حضور {overallStats.totalPresent} طالب من إجمالي {overallStats.totalPresent + overallStats.totalAbsent} حضور مسجل</p>
                                    <p>• معدل الحضور الإجمالي: {overallStats.overallAttendanceRate}%</p>
                                    <p>• عدد المجموعات النشطة: {overallStats.totalGroups}</p>
                                    <p>• إجمالي الطلاب المسجلين: {overallStats.totalStudents}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
