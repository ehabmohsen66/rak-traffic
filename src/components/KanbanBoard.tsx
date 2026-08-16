'use client';

import React, { useState } from 'react';
import { 
  Task, 
  TaskStatus, 
  Priority 
} from '@/lib/types';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  MessageSquare, 
  User as UserIcon, 
  CheckCircle2,
} from 'lucide-react';

interface KanbanBoardProps {
  store: TrafficStore;
  state: AppState;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  store,
  state,
  tasks,
  onSelectTask,
}) => {
  const t = translations[state.language];

  const columns: { id: TaskStatus; label: string; color: string; border: string; bg: string; badgeBg: string }[] = [
    {
      id: 'Not started',
      label: t.statusNotStarted,
      color: 'text-slate-700',
      border: 'border-slate-200',
      bg: 'bg-slate-100/70',
      badgeBg: 'bg-white text-slate-700 border border-slate-200',
    },
    {
      id: 'Briefed',
      label: t.statusBriefed,
      color: 'text-blue-700',
      border: 'border-blue-200/80',
      bg: 'bg-blue-50/40',
      badgeBg: 'bg-blue-100/80 text-blue-800',
    },
    {
      id: 'In progress',
      label: t.statusInProgress,
      color: 'text-amber-800',
      border: 'border-amber-200/80',
      bg: 'bg-amber-50/40',
      badgeBg: 'bg-amber-100/80 text-amber-800',
    },
    {
      id: 'Delayed',
      label: t.statusDelayed,
      color: 'text-rose-700 font-bold',
      border: 'border-rose-300/80',
      bg: 'bg-rose-50/50',
      badgeBg: 'bg-rose-100 text-rose-700 border border-rose-200',
    },
    {
      id: 'Completed',
      label: t.statusCompleted,
      color: 'text-emerald-700',
      border: 'border-emerald-200/80',
      bg: 'bg-emerald-50/40',
      badgeBg: 'bg-emerald-100/80 text-emerald-800',
    },
  ];

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-md">{t.priorityHigh}</span>;
      case 'Urgent':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">{t.priorityUrgent}</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">{t.priorityNormal}</span>;
    }
  };

  const getDueDateBadge = (task: Task) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isOverdue = task.status === 'Delayed' || (task.dueDate < todayStr && task.status !== 'Completed');

    if (task.status === 'Completed') {
      return (
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{task.completedDate || task.dueDate}</span>
        </div>
      );
    }

    if (isOverdue) {
      const diffMs = new Date(todayStr).getTime() - new Date(task.dueDate).getTime();
      const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return (
        <div className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{diffDays} {t.daysOverdue}</span>
        </div>
      );
    }

    if (task.dueDate === todayStr) {
      return (
        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
          <Clock className="w-3.5 h-3.5" />
          <span>{t.dueToday}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
        <Calendar className="w-3.5 h-3.5" />
        <span>{task.dueDate}</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 h-full min-h-[600px] overflow-x-auto pb-6">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const isDelayedCol = col.id === 'Delayed';

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-2xl border ${col.border} ${col.bg} p-3.5 space-y-3 min-w-[260px] shadow-xs`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                {isDelayedCol && <AlertTriangle className="w-4 h-4 text-rose-600 animate-bounce" />}
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full shadow-xs ${col.badgeBg}`}>
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards Container */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {columnTasks.length === 0 ? (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium bg-white/40">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => {
                  const clientName = store.getClientName(task.clientId);
                  const assigneeName = store.getUserName(task.assignedToId);
                  const assignee = state.users.find((u) => u.id === task.assignedToId);
                  const commentCount = state.comments[task.id]?.length || 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`bg-white rounded-xl p-3.5 space-y-2.5 cursor-pointer transition-all duration-200 relative group border shadow-xs hover:shadow-card hover:border-indigo-300 ${
                        task.status === 'Delayed' ? 'border-rose-300 hover:border-rose-400 ring-1 ring-rose-100' : 'border-slate-200'
                      }`}
                    >
                      {/* Top Bar: Client & Priority */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                          {clientName}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>

                      {/* Task Title */}
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {task.title}
                      </h4>

                      {/* Brief Snippet */}
                      {task.notes && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                          {task.notes}
                        </p>
                      )}

                      {/* Footer: Assignee & Due Date */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {/* Assignee Avatar & Name */}
                        <div className="flex items-center gap-1.5">
                          {assignee ? (
                            <img
                              src={assignee.avatar}
                              alt={assigneeName}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">
                              <UserIcon className="w-3 h-3 text-slate-500" />
                            </div>
                          )}
                          <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[90px]">
                            {assigneeName}
                          </span>
                        </div>

                        {/* Due Date & Comments Counter */}
                        <div className="flex items-center gap-2">
                          {commentCount > 0 && (
                            <div className="flex items-center gap-0.5 text-[10px] text-slate-500 font-medium">
                              <MessageSquare className="w-3 h-3" />
                              <span>{commentCount}</span>
                            </div>
                          )}
                          {getDueDateBadge(task)}
                        </div>
                      </div>

                      {/* Quick Status Shift Bar */}
                      <div className="pt-1.5 flex items-center justify-end gap-1">
                        <select
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            store.updateTask(task.id, { status: e.target.value as TaskStatus });
                          }}
                          className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] text-slate-700 font-semibold px-2 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs transition-colors"
                        >
                          <option value="Not started">{t.statusNotStarted}</option>
                          <option value="Briefed">{t.statusBriefed}</option>
                          <option value="In progress">{t.statusInProgress}</option>
                          <option value="Completed">{t.statusCompleted}</option>
                          <option value="Delayed">{t.statusDelayed}</option>
                        </select>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
