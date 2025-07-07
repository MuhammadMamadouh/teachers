import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/Components/ui/select';
import { 
    MessageSquare, 
    Search, 
    Filter, 
    Bug, 
    Lightbulb, 
    HelpCircle,
    Clock,
    CheckCircle,
    AlertTriangle,
    User,
    Calendar,
    Eye,
    Trash2
} from 'lucide-react';

export default function Index() {
    const { feedbacks, filters, stats, feedbackTypes, statuses } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selectedItems, setSelectedItems] = useState([]);
    const [bulkStatus, setBulkStatus] = useState('');

    const getTypeIcon = (type) => {
        switch (type) {
            case 'suggestion':
                return <Lightbulb className="h-4 w-4 text-yellow-500" />;
            case 'bug':
                return <Bug className="h-4 w-4 text-red-500" />;
            case 'question':
                return <HelpCircle className="h-4 w-4 text-blue-500" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new':
                return <Clock className="h-4 w-4" />;
            case 'in_progress':
                return <AlertTriangle className="h-4 w-4" />;
            case 'resolved':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const statusColors = {
        'new': 'bg-blue-100 text-blue-800',
        'in_progress': 'bg-yellow-100 text-yellow-800',
        'resolved': 'bg-green-100 text-green-800'
    };

    const handleFilter = (key, value) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.get(window.location.pathname + '?' + params.toString());
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleFilter('search', search);
    };

    const handleBulkStatusUpdate = () => {
        if (selectedItems.length === 0 || !bulkStatus) return;
        
        router.patch(route('admin.feedback.bulk-status'), {
            feedback_ids: selectedItems,
            status: bulkStatus
        }, {
            onSuccess: () => {
                setSelectedItems([]);
                setBulkStatus('');
            }
        });
    };

    const toggleSelectAll = (checked) => {
        if (checked) {
            setSelectedItems(feedbacks.data.map(f => f.id));
        } else {
            setSelectedItems([]);
        }
    };

    const toggleSelectItem = (id, checked) => {
        if (checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(item => item !== id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    إدارة التعليقات والاقتراحات
                </h2>
            }
        >
            <Head title="إدارة التعليقات" />

            <div className="py-12 dir-rtl" dir="rtl">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-sm text-gray-600">إجمالي التعليقات</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold">{stats.new}</div>
                                <div className="text-sm text-gray-600">تعليقات جديدة</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold">{stats.in_progress}</div>
                                <div className="text-sm text-gray-600">قيد المراجعة</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4 text-center">
                                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold">{stats.resolved}</div>
                                <div className="text-sm text-gray-600">تم الحل</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-right">
                                <Filter className="h-5 w-5" />
                                فلترة وبحث
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <Select value={filters.type || ''} onValueChange={(value) => handleFilter('type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="نوع التعليق" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">جميع الأنواع</SelectItem>
                                            {Object.entries(feedbackTypes).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Select value={filters.status || ''} onValueChange={(value) => handleFilter('status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">جميع الحالات</SelectItem>
                                            {Object.entries(statuses).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="md:col-span-2">
                                    <form onSubmit={handleSearch} className="flex gap-2">
                                        <Input
                                            placeholder="البحث في التعليقات أو أسماء المعلمين..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="text-right"
                                        />
                                        <Button type="submit">
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bulk Actions */}
                    {selectedItems.length > 0 && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                        تم اختيار {selectedItems.length} عنصر
                                    </span>
                                    <Select value={bulkStatus} onValueChange={setBulkStatus}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="تغيير الحالة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(statuses).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>{value}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button 
                                        onClick={handleBulkStatusUpdate}
                                        disabled={!bulkStatus}
                                    >
                                        تطبيق
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Feedbacks List */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-right">التعليقات</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        checked={selectedItems.length === feedbacks.data.length && feedbacks.data.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span className="text-sm text-gray-600">اختيار الكل</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {feedbacks.data.length > 0 ? (
                                <div className="space-y-4">
                                    {feedbacks.data.map((feedback) => (
                                        <Card key={feedback.id} className="border">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                    <Checkbox
                                                        checked={selectedItems.includes(feedback.id)}
                                                        onCheckedChange={(checked) => toggleSelectItem(feedback.id, checked)}
                                                    />
                                                    
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                {getTypeIcon(feedback.type)}
                                                                <span className="font-medium">
                                                                    {feedbackTypes[feedback.type]}
                                                                </span>
                                                                <span className="text-gray-500">#{feedback.id}</span>
                                                                {!feedback.is_read_by_admin && (
                                                                    <Badge className="bg-red-100 text-red-800">جديد</Badge>
                                                                )}
                                                            </div>
                                                            <Badge className={statusColors[feedback.status]}>
                                                                <div className="flex items-center gap-1">
                                                                    {getStatusIcon(feedback.status)}
                                                                    <span>{statuses[feedback.status]}</span>
                                                                </div>
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <User className="h-4 w-4" />
                                                                <span>{feedback.user.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Calendar className="h-4 w-4" />
                                                                <span>{new Date(feedback.created_at).toLocaleDateString('ar-EG')}</span>
                                                            </div>
                                                        </div>

                                                        <p className="text-gray-700 mb-3 text-right">
                                                            {feedback.message.length > 200 
                                                                ? feedback.message.substring(0, 200) + '...'
                                                                : feedback.message
                                                            }
                                                        </p>

                                                        <div className="flex justify-end gap-2">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => router.get(route('admin.feedback.show', feedback.id))}
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                عرض التفاصيل
                                                            </Button>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                                onClick={() => {
                                                                    if (confirm('هل أنت متأكد من حذف هذا التعليق؟')) {
                                                                        router.delete(route('admin.feedback.destroy', feedback.id));
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-1" />
                                                                حذف
                                                            </Button>
                                                        </div>
                                                    </div>
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
                                        لا توجد تعليقات تطابق معايير البحث
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {feedbacks.links && (
                                <div className="mt-6">
                                    {/* Add pagination component here */}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
