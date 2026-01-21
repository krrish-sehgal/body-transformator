'use client';

import { useState } from 'react';
import { calculateRecompTargets } from '@/lib/calculations/recomp';
import { recompConfig } from '@/lib/config';
import NavigationSidebar from '@/components/dashboard/NavigationSidebar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, isToday, parseISO } from 'date-fns';

interface ProgressClientProps {
  profile: any;
  allDailyLogs: Array<{
    date: string;
    totalCalories?: number;
    totalProtein?: number;
    totalCarbs?: number;
    totalFats?: number;
  }>;
}

export default function ProgressClient({ profile, allDailyLogs }: ProgressClientProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedMonth = startOfMonth(selectedDate);
  const selectedMonthEnd = endOfMonth(selectedDate);
  
  const targets = calculateRecompTargets(
    profile.weightKg,
    profile.heightCm,
    profile.age,
    profile.gender,
    profile.activityLevel
  );
  
  const upperBound = targets.maintenance - recompConfig.recomp.subtractValue;
  const lowerBound = targets.recompCalories;
  
  // Create a map of dates to daily logs for quick lookup
  const logsByDate = new Map<string, typeof allDailyLogs[0]>();
  allDailyLogs.forEach(log => {
    logsByDate.set(log.date, log);
  });
  
  // Check if a day is compliant (calories between lowerBound and upperBound)
  const isDayCompliant = (date: Date): boolean | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const log = logsByDate.get(dateStr);
    
    if (!log || log.totalCalories === undefined || log.totalCalories === null) {
      return null; // No data for this day
    }
    
    return log.totalCalories >= lowerBound && log.totalCalories <= upperBound;
  };
  
  // Get all days in the month
  const monthDays = eachDayOfInterval({ start: selectedMonth, end: selectedMonthEnd });
  
  // Group days by week
  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  const firstDayOfWeek = getDay(selectedMonth);
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null); // Placeholder
  }
  
  monthDays.forEach((day) => {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  });
  
  // Fill remaining days in the last week
  while (currentWeek.length < 7) {
    currentWeek.push(null); // Placeholder
  }
  weeks.push(currentWeek);
  
  const handlePreviousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };
  
  const handleToday = () => {
    setSelectedDate(new Date());
  };
  
  // Count compliant days
  const compliantCount = monthDays.filter(day => isDayCompliant(day) === true).length;
  const nonCompliantCount = monthDays.filter(day => isDayCompliant(day) === false).length;
  const noDataCount = monthDays.filter(day => isDayCompliant(day) === null).length;
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 relative">
      <NavigationSidebar />
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          📅 Weekly Progress
        </h1>
        
        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-5 sm:mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Monthly Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-gray-600 mb-1">Compliant Days</div>
              <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
              <div className="text-xs text-gray-500 mt-1">Calories within target range</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-gray-600 mb-1">Non-Compliant Days</div>
              <div className="text-2xl font-bold text-red-600">{nonCompliantCount}</div>
              <div className="text-xs text-gray-500 mt-1">Calories outside target range</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">No Data Days</div>
              <div className="text-2xl font-bold text-gray-600">{noDataCount}</div>
              <div className="text-xs text-gray-500 mt-1">No entries logged</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <strong>Target Range:</strong> {lowerBound} - {upperBound} kcal
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <strong>Macro-defined Calories:</strong> {targets.recompCalories} kcal
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <strong>Upper Bound:</strong> {upperBound} kcal
            </div>
          </div>
        </div>
        
        {/* Calendar Navigation */}
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(selectedMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMonth}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-base font-medium"
              >
                ‹ Previous
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-base font-medium"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-base font-medium"
              >
                Next ›
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <th key={day} className="p-2 text-center text-sm font-semibold text-gray-700 border-b">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIndex) => (
                  <tr key={weekIndex}>
                    {week.map((day, dayIndex) => {
                      if (day === null) {
                        return <td key={dayIndex} className="p-2 border"></td>;
                      }
                      
                      const compliant = isDayCompliant(day);
                      const log = logsByDate.get(format(day, 'yyyy-MM-dd'));
                      const isCurrentDay = isToday(day);
                      
                      return (
                        <td
                          key={dayIndex}
                          className={`p-2 border text-center ${
                            isCurrentDay ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm ${isCurrentDay ? 'font-bold text-blue-600' : 'text-gray-700'}`}>
                              {format(day, 'd')}
                            </span>
                            {compliant === true && (
                              <span className="text-2xl text-green-500" title={`Compliant: ${log?.totalCalories} kcal`}>
                                ✓
                              </span>
                            )}
                            {compliant === false && (
                              <span className="text-2xl text-red-500" title={`Non-compliant: ${log?.totalCalories} kcal`}>
                                ✗
                              </span>
                            )}
                            {compliant === null && (
                              <span className="text-xl text-gray-300" title="No data">
                                ○
                              </span>
                            )}
                            {log && log.totalCalories !== undefined && (
                              <span className="text-xs text-gray-500">
                                {Math.round(log.totalCalories)} kcal
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="mt-5 pt-5 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-green-500">✓</span>
                <span className="text-gray-700">Compliant (within target range)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl text-red-500">✗</span>
                <span className="text-gray-700">Non-compliant (outside target range)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl text-gray-300">○</span>
                <span className="text-gray-700">No data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
