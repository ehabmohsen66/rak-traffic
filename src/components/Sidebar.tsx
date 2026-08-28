'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  BarChart3, 
  Building2, 
  Repeat, 
  UserCheck, 
  FileSpreadsheet, 
  Settings,
  ListTodo,
  Sparkles,
  Zap,
  Mail
} from 'lucide-react';
import { AppState } from '@/lib/store';
import { translations } from '@/lib/i18n';

export type MainTab = 
  | 'myTasks'
  | 'tasks' 
  | 'workload' 
  | 'clientWip' 
  | 'recurrence' 
  | 'employeeHistory' 
  | 'excelMigration'
  | 'emails'
  | 'emailSettings'
  | 'settings';

interface SidebarProps {
  state: AppState;
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
}



export const Sidebar: React.FC<SidebarProps> = ({ state, activeTab, setActiveTab }) => {
  const t = translations[state.language];

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || state.users[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const myTasksCount = state.tasks.filter((t) => t.assignedToId === state.currentUserId && t.status !== 'Completed').length;
  const myDelayedCount = state.tasks.filter((t) => t.assignedToId === state.currentUserId && t.status !== 'Completed' && t.dueDate < todayStr).length;

  const totalTasks = state.tasks.length;
  const delayedTasks = state.tasks.filter((t) => t.status !== 'Completed' && t.dueDate < todayStr).length;
  const activeRecurrence = state.recurrenceRules.filter((r) => r.active).length;
  const totalClients = state.clients.length;



  const navItems = [
    {
      id: 'myTasks' as MainTab,
      label: `${t.navMyTasks} (${currentUser.name.split(' ')[0]})`,
      icon: ListTodo,
      badge: myTasksCount,
      badgeColor: myDelayedCount > 0 
        ? 'bg-rose-50 text-rose-700 border border-rose-200 font-bold' 
        : 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold',
      highlight: true,
    },
    {
      id: 'tasks' as MainTab,
      label: t.navTasks,
      icon: LayoutGrid,
      badge: totalTasks,
      badgeColor: 'bg-slate-100 text-slate-700 font-medium',
    },
    {
      id: 'workload' as MainTab,
      label: t.navWorkload,
      icon: BarChart3,
      badge: delayedTasks > 0 ? delayedTasks : null,
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200 font-bold',
    },
    {
      id: 'clientWip' as MainTab,
      label: t.navClientWip,
      icon: Building2,
      badge: totalClients,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'recurrence' as MainTab,
      label: t.navRecurrence,
      icon: Repeat,
      badge: activeRecurrence,
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
    },
    {
      id: 'employeeHistory' as MainTab,
      label: t.navEmployeeAnalytics,
      icon: UserCheck,
    },
    {
      id: 'excelMigration' as MainTab,
      label: t.navExcelMigration,
      icon: FileSpreadsheet,
      badge: 'CSV',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    },
    {
      id: 'emails' as MainTab,
      label: t.navEmails,
      icon: Mail,
      badge: state.emailLogs.length,
      badgeColor: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold',
    },
    {
      id: 'emailSettings' as MainTab,
      label: state.language === 'ar' ? 'إعدادات البريد' : 'Email Settings',
      icon: Settings,
      badge: 'Resend',
      badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold',
    },
    {
      id: 'settings' as MainTab,
      label: t.navSettings,
      icon: Settings,
    },
  ];

  return (
    <aside className="w-full lg:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 p-3 lg:p-4 space-y-4">
      {/* Navigation List */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : item.highlight ? 'text-indigo-500' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>


    </aside>
  );
};
