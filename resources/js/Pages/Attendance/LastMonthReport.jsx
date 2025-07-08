import React from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
    CalendarDays, 
    Users, 
    CheckCircle, 
    XCircle,
    TrendingUp,
    FileText,
    ArrowLeft,
    Eye
} from 'lucide-react';

export default function LastMonthReport() {
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
        if (rate >= 70) return <Badge className="bg-yellow-500 text-yellow-800">جيد</Badge>;
        if (rate >= 60) return <Badge className="bg-orange-500 text-orange-800">مقبول</Badge>;
        return <Badge className="bg-red-500 text-red-800">ضعيف</Badge>;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        تقرير حضور الشهر الماضي - {monthName}
                    </h2>
                    <Button 
                        variant="outline" 
                        onClick={() => router.get(route('attendance.index'))}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        العودة للحضور
                    </Button>
                </div>
            }
        >
            <Head title={`تقرير حضور - ${monthName}`} />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Overall Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">عدد المجموعات</p>
                                        <p className="text-2xl font-bold text-right">{overallStats.totalGroups}</p>
                                    </div>
                                    <Users className="h-5 w-5 text-blue-500" />
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
                                    <Users className="h-5 w-5 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">إجمالي الجلسات</p>
                                        <p className="text-2xl font-bold text-right">{overallStats.totalSessions}</p>
                                    </div>
                                    <CalendarDays className="h-5 w-5 text-blue-500" />
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

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">حاضر / غائب</p>
                                        <p className="text-lg font-bold text-green-600 text-right">{overallStats.totalPresent}</p>
                                        <p className="text-lg font-bold text-red-600 text-right">{overallStats.totalAbsent}</p>
                                    </div>
                                    <FileText className="h-5 w-5 text-gray-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Groups Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-right">
                                <Users className="h-5 w-5" />
                                ملخص حضور المجموعات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {groups.length > 0 ? (
                                <div className="space-y-4">
                                    {groups.map((group) => (
                                        <div key={group.id} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-8 gap-4 items-center">
                                                <div className="md:col-span-2">
                                                    <h3 className="font-semibold text-right">{group.name}</h3>
                                                    <p className="text-sm text-gray-600 text-right">
                                                        {group.payment_type === 'monthly' ? 'دفع شهري' : 'دفع بالجلسة'}
                                                    </p>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">الطلاب</p>
                                                    <p className="text-lg font-bold">{group.total_students}</p>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">الجلسات</p>
                                                    <p className="text-lg font-bold">{group.total_sessions}</p>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">حاضر</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <span className="text-lg font-bold text-green-600">{group.total_present}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">غائب</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                        <span className="text-lg font-bold text-red-600">{group.total_absent}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-600">معدل الحضور</p>
                                                    <p className="text-lg font-bold">{group.attendance_rate}%</p>
                                                    {getAttendanceRateBadge(parseFloat(group.attendance_rate))}
                                                </div>
                                                
                                                <div className="text-center">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => router.get(route('attendance.summary', group.id), {
                                                            start_date: startDate,
                                                            end_date: endDate
                                                        })}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        تفاصيل
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مجموعات</h3>
                                    <p className="text-gray-600">لم يتم العثور على أي مجموعات أو سجلات حضور للشهر الماضي</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Period Information */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="text-center text-gray-600">
                                <p className="text-sm">
                                    <CalendarDays className="h-4 w-4 inline mr-1" />
                                    فترة التقرير: من {new Date(startDate).toLocaleDateString('ar-EG')} إلى {new Date(endDate).toLocaleDateString('ar-EG')}
                                </p>
                                <p className="text-xs mt-1">
                                    تم إنشاء التقرير في {new Date().toLocaleDateString('ar-EG')} الساعة {new Date().toLocaleTimeString('ar-EG')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
