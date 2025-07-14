import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { 
    CalendarDays, 
    Users, 
    CheckCircle, 
    XCircle,
    TrendingUp,
    FileText,
    ArrowLeft,
    Calendar
} from 'lucide-react';

export default function Summary() {
    const { group, attendances, startDate, endDate } = usePage().props;
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

    const updateDateRange = () => {
        router.get(route('attendance.summary', group.id), {
            start_date: localStartDate,
            end_date: localEndDate
        });
    };

    // Calculate statistics
    const stats = React.useMemo(() => {
        let totalSessions = 0;
        let totalPresent = 0;
        let totalAbsent = 0;
        
        Object.values(attendances).forEach(sessionAttendances => {
            sessionAttendances.forEach(attendance => {
                totalSessions++;
                if (attendance.is_present) {
                    totalPresent++;
                } else {
                    totalAbsent++;
                }
            });
        });

        const attendanceRate = totalSessions > 0 ? (totalPresent / totalSessions * 100).toFixed(1) : 0;
        const uniqueDates = Object.keys(attendances).length;
        const totalStudents = group.assigned_students?.length || 0;

        return {
            totalSessions,
            totalPresent,
            totalAbsent,
            attendanceRate,
            uniqueDates,
            totalStudents
        };
    }, [attendances, group]);

    // Calculate per-student statistics
    const studentStats = React.useMemo(() => {
        const stats = {};
        
        // Initialize stats for all assigned students
        group.assigned_students?.forEach(student => {
            stats[student.id] = {
                student: student,
                totalSessions: 0,
                present: 0,
                absent: 0,
                attendanceRate: 0
            };
        });

        // Calculate actual attendance
        Object.values(attendances).forEach(sessionAttendances => {
            sessionAttendances.forEach(attendance => {
                const studentId = attendance.student.id;
                if (stats[studentId]) {
                    stats[studentId].totalSessions++;
                    if (attendance.is_present) {
                        stats[studentId].present++;
                    } else {
                        stats[studentId].absent++;
                    }
                }
            });
        });

        // Calculate attendance rates
        Object.keys(stats).forEach(studentId => {
            const stat = stats[studentId];
            stat.attendanceRate = stat.totalSessions > 0 ? 
                (stat.present / stat.totalSessions * 100).toFixed(1) : 0;
        });

        return Object.values(stats);
    }, [attendances, group]);

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
                <div className="flex justify-between items-center" dir="rtl">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 text-right">
                        تقرير حضور المجموعة: {group.name}
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
            <Head title={`تقرير حضور - ${group.name}`} />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Date Range Filter */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-right">
                                <Calendar className="h-5 w-5" />
                                اختيار الفترة الزمنية
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>من تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={localStartDate}
                                        onChange={(e) => setLocalStartDate(e.target.value)}
                                        className="text-right"
                                    />
                                </div>
                                <div>
                                    <Label>إلى تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={localEndDate}
                                        onChange={(e) => setLocalEndDate(e.target.value)}
                                        className="text-right"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={updateDateRange} className="w-full">
                                        تحديث التقرير
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">إجمالي الجلسات</p>
                                        <p className="text-2xl font-bold text-right">{stats.uniqueDates}</p>
                                    </div>
                                    <CalendarDays className="h-5 w-5 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">عدد الطلاب</p>
                                        <p className="text-2xl font-bold text-right">{stats.totalStudents}</p>
                                    </div>
                                    <Users className="h-5 w-5 text-blue-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">نسبة الحضور</p>
                                        <p className="text-2xl font-bold text-right">{stats.attendanceRate}%</p>
                                    </div>
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-right">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 text-right">إجمالي سجلات الحضور</p>
                                        <p className="text-2xl font-bold text-right">{stats.totalSessions}</p>
                                        <p className="text-xs text-gray-500 ">
                                            حاضر: {stats.totalPresent} | غائب: {stats.totalAbsent}
                                        </p>
                                    </div>
                                    <FileText className="h-5 w-5 text-gray-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Student Attendance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-right">
                                <Users className="h-5 w-5" />
                                تقرير حضور الطلاب الفردي
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {studentStats.map((stat) => (
                                    <div key={stat.student.id} className="border rounded-lg p-4 bg-gray-50" dir="rtl">
                                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                            <div className="md:col-span-2">
                                                <h3 className="font-semibold text-right">{stat.student.name}</h3>
                                                <p className="text-sm text-gray-600 text-right">
                                                    نسبة الحضور: {stat.attendanceRate}%
                                                </p>
                                            </div>
                                            
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 text-right">الجلسات</p>
                                                <p className="text-lg font-bold text-right">{stat.totalSessions}</p>
                                            </div>
                                            
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 text-right">حاضر</p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-lg font-bold text-green-600">{stat.present}</span>
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                </div>
                                            </div>
                                            
                                            <div className="text-center">
                                                <p className="text-sm text-gray-600 text-right">غائب</p>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-lg font-bold text-red-600">{stat.absent}</span>
                                                    <XCircle className="h-4 w-4 text-red-500" />
                                                </div>
                                            </div>
                                            
                                            <div className="text-center">
                                                {getAttendanceRateBadge(parseFloat(stat.attendanceRate))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daily Attendance Details */}
                    {Object.keys(attendances).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-right">
                                    <CalendarDays className="h-5 w-5" />
                                    تفاصيل الحضور اليومي
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.keys(attendances).sort((a, b) => new Date(b) - new Date(a)).map((date) => (
                                        <div key={date} className="border rounded-lg p-4" dir="rtl">
                                            <h3 className="font-semibold mb-3 text-right">
                                                {new Date(date).toLocaleDateString('ar-EG', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {attendances[date].map((attendance) => (
                                                    <div key={attendance.id} className="flex items-center justify-between p-2 bg-gray-50 rounded" dir="rtl">
                                                        <div>
                                                            {attendance.is_present ? (
                                                                <Badge className="bg-green-500 text-green-800" dir="rtl">
                                                                    حاضر
                                                                    <CheckCircle className="h-3 w-3 ml-1" />
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-red-500 text-red-800" dir="rtl">
                                                                    غائب
                                                                    <XCircle className="h-3 w-3 ml-1" />
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-right">{attendance.student.name}</p>
                                                            {attendance.notes && (
                                                                <p className="text-sm text-gray-600 text-right">{attendance.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {Object.keys(attendances).length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center" dir="rtl">
                                <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                                    لا توجد بيانات حضور
                                </h3>
                                <p className="text-gray-600 text-center">
                                    لا توجد سجلات حضور للفترة المحددة ({new Date(startDate).toLocaleDateString('ar-EG')} - {new Date(endDate).toLocaleDateString('ar-EG')})
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
