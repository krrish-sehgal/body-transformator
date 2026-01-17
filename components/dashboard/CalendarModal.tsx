'use client';

import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from 'date-fns';
import { useRouter } from 'next/navigation';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLogs: Array<{
    date: string;
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFats?: number;
  }>;
  currentDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
}

export default function CalendarModal({ isOpen, onClose, dailyLogs, currentDate, onDateSelect }: CalendarModalProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Create a map of dates to log data for quick lookup
  const logsMap = new Map(
    dailyLogs.map(log => [log.date, log])
  );

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get first day of week (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = getDay(monthStart);
  
  // Create calendar grid with empty cells for days before month starts
  const calendarDays = [
    ...Array(firstDayOfWeek).fill(null),
    ...daysInMonth,
  ];

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onDateSelect(dateStr);
    onClose();
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getDayColor = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logsMap.get(dateStr);
    
    if (!log || log.totalCalories === null || log.totalCalories === undefined) {
      return 'bg-gray-50 text-gray-400'; // No data
    }
    
    // Different colors based on calories (you can adjust these thresholds)
    if (log.totalCalories > 0 && log.totalCalories < 500) {
      return 'bg-blue-100 text-blue-900 hover:bg-blue-200';
    } else if (log.totalCalories >= 500 && log.totalCalories < 1500) {
      return 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200';
    } else if (log.totalCalories >= 1500) {
      return 'bg-green-100 text-green-900 hover:bg-green-200';
    }
    
    return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
  };

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isSelected = (date: Date) => format(date, 'yyyy-MM-dd') === currentDate;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full m-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📅 Calendar</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            >
              ‹ Previous
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
              >
                Today
              </button>
              <button
                onClick={goToNextMonth}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Next ›
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              if (date === null) {
                return <div key={`empty-${index}`} className="p-2" />;
              }

              const dateStr = format(date, 'yyyy-MM-dd');
              const log = logsMap.get(dateStr);
              const isCurrentMonth = isSameMonth(date, currentMonth);

              return (
                <button
                  key={dateStr}
                  onClick={() => isCurrentMonth && handleDateClick(date)}
                  disabled={!isCurrentMonth}
                  className={`
                    p-2 rounded text-sm transition-all relative
                    ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                    ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                    ${isSelected(date) ? 'ring-2 ring-purple-500 font-bold' : ''}
                    ${isCurrentMonth ? getDayColor(date) : 'bg-transparent'}
                  `}
                  title={log ? `${log.totalCalories || 0} cal, ${log.totalProtein || 0}g protein` : 'No data'}
                >
                  {format(date, 'd')}
                  {log && log.totalCalories && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 text-xs text-gray-600 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border rounded" />
              <span>No data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded" />
              <span>&lt; 500 cal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded" />
              <span>500-1500 cal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded" />
              <span>&gt; 1500 cal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

