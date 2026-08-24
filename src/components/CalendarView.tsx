'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  store: TrafficStore;
  state: AppState;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  store,
  state,
  tasks,
  onSelectTask,
}) => {
  const t = translations[state.language];

  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayIndex = firstDayOfMonth.getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Group tasks by due date YYYY-MM-DD
  const tasksByDate: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    if (!tasksByDate[t.dueDate]) {
      tasksByDate[t.dueDate] = [];
    }
    tasksByDate[t.dueDate].push(t);
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl p-4 lg:p-5 space-y-4 border border-slate-200 shadow-xs">
      {/* Calendar Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Header Titles */}
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 py-1 uppercase tracking-wider">
            {day}
          </div>
        ))}

        {/* Blank Padding Days */}
        {Array.from({ length: startingDayIndex }).map((_, idx) => (
          <div key={`blank-${idx}`} className="h-28 bg-slate-50/50 rounded-xl border border-slate-100" />
        ))}

        {/* Month Day Cells */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
          const formattedMonth = month + 1 < 10 ? `0${month + 1}` : `${month + 1}`;
          const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

          const dayTasks = tasksByDate[dateStr] || [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className={`h-28 p-2 rounded-xl border flex flex-col justify-start space-y-1 transition-all overflow-hidden ${
                isToday
                  ? 'bg-indigo-50/30 border-indigo-400 ring-2 ring-indigo-100 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                  isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'
                }`}>
                  {dayNum}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {dayTasks.length} tasks
                  </span>
                )}
              </div>

              {/* Tasks List inside Day Cell */}
              <div className="space-y-1 overflow-y-auto max-h-20 pr-0.5">
                {dayTasks.map((t) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isOverdue = t.status !== 'Completed' && t.dueDate < todayStr;

                  let bg = 'bg-slate-50 text-slate-700 border-slate-200';
                  if (t.status === 'Completed') bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  else if (isOverdue) bg = 'bg-rose-50 text-rose-800 border-rose-200 font-bold ring-1 ring-rose-200';
                  else if (t.status === 'In progress') bg = 'bg-amber-50 text-amber-800 border-amber-200';
                  else if (t.status === 'Briefed') bg = 'bg-blue-50 text-blue-800 border-blue-200';

                  return (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className={`text-[10px] font-semibold p-1 rounded-md border truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-2xs ${bg}`}
                      title={`${t.title} (${t.status}${isOverdue ? ' - Overdue' : ''})`}
                    >
                      {isOverdue && '⚠️ '}{t.title}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
