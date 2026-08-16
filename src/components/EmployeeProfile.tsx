'use client';

import React, { useState, useEffect } from 'react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { User, Task, AuditLog } from '@/lib/types';
import { 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Download, 
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface EmployeeProfileProps {
  store: TrafficStore;
  state: AppState;
  selectedUserId?: string;
  onSelectUser?: (userId: string) => void;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
  store,
  state,
  selectedUserId,
  onSelectUser,
}) => {
  const t = translations[state.language];

  const [activeUserId, setActiveUserId] = useState(
    selectedUserId || state.users.find((u) => u.role === 'employee')?.id || state.users[2].id
  );

  useEffect(() => {
    if (selectedUserId && selectedUserId !== activeUserId) {
      setActiveUserId(selectedUserId);
    }
  }, [selectedUserId]);
  const [timeframe, setTimeframe] = useState<'thisWeek' | 'lastMonth' | 'last30Days' | 'all'>('last30Days');

  const selectedUser = state.users.find((u) => u.id === activeUserId) || state.users[0];

  // User tasks
  const userTasks = state.tasks.filter((t) => t.assignedToId === activeUserId);

  // Timeframe filter logic
  const getFilteredTasks = () => {
    const now = new Date();
    if (timeframe === 'thisWeek') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
      return userTasks.filter((t) => new Date(t.createdAt || t.briefDate) >= oneWeekAgo);
    }
    if (timeframe === 'lastMonth') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 86400000);
      return userTasks.filter((t) => new Date(t.createdAt || t.briefDate) >= oneMonthAgo);
    }
    if (timeframe === 'last30Days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
      return userTasks.filter((t) => new Date(t.createdAt || t.briefDate) >= thirtyDaysAgo);
    }
    return userTasks;
  };

  const filteredTasks = getFilteredTasks();

  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');
  const delayedTasks = filteredTasks.filter((t) => t.status === 'Delayed');
  const openTasks = filteredTasks.filter((t) => t.status !== 'Completed');

  // On-time vs Late calculation
  const totalFinished = completedTasks.length;
  const onTimeCount = completedTasks.filter((t) => !t.completedDate || t.completedDate <= t.dueDate).length;
  const onTimePercentage = totalFinished > 0 ? Math.round((onTimeCount / totalFinished) * 100) : 100;

  // Average Turnaround Time (briefDate -> completedDate in days)
  let totalTurnaroundDays = 0;
  let turnaroundCount = 0;
  completedTasks.forEach((t) => {
    if (t.briefDate && t.completedDate) {
      const diffMs = new Date(t.completedDate).getTime() - new Date(t.briefDate).getTime();
      const days = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      totalTurnaroundDays += days;
      turnaroundCount++;
    }
  });
  const avgTurnaroundDays = turnaroundCount > 0 ? (totalTurnaroundDays / turnaroundCount).toFixed(1) : '2.5';

  // Audit Logs for this user (where user was changedBy or assignedTo)
  const userAuditLogs = state.auditLogs.filter(
    (log) => log.changedById === activeUserId || state.tasks.find((t) => t.id === log.taskId)?.assignedToId === activeUserId
  );

  const handleExportPerformanceCSV = () => {
    let csv = `Task ID,Title,Client,Status,Priority,Brief Date,Due Date,Completed Date\n`;
    filteredTasks.forEach((t) => {
      csv += `"${t.id}","${t.title.replace(/"/g, '""')}","${store.getClientName(t.clientId)}","${t.status}","${t.priority}","${t.briefDate}","${t.dueDate}","${t.completedDate || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Performance_Report_${selectedUser.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <img
            src={selectedUser.avatar}
            alt={selectedUser.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{selectedUser.name}</h2>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase">
                {selectedUser.department}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Historical activity log and performance analytics ("What did this person do last month?").
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Employee Selector Dropdown */}
          <select
            value={activeUserId}
            onChange={(e) => {
              const newId = e.target.value;
              setActiveUserId(newId);
              if (onSelectUser) onSelectUser(newId);
            }}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
          >
            {state.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.department})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?tab=employeeHistory&employee=${activeUserId}`;
              navigator.clipboard.writeText(url);
              alert(state.language === 'ar' ? 'تم نسخ رابط ملف الموظف المباشر!' : 'Employee profile link copied to clipboard!');
            }}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Copy direct profile URL"
          >
            <span>🔗 {state.language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
          </button>

          {/* Timeframe Filter */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
          >
            <option value="thisWeek">{t.thisWeek}</option>
            <option value="lastMonth">{t.lastMonth}</option>
            <option value="last30Days">{t.last30Days}</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleExportPerformanceCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.completedTasks}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{completedTasks.length}</div>
          <div className="text-[11px] text-slate-400">out of {filteredTasks.length} total assigned</div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.onTimeRate}</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{onTimePercentage}%</div>
          <div className="text-[11px] text-slate-400">{onTimeCount} delivered on or before due date</div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.avgTurnaround}</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600">{avgTurnaroundDays} days</div>
          <div className="text-[11px] text-slate-400">brief date → completed date</div>
        </div>

        <div className="bg-white rounded-2xl p-4 space-y-2 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.currentWorkload}</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{openTasks.length} tasks</div>
          <div className="text-[11px] text-rose-600 font-semibold">{delayedTasks.length} currently delayed</div>
        </div>
      </div>

      {/* Chronological Audit Activity Trail */}
      <div className="bg-white rounded-2xl p-5 space-y-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">{t.auditTrail}</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{userAuditLogs.length} audit entries</span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {userAuditLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No activity recorded for this timeframe.</div>
          ) : (
            userAuditLogs.map((log) => (
              <div key={log.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-3 text-xs">
                <div className="p-2 bg-white text-indigo-600 rounded-lg border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.taskTitle}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{log.actionSummary}</p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>By: <strong className="text-slate-700">{log.changedByName}</strong></span>
                    <span>•</span>
                    <span>Field: <code className="text-indigo-600 font-semibold">{log.field}</code></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
