'use client';

import React from 'react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { User, Task } from '@/lib/types';
import { BarChart3, AlertTriangle, CheckCircle2, UserCheck, Flame } from 'lucide-react';

interface WorkloadViewProps {
  store: TrafficStore;
  state: AppState;
  onSelectEmployee: (userId: string) => void;
}

export const WorkloadView: React.FC<WorkloadViewProps> = ({
  store,
  state,
  onSelectEmployee,
}) => {
  const t = translations[state.language];

  // Filter employees only (or all active team members)
  const teamMembers = state.users.filter((u) => u.active);

  const getEmployeeStats = (userId: string) => {
    const userTasks = state.tasks.filter((t) => t.assignedToId === userId);
    const openTasks = userTasks.filter((t) => t.status !== 'Completed');
    const delayedTasks = userTasks.filter((t) => t.status === 'Delayed');
    const urgentHigh = openTasks.filter((t) => t.priority === 'Urgent' || t.priority === 'High');

    const totalOpen = openTasks.length;
    let loadLevel: 'Normal' | 'Busy' | 'Overloaded' = 'Normal';
    let loadColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200';

    if (totalOpen > 5 || delayedTasks.length > 1) {
      loadLevel = 'Overloaded';
      loadColor = 'bg-rose-50 text-rose-700 border border-rose-200';
    } else if (totalOpen >= 3) {
      loadLevel = 'Busy';
      loadColor = 'bg-amber-50 text-amber-700 border border-amber-200';
    }

    return {
      totalTasks: userTasks.length,
      openTasks: totalOpen,
      delayedTasks: delayedTasks.length,
      urgentHigh: urgentHigh.length,
      loadLevel,
      loadColor,
    };
  };

  // Generate current week dates (Mon-Sun)
  const getCurrentWeekDays = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      weekDays.push(nextDay.toISOString().split('T')[0]);
    }
    return weekDays;
  };

  const weekDays = getCurrentWeekDays();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.navWorkload}</h2>
            <p className="text-xs text-slate-500">
              Monitor team task distribution, identify bottlenecks, and balance capacity in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Team Member Workload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => {
          const stats = getEmployeeStats(member.id);

          return (
            <div
              key={member.id}
              onClick={() => onSelectEmployee(member.id)}
              className="bg-white rounded-2xl p-4 space-y-4 border border-slate-200 shadow-xs hover:shadow-card hover:border-indigo-300 cursor-pointer transition-all"
            >
              {/* Member Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                    <span className="text-[11px] text-slate-500">{member.department}</span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${stats.loadColor}`}>
                  {stats.loadLevel}
                </span>
              </div>

              {/* Progress & Stats Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Open Tasks</div>
                  <div className="text-base font-extrabold text-slate-800">{stats.openTasks}</div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Urgent/High</div>
                  <div className="text-base font-extrabold text-indigo-600">{stats.urgentHigh}</div>
                </div>

                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-medium">Delayed</div>
                  <div className={`text-base font-extrabold ${stats.delayedTasks > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {stats.delayedTasks}
                  </div>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Capacity Utilized</span>
                  <span className="font-bold text-slate-700">{Math.min(stats.openTasks * 20, 100)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.loadLevel === 'Overloaded'
                        ? 'bg-rose-500'
                        : stats.loadLevel === 'Busy'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(stats.openTasks * 20, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Heatmap Grid Matrix */}
      <div className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900">Weekly Task Due Date Heatmap</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold bg-slate-50/70">
                <th className="py-2.5 px-3">Team Member</th>
                {dayLabels.map((d, idx) => (
                  <th key={d} className="py-2.5 px-3 text-center">
                    <div>{d}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{weekDays[idx]?.substring(5)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-2">
                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full border border-slate-200" />
                    <span>{member.name}</span>
                  </td>

                  {weekDays.map((dateStr) => {
                    const dayTasks = state.tasks.filter(
                      (t) => t.assignedToId === member.id && t.dueDate === dateStr
                    );
                    const count = dayTasks.length;

                    let bgCell = 'bg-slate-50 text-slate-400';
                    if (count >= 3) bgCell = 'bg-rose-50 text-rose-700 font-bold border border-rose-200';
                    else if (count === 2) bgCell = 'bg-amber-50 text-amber-700 font-bold border border-amber-200';
                    else if (count === 1) bgCell = 'bg-sky-50 text-sky-700 font-semibold border border-sky-200';

                    return (
                      <td key={dateStr} className="py-3 px-3 text-center">
                        <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-xs ${bgCell}`}>
                          {count > 0 ? count : '—'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
