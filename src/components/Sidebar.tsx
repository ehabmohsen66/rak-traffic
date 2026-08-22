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

// Multi-Tier Detailed Lebanese Cedar Tree SVG
const AnimatedLebaneseCedar = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className="relative flex items-center justify-center">
    {/* Ambient Glow Aura */}
    <div className="absolute inset-0 bg-emerald-400/30 rounded-full blur-md animate-cedar-glow pointer-events-none" />

    {/* Rising Micro Sparkles */}
    <div className="absolute -top-1 -right-1 text-amber-400 animate-sparkle-1 pointer-events-none">
      <Sparkles className="w-2.5 h-2.5" />
    </div>
    <div className="absolute -bottom-0.5 -left-1 text-emerald-400 animate-sparkle-2 pointer-events-none">
      <Sparkles className="w-2 h-2" />
    </div>

    {/* The Cedar Tree with Organic Wind Sway Animation */}
    <svg 
      viewBox="0 0 36 36" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${className} animate-cedar-sway transition-transform duration-300 drop-shadow-sm`}
    >
      {/* Top Tier */}
      <path d="M18 2L15.5 6.5H17L13.5 11.5H16L10.5 17.5H14L6.5 25H16.5V31H19.5V25H29.5L22 17.5H25.5L20 11.5H22.5L19 6.5H20.5L18 2Z" fill="#047857" />
      {/* Branch Layer Accents */}
      <path d="M18 4L16.5 7H17.8L15 11.5H17.5L13 16.5H16.5L10 23.5H17.5V30H18.5V23.5H26L19.5 16.5H23L18.5 11.5H21L18 4Z" fill="#059669" opacity="0.85" />
    </svg>
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ state, activeTab, setActiveTab }) => {
  const t = translations[state.language];

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || state.users[0];
  const myTasksCount = state.tasks.filter((t) => t.assignedToId === state.currentUserId && t.status !== 'Completed').length;
  const myDelayedCount = state.tasks.filter((t) => t.assignedToId === state.currentUserId && t.status === 'Delayed').length;

  const totalTasks = state.tasks.length;
  const delayedTasks = state.tasks.filter((t) => t.status === 'Delayed').length;
  const activeRecurrence = state.recurrenceRules.filter((r) => r.active).length;
  const totalClients = state.clients.length;

  // Live Beirut Time with seconds / blinking colon
  const [beirutTime, setBeirutTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Beirut',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date());
        setBeirutTime(timeStr);
      } catch (e) {
        setBeirutTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 5000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Animated Lebanon Flag Themed Creative Hub & Pulse Widget */}
      <div className="mt-auto pt-3 border-t border-slate-100">
        <div className="relative overflow-hidden rounded-2xl border border-red-200/80 shadow-xs group transition-all duration-300 hover:shadow-card hover:border-red-300">
          {/* Top Red Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

          {/* White Center Stripe with Cedar & Details */}
          <div className="relative bg-white/95 p-3.5 space-y-2.5">
            {/* Subtle Background Giant Cedar Watermark */}
            <div className="absolute -right-3 -bottom-3 text-emerald-600/10 pointer-events-none transform rotate-12 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6">
              <svg viewBox="0 0 36 36" fill="currentColor" className="w-28 h-28">
                <path d="M18 2L15.5 6.5H17L13.5 11.5H16L10.5 17.5H14L6.5 25H16.5V31H19.5V25H29.5L22 17.5H25.5L20 11.5H22.5L19 6.5H20.5L18 2Z" />
              </svg>
            </div>

            {/* Top Row: Animated Cedar Icon + Beirut Location */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs group-hover:border-emerald-400 transition-colors">
                  <AnimatedLebaneseCedar className="w-5 h-5 text-emerald-700" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-slate-900 tracking-wide uppercase">
                      Beirut HQ
                    </span>
                    <span className="text-xs">🇱🇧</span>
                  </div>
                  <div className="text-[9px] font-semibold text-red-600 flex items-center gap-1">
                    <span>Antelias</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600" suppressHydrationWarning>{beirutTime || 'Beirut Time'}</span>
                  </div>
                </div>
              </div>

              {/* Pulsing Active Beacon */}
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 shadow-2xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-tight">Active</span>
              </div>
            </div>

            {/* Bottom Row: Animated Caption & Active Task Pill */}
            <div className="pt-2 border-t border-slate-100 relative z-10 flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Zap className="w-3 h-3 text-red-500 fill-red-500" />
                <span className="font-bold text-slate-800">
                  Lebanese Creative Soul
                </span>
              </span>
              <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200">
                {totalTasks} Ops
              </span>
            </div>
          </div>

          {/* Bottom Red Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600" />
        </div>
      </div>
    </aside>
  );
};
