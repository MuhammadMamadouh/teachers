import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/Components/ui/select';
import { 
    CalendarDays, 
    DollarSign, 
    Users, 
    CheckCircle, 
    XCircle,
    Save,
    Search,
    BarChart3,
} from 'lucide-react';
import axios from 'axios';
import { successAlert, errorAlert, infoAlert } from '@/utils/sweetAlert';
import { router } from '@inertiajs/react';

export default function Index() {
    const { groups } = usePage().props;
    const [selectedGroup, setSelectedGroup] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(1); // First day of current month
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 1, 0); // Last day of current month
        return date.toISOString().split('T')[0];
    });
    const [paymentsData, setPaymentsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const years = [];
    for (let year = 2020; year <= 2030; year++) {
        years.push(year);
    }

    const fetchPayments = async () => {
        if (!selectedGroup) {
            infoAlert({
                title: 'تنبيه',
                text: 'يرجى اختيار المجموعة'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get('/payments/show', {
                params: {
                    group_id: selectedGroup,
                    start_date: startDate,
                    end_date: endDate,
                }
            });
            
            setPaymentsData(response.data);
        } catch (error) {
            errorAlert({
                title: 'خطأ',
                text: error.response?.data?.message || 'حدث خطأ في جلب بيانات المدفوعات'
            });
        } finally {
            setLoading(false);
        }
    };

    const updatePayment = (studentIndex, paymentIndex, field, value) => {
        const updatedData = { ...paymentsData };
        updatedData.student_payments[studentIndex].payments[paymentIndex][field] = value;
        
        // Auto-set paid_at when marking as paid
        if (field === 'is_paid' && value && !updatedData.student_payments[studentIndex].payments[paymentIndex].paid_at) {
            updatedData.student_payments[studentIndex].payments[paymentIndex].paid_at = new Date().toISOString();
        }
        
        setPaymentsData(updatedData);
    };

    const savePayments = async () => {
        setSaving(true);
        try {
            const paymentsToSave = [];
            
            paymentsData.student_payments.forEach(studentPayment => {
                studentPayment.payments.forEach(payment => {
                    paymentsToSave.push({
                        id: payment.id,
                        is_paid: payment.is_paid,
                        paid_at: payment.paid_at,
                        notes: payment.notes,
                    });
                });
            });

            await axios.post('/payments/bulk-update', {
                payments: paymentsToSave
            });

            successAlert({
                title: 'تم بنجاح',
                text: 'تم حفظ جميع المدفوعات بنجاح'
            });
        } catch (error) {
            errorAlert({
                title: 'خطأ',
                text: error.response?.data?.message || 'حدث خطأ في حفظ المدفوعات'
            });
        } finally {
            setSaving(false);
        }
    };

    const getPaymentStatus = (payment) => {
        if (payment.is_paid) {
            return <Badge className="bg-green-600 text-green-800">مدفوع</Badge>;
        }
        return <Badge variant="secondary" className="bg-red-100 text-red-800">غير مدفوع</Badge>;
    };

    const generateMonthlyPayments = async () => {
        if (!selectedGroup) {
            infoAlert({
                title: 'تنبيه',
                text: 'يرجى اختيار المجموعة'
            });
            return;
        }

        const startDateObj = new Date(startDate);
        const month = startDateObj.getMonth() + 1;
        const year = startDateObj.getFullYear();

        setSaving(true);
        try {
            const response = await axios.post('/payments/generate-monthly', {
                group_id: selectedGroup,
                month: month,
                year: year,
            });

            successAlert({
                title: 'تم بنجاح',
                text: response.data.message
            });

            // Refresh the payments data
            fetchPayments();
        } catch (error) {
            errorAlert({
                title: 'خطأ',
                text: error.response?.data?.error || 'حدث خطأ في إنشاء المدفوعات الشهرية'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800">
                        إدارة المدفوعات الشهرية
                    </h2>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <Button
                            onClick={() => router.get('/attendance/last-month-report')}
                            variant="outline"
                            className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-50 focus:bg-gray-50 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <BarChart3 className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">تقرير حضور الشهر الماضي</span>
                            <span className="sm:hidden">تقرير الشهر الماضي</span>
                        </Button>
                        <Button
                            onClick={() => {
                                const currentDate = new Date();
                                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                                const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                                
                                const startDate = startOfMonth.toISOString().split('T')[0];
                                const endDate = endOfMonth.toISOString().split('T')[0];
                                
                                // Navigate to a current month attendance report
                                router.get('/attendance/monthly-report', {
                                    start_date: startDate,
                                    end_date: endDate,
                                    month: currentDate.getMonth() + 1,
                                    year: currentDate.getFullYear()
                                });
                            }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <BarChart3 className="w-4 h-4 mr-2" />
                            تقرير حضور الشهر الحالي
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="إدارة المدفوعات" />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-right">
                                <Search className="h-5 w-5" />
                                فلترة المدفوعات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <Label>المجموعة</Label>
                                    <Select value={selectedGroup} onValueChange={(value) => {
                                        setSelectedGroup(value);
                                        setPaymentsData(null);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المجموعة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((group) => (
                                                <SelectItem key={group.id} value={group.id.toString()}>
                                                    {group.name} ({group.payment_type === 'monthly' ? 'شهري' : 'بالجلسة'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>من تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="text-right"
                                    />
                                </div>

                                <div>
                                    <Label>إلى تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="text-right"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button 
                                        onClick={fetchPayments} 
                                        disabled={loading || !selectedGroup}
                                        className="w-full"
                                    >
                                        {loading ? 'جاري التحميل...' : 'عرض المدفوعات'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Section */}
                    {paymentsData && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-right">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 text-right">إجمالي الطلاب</p>
                                            <p className="text-xl sm:text-2xl font-bold text-right">{paymentsData.student_payments.length}</p>
                                        </div>
                                        <Users className="h-5 w-5 text-blue-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-right">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 text-right">المبلغ المدفوع</p>
                                            <p className="text-xl sm:text-2xl font-bold text-right">{paymentsData.summary.total_paid.toFixed(2)} ج.م</p>
                                        </div>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-right">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 text-right">المتبقي</p>
                                            <p className="text-xl sm:text-2xl font-bold text-right">{paymentsData.summary.total_unpaid.toFixed(2)} ج.م</p>
                                        </div>
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-right">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 text-right">سعر الطالب</p>
                                            <p className="text-xl sm:text-2xl font-bold text-right">{paymentsData.group.student_price} ج.م</p>
                                            <p className="text-xs text-gray-500 text-right">
                                                {paymentsData.group.payment_type === 'monthly' ? 'شهرياً' : 'لكل حصة'}
                                            </p>
                                        </div>
                                        <DollarSign className="h-5 w-5 text-blue-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Payments Table */}
                    {paymentsData && paymentsData.student_payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    
                                     <CardTitle className="flex items-center gap-2 text-right">
                                        <CalendarDays className="h-5 w-5" />
                                        المدفوعات من {paymentsData.date_range.start_date} إلى {paymentsData.date_range.end_date}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        {paymentsData.group.payment_type === 'monthly' && (
                                            <Button 
                                                onClick={generateMonthlyPayments} 
                                                disabled={saving}
                                                variant="outline"
                                                className="flex items-center gap-2"
                                            >
                                                <DollarSign className="h-4 w-4" />
                                                <span className="hidden sm:inline">{saving ? 'جاري الإنشاء...' : 'إنشاء مدفوعات شهرية'}</span>
                                                <span className="sm:hidden">{saving ? 'إنشاء...' : 'إنشاء مدفوعات'}</span>
                                            </Button>
                                        )}
                                    </div>
                                    
                                </div>
                               
                               
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {paymentsData.student_payments.map((studentPayment, studentIndex) => (
                                        <Card key={studentPayment.student.id} className="border-2">
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-lg font-semibold text-right">
                                                        {studentPayment.student.name}
                                                    </h3>
                                                   
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {studentPayment.payments.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {studentPayment.payments.map((payment, paymentIndex) => (
                                                            <div key={payment.id} className="border rounded-lg p-3 bg-gray-50">                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-start text-right">
                                                    <div className="sm:col-span-2 lg:col-span-1">
                                                        <Label className="text-sm font-medium">التاريخ</Label>
                                                        <p className="text-sm text-right">
                                                            {new Date(payment.related_date).toLocaleDateString('ar-EG')}
                                                        </p>
                                                        <p className="text-xs text-gray-500 text-right">
                                                            {payment.payment_type === 'monthly' ? 'شهري' : 'حصة'}
                                                        </p>
                                                    </div>

                                                    <div className="sm:col-span-2 lg:col-span-1">
                                                        <Label className="text-sm font-medium">المبلغ</Label>
                                                        <p className="text-sm font-bold text-right">
                                                            {payment.amount} ج.م
                                                        </p>
                                                    </div>

                                                    <div className="sm:col-span-2 lg:col-span-1">
                                                        <Label className="text-sm font-medium">حالة الدفع</Label>
                                                        <div className="flex items-center gap-2 mt-1" dir="rtl">
                                                            <Label htmlFor={`paid-${payment.id}`} className="mr-0">
                                                                مدفوع
                                                            </Label>
                                                            <Checkbox
                                                                id={`paid-${payment.id}`}
                                                                checked={payment.is_paid}
                                                                onCheckedChange={(checked) => updatePayment(studentIndex, paymentIndex, 'is_paid', checked)}
                                                            />
                                                        </div>
                                                        <div className="mt-1">
                                                            {getPaymentStatus(payment)}
                                                        </div>
                                                    </div>

                                                    <div className="sm:col-span-2 lg:col-span-1">
                                                        <Label className="text-sm font-medium">تاريخ الدفع</Label>
                                                        <Input
                                                            type="datetime-local"
                                                            value={payment.paid_at ? new Date(payment.paid_at).toISOString().slice(0, 16) : ''}
                                                            onChange={(e) => updatePayment(studentIndex, paymentIndex, 'paid_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                                            disabled={!payment.is_paid}
                                                            className="text-right text-sm mt-1"
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-2 lg:col-span-1">
                                                        <Label className="text-sm font-medium">ملاحظات</Label>
                                                        <Textarea
                                                            placeholder="ملاحظات..."
                                                            className="resize-none h-16 text-right text-sm mt-1"
                                                            value={payment.notes || ''}
                                                            onChange={(e) => updatePayment(studentIndex, paymentIndex, 'notes', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-6 text-gray-500">
                                                        <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                        <p className="text-sm mb-3">لا توجد مدفوعات لهذا الطالب في الفترة المحددة</p>
                                                        {paymentsData.group.payment_type === 'monthly' && (
                                                            <p className="text-xs text-gray-400 mb-3">
                                                                يمكنك إنشاء مدفوعات شهرية للطلاب باستخدام الزر &quot;إنشاء مدفوعات شهرية&quot; أعلاه
                                                            </p>
                                                        )}
                                                        {paymentsData.group.payment_type === 'per_session' && (
                                                            <p className="text-xs text-gray-400">
                                                                سيتم إنشاء المدفوعات تلقائياً عند تسجيل حضور الطالب في جلسة
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </CardContent>
                                            
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                             <div className="text-sm text-gray-500 mt-1">
                                        <Button 
                                            onClick={savePayments} 
                                            disabled={saving}
                                            className="flex items-center gap-2"
                                        >
                                            <Save className="h-4 w-4" />
                                            <span className="hidden sm:inline">{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                                            <span className="sm:hidden">{saving ? 'حفظ...' : 'حفظ'}</span>
                                        </Button>
                                </div>
                            </CardFooter>
                        </Card>
                        
                    )}

                    {/* Helper section when students exist but no payments in date range */}
                    {paymentsData && paymentsData.student_payments.length > 0 && 
                     paymentsData.student_payments.every(student => student.payments.length === 0) && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardContent className="p-6 text-center">
                                <CalendarDays className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-yellow-800 mb-2">
                                    لا توجد مدفوعات في الفترة المحددة
                                </h3>
                                <p className="text-yellow-700 mb-4">
                                    لم يتم العثور على أي مدفوعات للطلاب في الفترة من {paymentsData.date_range.start_date} إلى {paymentsData.date_range.end_date}
                                </p>
                                
                                {paymentsData.group.payment_type === 'monthly' ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-yellow-600">
                                            يمكنك إنشاء مدفوعات شهرية للطلاب:
                                        </p>
                                        <Button 
                                            onClick={generateMonthlyPayments} 
                                            disabled={saving}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                        >
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            {saving ? 'جاري الإنشاء...' : 'إنشاء مدفوعات شهرية'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-yellow-600">
                                            المدفوعات ستظهر تلقائياً عند تسجيل حضور الطلاب في الجلسات
                                        </p>
                                        <p className="text-xs text-yellow-500">
                                            تأكد من تسجيل الحضور أولاً في صفحة &quot;تسجيل الحضور&quot;
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State - Only show when no group is selected and no data fetched */}
                    {!selectedGroup && !loading && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                                    اختر مجموعة لعرض المدفوعات
                                </h3>
                                <p className="text-gray-600 text-center">
                                    اختر المجموعة والفترة الزمنية لعرض المدفوعات
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* No students in group state */}
                    {paymentsData && paymentsData.student_payments.length === 0 && selectedGroup && !loading && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2 text-center">
                                    لا توجد طلاب في هذه المجموعة
                                </h3>
                                <p className="text-gray-600 text-center">
                                    يجب إضافة طلاب إلى المجموعة أولاً لإدارة المدفوعات
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
