import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { confirmDialog, successAlert, errorAlert } from '@/utils/sweetAlert';

export default function Calendar({ group }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        start_time: '',
        end_time: '',
        description: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const calendarRef = useRef(null);

    // Handle calendar event click
    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        
        // Only allow editing special sessions (not recurring ones)
        if (event.extendedProps.type === 'special') {
            setSelectedEvent({
                id: event.extendedProps.sessionId,
                date: event.startStr.split('T')[0],
                start_time: event.start.toISOString().slice(11, 16),
                end_time: event.end.toISOString().slice(11, 16),
                description: event.extendedProps.description || ''
            });
            
            setFormData({
                date: event.startStr.split('T')[0],
                start_time: event.start.toISOString().slice(11, 16),
                end_time: event.end.toISOString().slice(11, 16),
                description: event.extendedProps.description || ''
            });
            
            setShowEditModal(true);
        }
    };

    // Handle date select (for adding new special sessions)
    const handleDateSelect = (selectInfo) => {
        const selectedDate = selectInfo.startStr.split('T')[0];
        const startTime = selectInfo.startStr.includes('T') ? 
            selectInfo.startStr.split('T')[1].slice(0, 5) : '09:00';
        const endTime = selectInfo.endStr.includes('T') ? 
            selectInfo.endStr.split('T')[1].slice(0, 5) : '10:00';

        setFormData({
            date: selectedDate,
            start_time: startTime,
            end_time: endTime,
            description: ''
        });
        
        setShowAddModal(true);
        
        // Clear the selection
        selectInfo.view.calendar.unselect();
    };

    // Handle form submission for adding special session
    const handleAddSession = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post(route('groups.special-sessions.store', group.id), formData);
            
            if (response.data.success) {
                setShowAddModal(false);
                setFormData({ date: '', start_time: '', end_time: '', description: '' });
                
                // Refresh calendar events
                if (calendarRef.current) {
                    calendarRef.current.getApi().refetchEvents();
                }
                
                // Show success message
                successAlert({
                    title: 'تم بنجاح',
                    text: response.data.message
                });
            }
        } catch {
            errorAlert({
                title: 'خطأ',
                text: 'حدث خطأ أثناء إضافة الجلسة الخاصة'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission for updating special session
    const handleUpdateSession = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.put(
                route('groups.special-sessions.update', [group.id, selectedEvent.id]), 
                formData
            );
            
            if (response.data.success) {
                setShowEditModal(false);
                setSelectedEvent(null);
                setFormData({ date: '', start_time: '', end_time: '', description: '' });
                
                // Refresh calendar events
                if (calendarRef.current) {
                    calendarRef.current.getApi().refetchEvents();
                }
                
                successAlert({
                    title: 'تم بنجاح',
                    text: response.data.message
                });
            }
        } catch {
            errorAlert({
                title: 'خطأ',
                text: 'حدث خطأ أثناء تحديث الجلسة الخاصة'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle deleting special session
    const handleDeleteSession = async () => {
        if (!selectedEvent) {
            return;
        }

        const result = await confirmDialog({
            title: 'حذف الجلسة الخاصة',
            text: 'هل أنت متأكد من حذف هذه الجلسة الخاصة؟',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.delete(
                route('groups.special-sessions.destroy', [group.id, selectedEvent.id])
            );
            
            if (response.data.success) {
                setShowEditModal(false);
                setSelectedEvent(null);
                setFormData({ date: '', start_time: '', end_time: '', description: '' });
                
                // Refresh calendar events
                if (calendarRef.current) {
                    calendarRef.current.getApi().refetchEvents();
                }
                
                successAlert({
                    title: 'تم بنجاح',
                    text: response.data.message
                });
            }
        } catch {
            errorAlert({
                title: 'خطأ',
                text: 'حدث خطأ أثناء حذف الجلسة الخاصة'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800 flex items-center">
                        <CalendarIcon className="inline w-5 h-5 sm:w-6 sm:h-6 ml-2 flex-shrink-0" />
                        <span className="truncate">تقويم المجموعة: {group.name}</span>
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs sm:text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 ml-2 flex-shrink-0" />
                        <span className="hidden sm:inline">إضافة جلسة خاصة</span>
                        <span className="sm:hidden">إضافة جلسة</span>
                    </button>
                </div>
            }
        >
            <Head title={`تقويم المجموعة - ${group.name}`} />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-4 sm:p-6 text-gray-900">
                            {/* Legend */}
                            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 sm:space-x-reverse">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-blue-500 rounded ml-2"></div>
                                    <span className="text-sm text-gray-600">الجلسات العادية</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-500 rounded ml-2"></div>
                                    <span className="text-sm text-gray-600">الجلسات الخاصة</span>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div className="calendar-container overflow-x-auto">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    events={route('groups.calendar-events', group.id)}
                                    eventClick={handleEventClick}
                                    selectable={true}
                                    selectMirror={true}
                                    select={handleDateSelect}
                                    height="auto"
                                    locale="ar"
                                    direction="rtl"
                                    slotMinTime="06:00:00"
                                    slotMaxTime="23:00:00"
                                    allDaySlot={false}
                                    eventTextColor="#ffffff"
                                    eventDisplay="block"
                                    dayHeaderFormat={{ weekday: 'long' }}
                                    aspectRatio={window.innerWidth < 640 ? 0.8 : 1.35}
                                    contentHeight="auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Special Session Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                                إضافة جلسة خاصة
                            </h3>
                            <form onSubmit={handleAddSession} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        التاريخ
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            وقت البداية
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            وقت النهاية
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الوصف (اختياري)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        rows="3"
                                        placeholder="وصف الجلسة الخاصة..."
                                    />
                                </div>
                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 sm:space-x-reverse pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setFormData({ date: '', start_time: '', end_time: '', description: '' });
                                        }}
                                        className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                                    >
                                        {isLoading ? 'جاري الحفظ...' : 'حفظ'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Special Session Modal */}
            {showEditModal && selectedEvent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
                    <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                                تعديل الجلسة الخاصة
                            </h3>
                            <form onSubmit={handleUpdateSession} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        التاريخ
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            وقت البداية
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            وقت النهاية
                                        </label>
                                        <input
                                            type="time"
                                            value={formData.end_time}
                                            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الوصف (اختياري)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                                        rows="3"
                                        placeholder="وصف الجلسة الخاصة..."
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between space-y-2 sm:space-y-0 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleDeleteSession}
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                                    >
                                        حذف
                                    </button>
                                    <div className="flex flex-col-reverse sm:flex-row space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditModal(false);
                                                setSelectedEvent(null);
                                                setFormData({ date: '', start_time: '', end_time: '', description: '' });
                                            }}
                                            className="w-full sm:w-auto px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                                        >
                                            {isLoading ? 'جاري الحفظ...' : 'تحديث'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
