'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Zap, 
  Globe, 
  AlertTriangle, 
  ChevronDown,
  UserCheck
} from 'lucide-react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';

interface NavbarProps {
  store: TrafficStore;
  state: AppState;
  onOpenNewTask: () => void;
  onOpenBulkTask: () => void;
  onToggleNotifications: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  store,
  state,
  onOpenNewTask,
  onOpenBulkTask,
  onToggleNotifications,
  searchQuery,
  setSearchQuery,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const userDropdownRef = React.useRef<HTMLDivElement>(null);
  const [newsIndex, setNewsIndex] = useState(0);

  const lebaneseNewsItems = state.language === 'ar' ? [
    { tag: "بيروت", title: "مؤتمر الذكاء الاصطناعي والإبداع الرقمي ينطلق في أسواق بيروت بمشاركة رواد الأعمال", time: "منذ 15 دقيقة" },
    { tag: "اقتصاد", title: "القطاع السياحي اللبناني يسجل نمواً ملحوظاً مع عودة المغتربين والفعاليات الثقافية الصيفية", time: "منذ 45 دقيقة" },
    { tag: "تكنولوجيا", title: "مبادرات ريادية في بيروت لدعم قطاع البرمجيات والإنتاج الإبداعي في الشرق الأوسط", time: "منذ ساعة" },
    { tag: "طقس", title: "أجواء صيفية مشمسة ونسائم عليلة في جبال لبنان وجبيل وبيروت • 29°C", time: "تحديث مباشر" }
  ] : [
    { tag: "BEIRUT", title: "Lebanon Creative & AI Tech Summit kicks off in Downtown Beirut attracting regional agencies", time: "15m ago" },
    { tag: "CULTURE", title: "Byblos & Baalbeck Festivals celebrate full season of vibrant arts & international shows", time: "40m ago" },
    { tag: "TECH HUB", title: "Digital startups and media powerhouses expand operations across Beirut & Antelias", time: "1h ago" },
    { tag: "WEATHER", title: "Warm summer breeze across Beirut & Mediterranean coastline • 29°C Clear", time: "Live" }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % lebaneseNewsItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [lebaneseNewsItems.length]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  const t = translations[state.language];
  const isRtl = state.language === 'ar';

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || state.users[0];
  const unreadNotifications = state.notifications.filter((n) => !n.read && n.userId === state.currentUserId).length;
  
  // User-specific delayed tasks (or role-aware)
  const myDelayedTasksCount = state.tasks.filter((t) => t.assignedToId === state.currentUserId && t.status === 'Delayed').length;
  const delayedTasksCount = myDelayedTasksCount;

  const currentNews = lebaneseNewsItems[newsIndex];

  return (
    <div className="w-full flex flex-col sticky top-0 z-40">
      {/* Lebanese News & Creative Pulse Ticker Bar */}
      <div className="w-full bg-slate-900 text-white text-[11px] px-4 lg:px-6 py-1.5 flex items-center justify-between border-b border-slate-800 shadow-inner overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Lebanese Badge */}
          <div className="flex items-center gap-1.5 bg-red-600/90 text-white font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 shadow-xs">
            <span>🇱🇧</span>
            <span>{state.language === 'ar' ? 'أخبار لبنان' : 'LEBANON NEWS'}</span>
          </div>

          {/* Category Tag */}
          <span className="hidden sm:inline text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.2 rounded shrink-0">
            {currentNews.tag}
          </span>

          {/* Live Headline with fade transition */}
          <div className="truncate font-medium text-slate-200 hover:text-white transition-colors flex items-center gap-2">
            <span className="truncate">{currentNews.title}</span>
            <span className="text-[10px] text-slate-400 shrink-0 font-normal">• {currentNews.time}</span>
          </div>
        </div>

        {/* Live News Dots Indicator & Weather */}
        <div className="flex items-center gap-2 shrink-0 pl-3">
          <div className="flex items-center gap-1">
            {lebaneseNewsItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setNewsIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  newsIndex === i ? 'bg-red-500 w-3' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between shadow-xs">
      {/* Brand Identity / Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <div className="flex flex-col">
            <div className="flex items-baseline font-black tracking-tight text-2xl lg:text-3xl leading-none">
              <span className="text-slate-900">R</span>
              <span className="text-indigo-600">A</span>
              <span className="text-slate-900">K</span>
            </div>
            <div className="flex items-center gap-1 font-bold text-[10px] tracking-widest leading-none mt-1">
              <span className="text-indigo-600 font-extrabold">4</span>
              <span className="text-slate-500 uppercase">CREATIVE</span>
            </div>
          </div>
        </div>

        {/* Delayed Alert Pill */}
        {delayedTasksCount > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full animate-pulse-red">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-xs font-semibold text-rose-700">
              {delayedTasksCount} {t.statusDelayed}
            </span>
          </div>
        )}
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all ${
              isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'
            }`}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Action Buttons */}
        <button
          onClick={onOpenNewTask}
          className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3.5 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-semibold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all hover:shadow hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.newTask}</span>
        </button>

        <button
          onClick={onOpenBulkTask}
          className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 px-3 lg:px-3.5 py-2 rounded-xl text-xs lg:text-sm font-medium flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          title="Assign 1 brief across multiple clients or team members"
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="hidden sm:inline">{t.bulkTask}</span>
        </button>

        {/* User Switcher Dropdown */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 p-1.5 lg:px-3 lg:py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 ring-1 ring-slate-100"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500 leading-tight">{currentUser.department}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showUserDropdown && (
            <div className={`absolute top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-dropdown z-50 p-2.5 space-y-2 ${isRtl ? 'left-0' : 'right-0'}`}>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t.switchRole}
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {state.users.length} Users
                </span>
              </div>

              {/* User Search Input */}
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
                <input
                  type="text"
                  autoFocus
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder={state.language === 'ar' ? 'ابحث عن موظف أو قسم...' : 'Search team member or role...'}
                  className={`w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all ${
                    isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
                  }`}
                />
              </div>

              {/* Filtered Users List */}
              <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                {state.users
                  .filter((u) => {
                    if (!userSearch.trim()) return true;
                    const q = userSearch.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.department.toLowerCase().includes(q) ||
                      u.role.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q)
                    );
                  })
                  .map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        store.setCurrentUser(u.id);
                        setShowUserDropdown(false);
                        setUserSearch('');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-colors cursor-pointer ${
                        state.currentUserId === u.id 
                          ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0" />
                      <div className="flex flex-col truncate min-w-0">
                        <span className="truncate font-semibold">{u.name}</span>
                        <span className="text-[10px] text-slate-500 font-normal truncate">{u.department} • {u.role}</span>
                      </div>
                    </button>
                  ))}

                {state.users.filter((u) => {
                  if (!userSearch.trim()) return true;
                  const q = userSearch.toLowerCase();
                  return u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400">
                    No team members found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Share Current View URL Button */}
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert(state.language === 'ar' ? 'تم نسخ رابط هذه الصفحة بكل إعداداتها وفلاترها!' : 'Current view URL copied with all active filters & state!');
          }}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          title="Copy shareable link for current view & filters"
        >
          <span className="text-sm">🔗</span>
          <span className="hidden xl:inline text-xs font-bold text-slate-600">{state.language === 'ar' ? 'مشاركة' : 'Share'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => store.setLanguage(state.language === 'en' ? 'ar' : 'en')}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          title="Toggle English / Arabic (RTL)"
        >
          <Globe className="w-4 h-4 text-indigo-500" />
          <span className="uppercase">{state.language}</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onToggleNotifications}
          className="relative bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 p-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse">
              {unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </header>
  </div>
  );
};
