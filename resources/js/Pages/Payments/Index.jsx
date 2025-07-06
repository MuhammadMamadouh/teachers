import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
} from 'lucide-react';
import axios from 'axios';
import { successAlert, errorAlert, infoAlert } from '@/utils/sweetAlert';

export default function Index() {
    const { groups } = usePage().props;
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [payments, setPayments] = useState([]);
    const [groupInfo, setGroupInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const months = [
        { value: 1, label: 'يناير' },
        { value: 2, label: 'فبراير' },
        { value: 3, label: 'مارس' },
        { value: 4, label: 'أبريل' },
        { value: 5, label: 'مايو' },
        { value: 6, label: 'يونيو' },
        { value: 7, label: 'يوليو' },
        { value: 8, label: 'أغسطس' },
        { value: 9, label: 'سبتمبر' },
        { value: 10, label: 'أكتوبر' },
        { value: 11, label: 'نوفمبر' },
        { value: 12, label: 'ديسمبر' },
    ];

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
                    month: selectedMonth,
                    year: selectedYear,
                }
            });
            console.log('Fetched payments:', response.data.payments);
            setPayments(response.data.payments);
            setGroupInfo(response.data.group);
        } catch (error) {
            console.error('Error fetching payments:', error);
            errorAlert({
                title: 'خطأ',
                text: 'حدث خطأ في جلب بيانات المدفوعات'
            });
        } finally {
            setLoading(false);
        }
    };

    const updatePayment = (index, field, value) => {
        const updatedPayments = [...payments];
        updatedPayments[index].payment[field] = value;
        
        // Auto-set paid_date when marking as paid
        if (field === 'is_paid' && value && !updatedPayments[index].payment.paid_date) {
            updatedPayments[index].payment.paid_date = new Date().toISOString().split('T')[0];
        }
        
        setPayments(updatedPayments);
    };

    const savePayments = async () => {
        setSaving(true);
        try {
            const paymentsToSave = payments.map(payment => ({
                student_id: payment.student.id,
                group_id: payment.group_id,
                month: payment.month,
                year: payment.year,
                is_paid: payment.payment.is_paid,
                amount: groupInfo?.student_price || 0,
                paid_date: payment.payment.paid_date || null,
                notes: payment.payment.notes || null,
            }));

            await axios.post('/payments/bulk-update', {
                payments: paymentsToSave
            });

            successAlert({
                title: 'تم بنجاح',
                text: 'تم حفظ جميع المدفوعات بنجاح'
            });
        } catch (error) {
            console.error('Error saving payments:', error);
            errorAlert({
                title: 'خطأ',
                text: 'حدث خطأ في حفظ المدفوعات'
            });
        } finally {
            setSaving(false);
        }
    };

    const getPaymentStatus = (payment) => {
        if (payment.is_paid) {
            return <Badge className="">مدفوع</Badge>;
        }
        return <Badge variant="secondary">غير مدفوع</Badge>;
    };

    const getTotalPaid = () => {
        return payments.filter(p => p.payment.is_paid).length;
    };

    const getTotalAmount = () => {
        if (!groupInfo?.student_price) return '0.00';
        
        const paidCount = payments.filter(p => p.payment.is_paid).length;
        return (paidCount * parseFloat(groupInfo.student_price)).toFixed(2);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        إدارة المدفوعات الشهرية
                    </h2>
                </div>
            }
        >
            <Head title="إدارة المدفوعات" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    /* Filter Section */
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                فلترة المدفوعات
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>المجموعة</Label>
                                    <Select value={selectedGroup} onValueChange={(value) => {
                                        setSelectedGroup(value);
                                        setPayments([]);
                                        setGroupInfo(null);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر المجموعة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map((group) => (
                                                <SelectItem key={group.id} value={group.id.toString()}>
                                                    {group.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>الشهر</Label>
                                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الشهر" selectedValue={selectedMonth} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {months.map((month) => (
                                                <SelectItem key={month.value} value={month.value.toString()}>
                                                    {month.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>السنة</Label>
                                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر السنة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((year) => (
                                                <SelectItem key={year} value={year.toString()}>
                                                    {year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                    {payments.length > 0 && groupInfo && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">إجمالي الطلاب</p>
                                            <p className="text-2xl font-bold">{payments.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">المدفوعات المكتملة</p>
                                            <p className="text-2xl font-bold">{getTotalPaid()}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-yellow-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">إجمالي المبلغ</p>
                                            <p className="text-2xl font-bold">{getTotalAmount()} ج.م</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">سعر الطالب</p>
                                            <p className="text-2xl font-bold">{groupInfo.student_price} ج.م</p>
                                            <p className="text-xs text-gray-500">
                                                {groupInfo.payment_type === 'monthly' ? 'شهرياً' : 'لكل حصة'}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Payments Table */}
                    {payments.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays className="h-5 w-5" />
                                        مدفوعات {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                                    </CardTitle>
                                    <Button 
                                        onClick={savePayments} 
                                        disabled={saving}
                                        className="flex items-center gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {payments.map((payment, index) => (
                                        <Card key={payment.student.id} className="border">
                                            <CardContent className="p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                                    <div>
                                                        <Label className="text-sm font-medium">اسم الطالب</Label>
                                                        <p className="text-lg">{payment.student.name}</p>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">حالة الدفع</Label>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Checkbox
                                                                id={`paid-${payment.student.id}`}
                                                                checked={payment.payment.is_paid}
                                                                onCheckedChange={(checked) => updatePayment(index, 'is_paid', checked)}
                                                            />
                                                            <Label htmlFor={`paid-${payment.student.id}`} className="ml-2">
                                                                مدفوع
                                                            </Label>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">المبلغ</Label>
                                                        <Input
                                                            type="number"
                                                            step="1"
                                                            min="0"
                                                            placeholder="0.00"
                                                            value={groupInfo?.student_price || ''}
                                                            readOnly
                                                            className="bg-gray-50"
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            سعر الطالب المحدد للمجموعة
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">تاريخ الدفع</Label>
                                                        <Input
                                                            type="date"
                                                            value={payment.payment.paid_date || ''}
                                                            onChange={(e) => updatePayment(index, 'paid_date', e.target.value)}
                                                            disabled={!payment.payment.is_paid}
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">الحالة</Label>
                                                        <div className="mt-1">
                                                            {getPaymentStatus(payment.payment)}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">ملاحظات</Label>
                                                        <Textarea
                                                            placeholder="ملاحظات..."
                                                            className="resize-none h-8"
                                                            value={payment.payment.notes || ''}
                                                            onChange={(e) => updatePayment(index, 'notes', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {payments.length === 0 && selectedGroup && !loading && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    لا توجد بيانات مدفوعات
                                </h3>
                                <p className="text-gray-600">
                                    اختر المجموعة والشهر والسنة لعرض المدفوعات
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
