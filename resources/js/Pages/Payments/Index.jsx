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
    BarChart3,
    Filter,
    ChevronDown,
    ChevronUp,
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
    const [dateGrouping, setDateGrouping] = useState('month'); // 'day', 'week', 'month'
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // 'all', 'paid', 'unpaid'
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    const years = [];
    for (let year = 2020; year <= 2030; year++) {
        years.push(year);
    }

    const fetchPayments = async (page = 1, search = '', resetPage = false) => {
        if (!selectedGroup) {
            infoAlert({
                title: 'تنبيه',
                text: 'يرجى اختيار المجموعة'
            });
            return;
        }

        setLoading(true);
        try {
            const params = {
                group_id: selectedGroup,
                start_date: startDate,
                end_date: endDate,
                per_page: perPage,
                page: resetPage ? 1 : page,
                search: search,
                payment_status: paymentStatusFilter,
            };

            const response = await axios.get('/payments/show', { params });
            
            setPaymentsData(response.data);
            setCurrentPage(resetPage ? 1 : page);
        } catch (error) {
            errorAlert({
                title: 'خطأ',
                text: error.response?.data?.message || 'حدث خطأ في جلب بيانات المدفوعات'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (search) => {
        setSearchQuery(search);
        setCurrentPage(1);
        fetchPayments(1, search, true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchPayments(page, searchQuery);
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1);
        fetchPayments(1, searchQuery, true);
    };

    const updatePayment = (studentIndex, paymentIndex, field, value) => {
        const updatedData = { ...paymentsData };
        updatedData.student_payments.data[studentIndex].payments[paymentIndex][field] = value;
        
        // Auto-set paid_at when marking as paid
        if (field === 'is_paid' && value && !updatedData.student_payments.data[studentIndex].payments[paymentIndex].paid_at) {
            updatedData.student_payments.data[studentIndex].payments[paymentIndex].paid_at = new Date().toISOString();
        }
        
        setPaymentsData(updatedData);
    };

    const savePayments = async () => {
        setSaving(true);
        try {
            const paymentsToSave = [];
            paymentsData.student_payments.data.forEach(studentPayment => {
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

            // Refresh the payments data to update stats
            await fetchPayments(currentPage, searchQuery);

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

    // Filter payments by status
    const filterPaymentsByStatus = (payments) => {
        if (!payments || paymentStatusFilter === 'all') return payments;
        
        return payments.filter(payment => {
            if (paymentStatusFilter === 'paid') return payment.is_paid;
            if (paymentStatusFilter === 'unpaid') return !payment.is_paid;
            return true;
        });
    };

    // Quick date range setters
    const setQuickDateRange = (range) => {
        const now = new Date();
        let start, end;
        
        switch (range) {
            case 'today':
                start = end = now.toISOString().split('T')[0];
                break;
            case 'yesterday': {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                start = end = yesterday.toISOString().split('T')[0];
                break;
            }
            case 'this_week': {
                start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                end = new Date(start);
                end.setDate(start.getDate() + 6);
                start = start.toISOString().split('T')[0];
                end = end.toISOString().split('T')[0];
                break;
            }
            case 'this_month': {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                start = start.toISOString().split('T')[0];
                end = end.toISOString().split('T')[0];
                break;
            }
            case 'last_month': {
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                start = start.toISOString().split('T')[0];
                end = end.toISOString().split('T')[0];
                break;
            }
            default:
                return;
        }
        
        setStartDate(start);
        setEndDate(end);
        setCurrentPage(1);
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
            fetchPayments(currentPage, searchQuery);
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
                                <Filter className="h-5 w-5" />
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
                                        setCurrentPage(1);
                                        setSearchQuery('');
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
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="text-right"
                                    />
                                </div>

                                <div>
                                    <Label>إلى تاريخ</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="text-right"
                                    />
                                </div>

                                <div className="flex items-end">
                                    <Button 
                                        onClick={() => fetchPayments(1, searchQuery, true)} 
                                        disabled={loading || !selectedGroup}
                                        className="w-full"
                                    >
                                        {loading ? 'جاري التحميل...' : 'عرض المدفوعات'}
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Search and Pagination Controls */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <Label>البحث عن الطالب</Label>
                                        <Input
                                            type="text"
                                            placeholder="الاسم، الهاتف، أو البريد الإلكتروني"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleSearch(e.target.value);
                                                }
                                            }}
                                            className="text-right"
                                        />
                                    </div>

                                    <div>
                                        <Label>عدد الطلاب في الصفحة</Label>
                                        <Select value={perPage.toString()} onValueChange={(value) => handlePerPageChange(parseInt(value))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="20">20</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>فلترة حسب الحالة</Label>
                                        <Select value={paymentStatusFilter} onValueChange={(value) => {
                                            setPaymentStatusFilter(value);
                                            setCurrentPage(1);
                                            if (selectedGroup) {
                                                fetchPayments(1, searchQuery, true);
                                            }
                                        }}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">جميع المدفوعات</SelectItem>
                                                <SelectItem value="paid">المدفوعات المكتملة</SelectItem>
                                                <SelectItem value="unpaid">المدفوعات المعلقة</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-end">
                                        <Button 
                                            onClick={() => handleSearch(searchQuery)} 
                                            disabled={loading || !selectedGroup}
                                            variant="outline"
                                            className="w-full"
                                        >
                                            بحث
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quick Date Range Buttons */}
                            <div className="mt-4 pt-4 border-t">
                                <Label className="text-sm font-medium mb-2 block">تواريخ سريعة</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuickDateRange('today')}
                                        className="text-xs"
                                    >
                                        اليوم
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuickDateRange('yesterday')}
                                        className="text-xs"
                                    >
                                        أمس
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuickDateRange('this_week')}
                                        className="text-xs"
                                    >
                                        هذا الأسبوع
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuickDateRange('this_month')}
                                        className="text-xs"
                                    >
                                        هذا الشهر
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setQuickDateRange('last_month')}
                                        className="text-xs"
                                    >
                                        الشهر الماضي
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Filtering Options */}
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>تجميع حسب</Label>
                                        <Select value={dateGrouping} onValueChange={setDateGrouping}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="day">اليوم</SelectItem>
                                                <SelectItem value="week">الأسبوع</SelectItem>
                                                <SelectItem value="month">الشهر</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                            <p className="text-xl sm:text-2xl font-bold text-right">{paymentsData.summary.total_students}</p>
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
                                            <p className="text-xl sm:text-2xl font-bold text-right">{(paymentsData.summary.total_paid || 0).toFixed(2)} ج.م</p>
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
                                            <p className="text-xl sm:text-2xl font-bold text-right">{(paymentsData.summary.total_unpaid || 0).toFixed(2)} ج.م</p>
                                        </div>
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 text-right">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 text-right">
                                                {paymentsData.group.payment_type === 'monthly' ? 'سعر الشهر' : 'سعر الجلسة'}
                                            </p>
                                            <p className="text-xl sm:text-2xl font-bold text-right">{paymentsData.group.student_price} ج.م</p>
                                            <p className="text-xs text-gray-500 text-right">
                                                {paymentsData.group.payment_type === 'monthly' ? 'شهرياً' : 'لكل جلسة'}
                                            </p>
                                        </div>
                                        <DollarSign className="h-5 w-5 text-blue-500" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Payments Table */}
                    {paymentsData && paymentsData.student_payments.data.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    
                                     <CardTitle className="flex items-center gap-2 text-right">
                                        <CalendarDays className="h-5 w-5" />
                                        {paymentsData.group.payment_type === 'monthly' 
                                            ? `المدفوعات الشهرية من ${paymentsData.date_range.start_date} إلى ${paymentsData.date_range.end_date}`
                                            : `مدفوعات الجلسات من ${paymentsData.date_range.start_date} إلى ${paymentsData.date_range.end_date}`
                                        }
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
                                        {paymentsData.group.payment_type === 'per_session' && (
                                            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                <span className="font-medium">مدفوعات الجلسات:</span> يتم إنشاؤها تلقائياً عند تسجيل الحضور
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                               
                               
                            </CardHeader>
                            <CardContent>
                                {/* Pagination Info */}
                                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                                    <div>
                                        عرض {paymentsData.student_payments.from} إلى {paymentsData.student_payments.to} من {paymentsData.student_payments.total} طالب
                                    </div>
                                    <div>
                                        الصفحة {paymentsData.student_payments.current_page} من {paymentsData.student_payments.last_page}
                                    </div>
                                </div>

                                {/* Compact Table Layout */}
                                <div className="space-y-4">
                                    {paymentsData.student_payments.data.map((studentPayment, studentIndex) => {
                                        // Filter payments by status
                                        const filteredPayments = filterPaymentsByStatus(studentPayment.payments);
                                        
                                        if (filteredPayments.length === 0) return null;
                                        
                                        const isExpanded = expandedGroups[`student-${studentPayment.student.id}`] !== false;
                                        const totalPaid = filteredPayments.filter(p => p.is_paid).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                                        const totalUnpaid = filteredPayments.filter(p => !p.is_paid).reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                                        
                                        return (
                                            <div key={studentPayment.student.id} className="border rounded-lg bg-white shadow-sm">
                                                {/* Student Header Row */}
                                                <div 
                                                    className="p-3 cursor-pointer hover:bg-gray-50 flex items-center justify-between border-b"
                                                    onClick={() => setExpandedGroups(prev => ({
                                                        ...prev,
                                                        [`student-${studentPayment.student.id}`]: !isExpanded
                                                    }))}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                            <h3 className="font-semibold text-right">
                                                                {studentPayment.student.name}
                                                            </h3>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs">
                                                            {filteredPayments.length} مدفوعة
                                                        </Badge>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="text-green-600 font-medium">
                                                            مدفوع: {(totalPaid || 0).toFixed(2)} ج.م
                                                        </div>
                                                        <div className="text-red-600 font-medium">
                                                            متبقي: {(totalUnpaid || 0).toFixed(2)} ج.م
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Student Payments Table */}
                                                {isExpanded && (
                                                    <div className="overflow-x-auto">
                                                        {filteredPayments.length > 0 ? (
                                                            <table className="w-full text-sm">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                                                                            {paymentsData.group.payment_type === 'monthly' ? 'الشهر' : 'تاريخ الجلسة'}
                                                                        </th>
                                                                        <th className="px-3 py-2 text-right font-medium text-gray-700">المبلغ</th>
                                                                        <th className="px-3 py-2 text-right font-medium text-gray-700">الحالة</th>
                                                                        <th className="px-3 py-2 text-right font-medium text-gray-700">تاريخ الدفع</th>
                                                                        <th className="px-3 py-2 text-right font-medium text-gray-700">ملاحظات</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {filteredPayments.map(payment => {
                                                                        const paymentIndex = studentPayment.payments.findIndex(p => p.id === payment.id);
                                                                        
                                                                        return (
                                                                            <tr key={payment.id} className="border-t hover:bg-gray-50">
                                                                                <td className="px-3 py-2 text-right">
                                                                                    <div>
                                                                                        <div className="font-medium">
                                                                                            {paymentsData.group.payment_type === 'monthly' 
                                                                                                ? new Date(payment.related_date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
                                                                                                : new Date(payment.related_date).toLocaleDateString('ar-EG')
                                                                                            }
                                                                                        </div>
                                                                                        <div className="text-xs text-gray-500">
                                                                                            {payment.payment_type === 'monthly' ? 'مدفوع شهري' : 'مدفوع لجلسة'}
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-3 py-2 text-right font-medium">
                                                                                    {parseFloat(payment.amount || 0).toFixed(2)} ج.م
                                                                                </td>
                                                                                <td className="px-3 py-2 text-right">
                                                                                    <div className="flex items-center gap-2 justify-end">
                                                                                        <Checkbox
                                                                                            id={`paid-${payment.id}`}
                                                                                            checked={payment.is_paid}
                                                                                            onCheckedChange={(checked) => updatePayment(studentIndex, paymentIndex, 'is_paid', checked)}
                                                                                        />
                                                                                        <Label htmlFor={`paid-${payment.id}`} className="text-xs">
                                                                                            مدفوع
                                                                                        </Label>
                                                                                    </div>
                                                                                    <div className="mt-1">
                                                                                        {getPaymentStatus(payment)}
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-3 py-2 text-right">
                                                                                    <Input
                                                                                        type="datetime-local"
                                                                                        value={payment.paid_at ? new Date(payment.paid_at).toISOString().slice(0, 16) : ''}
                                                                                        onChange={(e) => updatePayment(studentIndex, paymentIndex, 'paid_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                                                                                        disabled={!payment.is_paid}
                                                                                        className="text-right text-xs h-8"
                                                                                    />
                                                                                </td>
                                                                                <td className="px-3 py-2 text-right">
                                                                                    <Textarea
                                                                                        placeholder="ملاحظات..."
                                                                                        className="resize-none h-8 text-right text-xs"
                                                                                        value={payment.notes || ''}
                                                                                        onChange={(e) => updatePayment(studentIndex, paymentIndex, 'notes', e.target.value)}
                                                                                    />
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        ) : (
                                                            <div className="text-center py-4 text-gray-500">
                                                                <DollarSign className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                                                                <p className="text-sm">لا توجد مدفوعات لهذا الطالب في الفترة المحددة</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }).filter(Boolean)}
                                </div>

                                {/* Pagination Controls */}
                                {paymentsData.student_payments.data.length> 0 && paymentsData.student_payments.last_page > 1 && (
                                    <div className="flex flex-col gap-3 sm:flex-row justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
                                            <div className="flex w-full sm:w-auto items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(paymentsData.student_payments.current_page - 1)}
                                                    disabled={paymentsData.student_payments.current_page === 1}
                                                    className="min-w-[60px]"
                                                >
                                                    السابق
                                                </Button>
                                                <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
                                                    {/* Show page numbers, responsive scrollable */}
                                                    {Array.from({ length: Math.min(5, paymentsData.student_payments.last_page) }, (_, i) => {
                                                        // Improved pagination logic for correct page numbers
                                                        const totalPages = paymentsData.student_payments.last_page;
                                                        let startPage = Math.max(1, paymentsData.student_payments.current_page - 2);
                                                        let endPage = startPage + 4;
                                                        if (endPage > totalPages) {
                                                            endPage = totalPages;
                                                            startPage = Math.max(1, endPage - 4);
                                                        }
                                                        const page = startPage + i;
                                                        if (page > endPage || page < 1) return null;
                                                        return (
                                                            <Button
                                                                key={page}
                                                                variant={page === paymentsData.student_payments.current_page ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => handlePageChange(page)}
                                                                className="min-w-[36px] px-2 text-xs"
                                                            >
                                                                {page}
                                                            </Button>
                                                        );
                                                    })}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(paymentsData.student_payments.current_page + 1)}
                                                    disabled={paymentsData.student_payments.current_page === paymentsData.student_payments.last_page}
                                                    className="min-w-[60px]"
                                                >
                                                    التالي
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600 text-center w-full sm:w-auto">
                                            الصفحة {paymentsData.student_payments.current_page} من {paymentsData.student_payments.last_page}
                                        </div>
                                    </div>
                                )}
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
                    {paymentsData && paymentsData.student_payments.data.length > 0 && 
                     paymentsData.student_payments.data.every(student => student.payments.length === 0) && (
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
                    {paymentsData && paymentsData.student_payments.data.length === 0 && selectedGroup && !loading && (
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
