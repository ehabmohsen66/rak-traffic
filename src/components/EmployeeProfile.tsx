'use client';

import React, { useState } from 'react';
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
  ChevronRight,
  Pencil
} from 'lucide-react';
import { EditProfileModal } from '@/components/EditProfileModal';

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

  type Timeframe = 'today' | 'yesterday' | 'specificDate' | 'all';
  const [localActiveUserId, setLocalActiveUserId] = useState(
    state.users.find((u) => u.role === 'employee')?.id || state.users[2].id
  );
  const activeUserId = selectedUserId || localActiveUserId;
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [showEditModal, setShowEditModal] = useState(false);

  const selectedUser = state.users.find((u) => u.id === activeUserId) || state.users[0];

  // User tasks
  const userTasks = state.tasks.filter((t) => t.assignedToId === activeUserId);

  // Timeframe filter logic
  const getFilteredTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (timeframe === 'today') {
      return userTasks.filter((t) => {
        const cDate = t.createdAt ? t.createdAt.split('T')[0] : '';
        const compDate = t.completedDate ? t.completedDate.split('T')[0] : '';
        return t.briefDate === todayStr || compDate === todayStr || cDate === todayStr;
      });
    }
    if (timeframe === 'yesterday') {
      return userTasks.filter((t) => {
        const cDate = t.createdAt ? t.createdAt.split('T')[0] : '';
        const compDate = t.completedDate ? t.completedDate.split('T')[0] : '';
        return t.briefDate === yesterdayStr || compDate === yesterdayStr || cDate === yesterdayStr;
      });
    }
    if (timeframe === 'specificDate' && selectedDate) {
      return userTasks.filter((t) => {
        const cDate = t.createdAt ? t.createdAt.split('T')[0] : '';
        const compDate = t.completedDate ? t.completedDate.split('T')[0] : '';
        return t.briefDate === selectedDate || compDate === selectedDate || cDate === selectedDate;
      });
    }
    return userTasks;
  };

  const filteredTasks = getFilteredTasks();
  const todayStr = new Date().toISOString().split('T')[0];

  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');
  const delayedTasks = filteredTasks.filter((t) => t.status !== 'Completed' && t.dueDate < todayStr);
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
  const getFilteredAuditLogs = () => {
    const logs = state.auditLogs.filter(
      (log) => log.changedById === activeUserId || state.tasks.find((t) => t.id === log.taskId)?.assignedToId === activeUserId
    );

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (timeframe === 'today') {
      return logs.filter((log) => log.timestamp.split('T')[0] === todayStr);
    }
    if (timeframe === 'yesterday') {
      return logs.filter((log) => log.timestamp.split('T')[0] === yesterdayStr);
    }
    if (timeframe === 'specificDate' && selectedDate) {
      return logs.filter((log) => log.timestamp.split('T')[0] === selectedDate);
    }
    return logs;
  };

  const userAuditLogs = getFilteredAuditLogs().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Group audit logs by YYYY-MM-DD
  const groupedAuditLogs: { [key: string]: AuditLog[] } = {};
  userAuditLogs.forEach((log) => {
    const dateStr = log.timestamp.split('T')[0];
    if (!groupedAuditLogs[dateStr]) {
      groupedAuditLogs[dateStr] = [];
    }
    groupedAuditLogs[dateStr].push(log);
  });

  const sortedAuditDates = Object.keys(groupedAuditLogs).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDateHeader = (dateStr: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const todayStrYMD = today.toISOString().split('T')[0];
    const yesterdayStrYMD = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStrYMD) {
      return state.language === 'ar' ? 'اليوم' : 'Today';
    }
    if (dateStr === yesterdayStrYMD) {
      return state.language === 'ar' ? 'أمس' : 'Yesterday';
    }
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateStr).toLocaleDateString(state.language === 'ar' ? 'ar-EG' : 'en-US', options);
  };

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
          <div className="relative group">
            <img
              src={selectedUser.avatar}
              alt={selectedUser.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/40"
            />
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="absolute -bottom-1 -right-1 bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 p-1 rounded-full shadow-xs transition-colors cursor-pointer"
              title={state.language === 'ar' ? 'تعديل الصورة والبيانات' : 'Edit Photo & Profile'}
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{selectedUser.name}</h2>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase">
                {selectedUser.department}
              </span>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer ml-1"
              >
                <Pencil className="w-3 h-3" />
                <span>{state.language === 'ar' ? 'تعديل' : 'Edit'}</span>
              </button>
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">{selectedUser.email}</div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfileModal
            store={store}
            state={state}
            user={selectedUser}
            onClose={() => setShowEditModal(false)}
          />
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Employee Selector Dropdown */}
          <select
            value={activeUserId}
            onChange={(e) => {
              const newId = e.target.value;
              setLocalActiveUserId(newId);
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
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
          >
            <option value="today">{t.today}</option>
            <option value="yesterday">{t.yesterday}</option>
            <option value="specificDate">{t.specificDate}</option>
            <option value="all">All Time</option>
          </select>

          {timeframe === 'specificDate' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
            />
          )}

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

        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
          {sortedAuditDates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {state.language === 'ar' ? 'لا توجد أنشطة مسجلة في هذا النطاق الزمني.' : 'No activity recorded for this timeframe.'}
            </div>
          ) : (
            sortedAuditDates.map((dateStr) => (
              <div key={dateStr} className="space-y-3">
                {/* Date Header */}
                <div className="flex items-center gap-2 sticky top-0 bg-white py-1.5 z-10">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-3xs">
                    {formatDateHeader(dateStr)}
                  </span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Audit Logs for this date */}
                <div className="space-y-2.5">
                  {groupedAuditLogs[dateStr].map((log) => (
                    <div key={log.id} className="bg-slate-50/70 hover:bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-3 text-xs transition-colors">
                      <div className="p-2 bg-white text-indigo-600 rounded-lg border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-bold text-slate-800">{log.taskTitle}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
