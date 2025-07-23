import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    Users, 
    ArrowLeft,
    Eye
} from 'lucide-react';

export default function Calendar({ groups }) {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const calendarRef = useRef(null);

    // Handle calendar event click
    const handleEventClick = (clickInfo) => {
        const event = clickInfo.event;
        
        setSelectedEvent({
            title: event.title,
            start: event.start,
            end: event.end,
            groupName: event.extendedProps.groupName,
            sessionType: event.extendedProps.sessionType,
            description: event.extendedProps.description,
            groupId: event.extendedProps.groupId,
            type: event.extendedProps.type
        });
        
        setShowEventModal(true);
    };

    const formatTime = (date) => {
        return date ? date.toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        }) : '';
    };

    const formatDate = (date) => {
        return date ? date.toLocaleDateString('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight text-gray-800 flex items-center">
                        <CalendarIcon className="inline w-6 h-6 ml-2" />
                        تقويم جلساتي
                    </h2>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs sm:text-sm text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <ArrowLeft className="w-4 h-4 ml-2" />
                        العودة للوحة التحكم
                    </Link>
                </div>
            }
        >
            <Head title="تقويم جلساتي" />

            <div className="py-6 sm:py-12">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Users className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                                    </div>
                                    <div className="mr-4 sm:mr-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                                إجمالي المجموعات
                                            </dt>
                                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                                                {groups.length}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                                    </div>
                                    <div className="mr-4 sm:mr-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                                الجلسات الأسبوعية
                                            </dt>
                                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                                                {groups.reduce((total, group) => total + group.schedules.length, 0)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CalendarIcon className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                                    </div>
                                    <div className="mr-4 sm:mr-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                                                الجلسات الخاصة
                                            </dt>
                                            <dd className="text-base sm:text-lg font-medium text-gray-900">
                                                {groups.reduce((total, group) => total + (group.special_sessions?.length || 0), 0)}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-2 sm:p-6 text-gray-900">
                            {/* Legend */}
                            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-blue-500 rounded ml-2"></div>
                                    <span className="text-xs sm:text-sm text-gray-600">الجلسات العادية</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-500 rounded ml-2"></div>
                                    <span className="text-xs sm:text-sm text-gray-600">الجلسات الخاصة</span>
                                </div>
                            </div>

                            {/* Calendar */}
                            <div className="calendar-container min-w-0 overflow-x-auto">
                                <FullCalendar
                                    ref={calendarRef}
                                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                    initialView="timeGridWeek"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                    }}
                                    events={route('dashboard.calendar-events')}
                                    eventClick={handleEventClick}
                                    height="auto"
                                    locale="ar"
                                    direction="rtl"
                                    slotMinTime="06:00:00"
                                    slotMaxTime="23:00:00"
                                    allDaySlot={false}
                                    eventTextColor="#ffffff"
                                    eventDisplay="block"
                                    dayHeaderFormat={{ weekday: 'long' }}
                                    nowIndicator={true}
                                    scrollTime="08:00:00"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Details Modal */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-2">
                    <div className="relative w-full max-w-md mx-auto p-4 sm:p-5 border shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 text-center mb-4">
                                تفاصيل الجلسة
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        المجموعة
                                    </label>
                                    <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        {selectedEvent.groupName}
                                    </p>
                                </div>
                                
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        نوع الجلسة
                                    </label>
                                    <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        {selectedEvent.sessionType}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                        التاريخ
                                    </label>
                                    <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                        {formatDate(selectedEvent.start)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            وقت البداية
                                        </label>
                                        <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {formatTime(selectedEvent.start)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            وقت النهاية
                                        </label>
                                        <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {formatTime(selectedEvent.end)}
                                        </p>
                                    </div>
                                </div>

                                {selectedEvent.description && (
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                            الوصف
                                        </label>
                                        <p className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 rounded">
                                            {selectedEvent.description}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row justify-between pt-4 gap-2">
                                    <Link
                                        href={route('groups.show', selectedEvent.groupId)}
                                        className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs sm:text-sm text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        <Eye className="w-4 h-4 ml-2" />
                                        عرض المجموعة
                                    </Link>
                                    <button
                                        onClick={() => setShowEventModal(false)}
                                        className="px-3 sm:px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-xs sm:text-sm"
                                    >
                                        إغلاق
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
