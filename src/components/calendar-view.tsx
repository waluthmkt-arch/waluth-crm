
"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';

const localizer = momentLocalizer(moment);

interface CalendarViewProps {
    tasks: any[];
}

export const CalendarView = ({ tasks }: CalendarViewProps) => {
    // Map tasks to calendar events
    const events = tasks
        // Only show tasks with due date or created date? 
        // Let's use created date as fallback or just require due date for now.
        // Actually, let's assume tasks are "all day" for now unless they have specific times.
        .filter(t => t.customFieldValues.some((v: any) => v.field.type === "DATE") || t.dueDate || t.createdAt)
        .map(t => {
            // Try to find a Date Custom Field
            const dateFieldValue = t.customFieldValues.find((v: any) => v.field.type === "DATE")?.value;
            const date = dateFieldValue ? new Date(dateFieldValue) : (t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt));

            return {
                id: t.id,
                title: t.name,
                start: date,
                end: date, // Same day
                allDay: true,
                resource: t
            }
        });

    return (
        <div className="h-full p-4 bg-white dark:bg-[#1E1E1E] rounded-lg shadow-sm border">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%', minHeight: '500px' }}
                views={['month', 'week', 'day']}
                defaultView='month'
                components={{
                    event: EventComponent
                }}
            />
        </div>
    );
};

const EventComponent = ({ event }: { event: any }) => {
    return (
        <div className="text-xs px-1 overflow-hidden text-ellipsis whitespace-nowrap bg-blue-500 text-white rounded">
            {event.title}
        </div>
    )
}
