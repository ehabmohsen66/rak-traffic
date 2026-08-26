'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, Priority } from '@/lib/types';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Edit3, 
  ArrowUpDown,
  Building
} from 'lucide-react';

interface TaskListProps {
  store: TrafficStore;
  state: AppState;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  store,
  state,
  tasks,
  onSelectTask,
}) => {
  const t = translations[state.language];

  const [sortField, setSortField] = useState<keyof Task | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // 1. Separate Active vs Completed: Completed tasks always move to the bottom
    const isCompletedA = a.status === 'Completed';
    const isCompletedB = b.status === 'Completed';

    if (isCompletedA !== isCompletedB) {
      return isCompletedA ? 1 : -1;
    }

    // 2. If user specifically clicked a column header, sort within sections
    if (sortField) {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
    }

    // 3. Default ordering: Newest tasks appear at the top
    const dateA = a.createdAt || a.id || '';
    const dateB = b.createdAt || b.id || '';
    if (dateA !== dateB) {
      return dateA < dateB ? 1 : -1;
    }

    return 0;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{t.statusCompleted}</span>;
      case 'In progress':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{t.statusInProgress}</span>;
      case 'Briefed':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{t.statusBriefed}</span>;
      case 'Delayed':
        return (
          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            {t.statusDelayed}
          </span>
        );
      default:
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg">{t.statusNotStarted}</span>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2 py-0.5 rounded-md">{t.priorityHigh}</span>;
      case 'Urgent':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded-md">{t.priorityUrgent}</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium px-2 py-0.5 rounded-md">{t.priorityNormal}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1">
                  <span>{t.colTaskTitle}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('clientId')}>
                <div className="flex items-center gap-1">
                  <span>{t.colClient}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('assignedToId')}>
                <div className="flex items-center gap-1">
                  <span>{t.colAssignee}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>{t.colStatus}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1">
                  <span>{t.colPriority}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('briefDate')}>
                <div className="flex items-center gap-1">
                  <span>{t.colBriefDate}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4 cursor-pointer hover:text-slate-900 transition-colors" onClick={() => handleSort('dueDate')}>
                <div className="flex items-center gap-1">
                  <span>{t.colDueDate}</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">{t.colNotes}</th>
              <th className="py-3.5 px-4 text-right">{t.colActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                  No matching tasks found.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const clientName = store.getClientName(task.clientId);
                const assigneeName = store.getUserName(task.assignedToId);
                const assignee = state.users.find((u) => u.id === task.assignedToId);
                const managerName = store.getUserName(task.assignedById);
                const todayStr = new Date().toISOString().split('T')[0];
                const isOverdue = task.status !== 'Completed' && task.dueDate < todayStr;
                const isCompleted = task.status === 'Completed';

                return (
                  <tr
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isOverdue ? 'bg-rose-50/30 hover:bg-rose-50/60 border-l-4 border-l-rose-500' :
                      isCompleted ? 'bg-slate-50/50 opacity-80 text-slate-500' : ''
                    }`}
                  >
                    {/* Task Title */}
                    <td className="py-3.5 px-4 font-bold text-slate-800 max-w-[240px]">
                      <div className={`truncate transition-colors ${isCompleted ? 'text-slate-500 font-medium' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                        {isCompleted && <span className="text-emerald-600 font-bold mr-1.5">✓</span>}
                        {task.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        Manager: {managerName}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span className="truncate max-w-[140px]">{clientName}</span>
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        {assignee && (
                          <img src={assignee.avatar} alt={assigneeName} className="w-5 h-5 rounded-full object-cover border border-slate-200" />
                        )}
                        <span className="font-medium text-slate-700">{assigneeName}</span>
                      </div>
                    </td>

                    {/* Status with Quick Select */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status === 'Delayed' ? 'In progress' : task.status}
                        onChange={(e) => store.updateTask(task.id, { status: e.target.value as TaskStatus })}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-xs font-semibold px-2 py-1 text-slate-700 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer transition-colors"
                      >
                        <option value="Not started">{t.statusNotStarted}</option>
                        <option value="Briefed">{t.statusBriefed}</option>
                        <option value="In progress">{t.statusInProgress}</option>
                        <option value="Completed">{t.statusCompleted}</option>
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">{getPriorityBadge(task.priority)}</td>

                    {/* Brief Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{task.briefDate}</td>

                    {/* Due Date */}
                    <td className={`py-3.5 px-4 font-mono text-[11px] font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                      {isOverdue ? `⚠️ ${task.dueDate}` : task.dueDate}
                    </td>

                    {/* Notes Snippet */}
                    <td className="py-3.5 px-4 text-slate-500 max-w-[200px] truncate text-[11px]">
                      {task.notes || '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectTask(task)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors shadow-xs cursor-pointer"
                          title="View / Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => store.deleteTask(task.id)}
                          className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg border border-slate-200 transition-colors shadow-xs cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
