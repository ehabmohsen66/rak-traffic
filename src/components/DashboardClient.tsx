'use client';

import React, { useState, useEffect } from 'react';
import { TrafficStore, store } from '@/lib/store';
import { translations } from '@/lib/i18n';
import {
  type Task,
  type User,
  type UserWorkStatus,
  getEffectiveWorkStatus,
  getUpcomingOffDates,
  formatOffDateShort,
  expandDateRange,
  getTodayIsoLocal,
} from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Sidebar, MainTab } from '@/components/Sidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskList } from '@/components/TaskList';
import { CalendarView } from '@/components/CalendarView';
import { WorkloadView } from '@/components/WorkloadView';
import { ClientWipView } from '@/components/ClientWipView';
import { RecurrenceView } from '@/components/RecurrenceView';
import { EmployeeProfile } from '@/components/EmployeeProfile';
import { ImportExportView } from '@/components/ImportExportView';
import { EmailHubView } from '@/components/EmailHubView';
import { TaskModal } from '@/components/TaskModal';
import { BulkTaskModal } from '@/components/BulkTaskModal';
import { NotificationCenter } from '@/components/NotificationCenter';
import { HighFiveCelebration } from '@/components/HighFiveCelebration';
import { EditProfileModal } from '@/components/EditProfileModal';
import { readUrlParams, updateUrl } from '@/lib/useUrlSync';
import { 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  User as UserIcon,
  ListTodo,
  Building,
  Pencil,
  Palmtree,
  Check
} from 'lucide-react';

export default function DashboardClient() {
  const [state, setState] = useState(store.getState());
  const [celebratingTask, setCelebratingTask] = useState<Task | null>(null);

  useEffect(() => {
    // Sync state on client-side mount to pick up values from localStorage and avoid hydration mismatch
    setState({ ...store.getState() });

    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });

    store.onTaskCompleted((task) => {
      setCelebratingTask(task);
    });

    return unsubscribe;
  }, []);

  const t = translations[state.language];
  const isRtl = state.language === 'ar';

  const currentUser = state.users.find((u) => u.id === state.currentUserId) || state.users[0];

  // Navigation & View Mode: Default to 'tasks' (All Agency Tasks) and 'list' (Table List)
  const [activeTab, setActiveTab] = useState<MainTab>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list' | 'calendar'>('list');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [employeeProfileUserId, setEmployeeProfileUserId] = useState<string | undefined>(undefined);

  // Edit Profile Modal State
  const [profileModalUser, setProfileModalUser] = useState<User | null>(null);
  const [editingHolidays, setEditingHolidays] = useState(false);
  const [holidayInputVal, setHolidayInputVal] = useState<number>(21);
  const [addingOffDate, setAddingOffDate] = useState(false);
  const [offStartDate, setOffStartDate] = useState<string>('');
  const [offEndDate, setOffEndDate] = useState<string>('');

  const getNextFridayIso = () => {
    const now = new Date();
    const day = now.getDay(); // 0=Sun .. 5=Fri .. 6=Sat
    const daysUntilFri = (5 - day + 7) % 7 || 7;
    const nextFri = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFri);
    const y = nextFri.getFullYear();
    const m = String(nextFri.getMonth() + 1).padStart(2, '0');
    const d = String(nextFri.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleAddPlannedOffDates = (user: User, startStr: string, endStr?: string) => {
    if (!startStr) return;
    const range = expandDateRange(startStr, endStr);
    const existing = new Set(user.plannedOffDates || []);
    let newlyAdded = 0;
    range.forEach((d) => {
      if (!existing.has(d)) {
        existing.add(d);
        newlyAdded++;
      }
    });
    const updatedDates = Array.from(existing).sort();
    const currentRemaining = user.remainingHolidays ?? 21;
    const nextRemaining = Math.max(0, currentRemaining - newlyAdded);
    store.updateUser(user.id, {
      plannedOffDates: updatedDates,
      remainingHolidays: nextRemaining,
    });
    setAddingOffDate(false);
    setOffStartDate('');
    setOffEndDate('');
  };

  const handleRemovePlannedOffDate = (user: User, dateToRemove: string) => {
    const existing = user.plannedOffDates || [];
    if (!existing.includes(dateToRemove)) return;
    const updatedDates = existing.filter((d) => d !== dateToRemove);
    const currentRemaining = user.remainingHolidays ?? 21;
    store.updateUser(user.id, {
      plannedOffDates: updatedDates,
      remainingHolidays: currentRemaining + 1,
    });
  };

  const isInitialMount = React.useRef(true);

  // 1. Initial URL load (deep linking)
  useEffect(() => {
    const urlParams = readUrlParams();

    if (urlParams.tab) {
      // URL state is an external browser input that must initialize this view.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(urlParams.tab);
    }
    if (urlParams.user && state.users.some((u) => u.id === urlParams.user)) {
      store.setCurrentUser(urlParams.user);
    }
    if (urlParams.view) {
      setTaskViewMode(urlParams.view);
    }
    if (urlParams.task) {
      const foundTask = state.tasks.find((t) => t.id === urlParams.task);
      if (foundTask) {
        setSelectedTask(foundTask);
        setShowTaskModal(true);
      }
    }
    if (urlParams.employee) {
      setEmployeeProfileUserId(urlParams.employee);
    }
    if (urlParams.client) {
      setSelectedClientId(urlParams.client);
    }
    if (urlParams.assignee) {
      setSelectedAssigneeId(urlParams.assignee);
    }
    if (urlParams.status) {
      setSelectedStatus(urlParams.status);
    }
    if (urlParams.priority) {
      setSelectedPriority(urlParams.priority);
    }
    if (urlParams.search) {
      setSearchQuery(urlParams.search);
    }

    // Handle browser forward/back buttons (popstate)
    const handlePopState = () => {
      const updated = readUrlParams();
      if (updated.tab) setActiveTab(updated.tab);
      if (updated.user && state.users.some((u) => u.id === updated.user)) store.setCurrentUser(updated.user);
      if (updated.view) setTaskViewMode(updated.view);
      if (updated.task) {
        const found = store.getState().tasks.find((t) => t.id === updated.task);
        if (found) {
          setSelectedTask(found);
          setShowTaskModal(true);
        }
      } else {
        setShowTaskModal(false);
        setSelectedTask(null);
      }
      if (updated.employee) setEmployeeProfileUserId(updated.employee);
      if (updated.client !== undefined) setSelectedClientId(updated.client || 'all');
      if (updated.assignee !== undefined) setSelectedAssigneeId(updated.assignee || 'all');
      if (updated.status !== undefined) setSelectedStatus(updated.status || 'all');
      if (updated.priority !== undefined) setSelectedPriority(updated.priority || 'all');
      if (updated.search !== undefined) setSearchQuery(updated.search || '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Reactively update URL whenever state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    updateUrl({
      tab: activeTab,
      user: state.currentUserId,
      view: taskViewMode,
      task: showTaskModal && selectedTask ? selectedTask.id : null,
      employee: activeTab === 'employeeHistory' ? employeeProfileUserId : null,
      client: selectedClientId,
      assignee: selectedAssigneeId,
      status: selectedStatus,
      priority: selectedPriority,
      search: searchQuery,
    }, false);
  }, [
    activeTab,
    state.currentUserId,
    taskViewMode,
    showTaskModal,
    selectedTask,
    employeeProfileUserId,
    selectedClientId,
    selectedAssigneeId,
    selectedStatus,
    selectedPriority,
    searchQuery,
  ]);

  const isMyTasksMode = activeTab === 'myTasks';

  // Filter tasks
  const filteredTasks = state.tasks.filter((task) => {
    // If in "My Tasks" mode, automatically filter by active user
    if (isMyTasksMode && task.assignedToId !== state.currentUserId) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = (task.notes || '').toLowerCase().includes(q);
      const matchClient = store.getClientName(task.clientId).toLowerCase().includes(q);
      const matchAssignee = store.getUserName(task.assignedToId).toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchClient && !matchAssignee) return false;
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'overdue' || selectedStatus === 'Delayed') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (task.status === 'Completed' || task.dueDate >= todayStr) return false;
      } else if (task.status !== selectedStatus) {
        return false;
      }
    }
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

    return true;
  });

  // User personal metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const myTasks = state.tasks.filter((t) => t.assignedToId === state.currentUserId);
  const myOpenTasks = myTasks.filter((t) => t.status !== 'Completed');
  const myDueToday = myTasks.filter((t) => t.dueDate === todayStr && t.status !== 'Completed');
  const myDelayed = myTasks.filter((t) => t.dueDate < todayStr && t.status !== 'Completed');
  const myCompleted = myTasks.filter((t) => t.status === 'Completed');

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClientId('all');
    setSelectedAssigneeId('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedClientId !== 'all' ||
    (!isMyTasksMode && selectedAssigneeId !== 'all') ||
    selectedStatus !== 'all' ||
    selectedPriority !== 'all';

  const handleOpenTask = (t?: Task) => {
    setSelectedTask(t || null);
    setShowTaskModal(true);
  };

  const handleSelectNotificationTask = (taskId: string) => {
    const targetTask = state.tasks.find((t) => t.id === taskId);
    if (targetTask) {
      if (targetTask.assignedToId === state.currentUserId) {
        setActiveTab('myTasks');
      } else {
        setActiveTab('tasks');
      }
      handleOpenTask(targetTask);
    }
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <Navbar
        store={store}
        state={state}
        onOpenNewTask={() => handleOpenTask()}
        onOpenBulkTask={() => setShowBulkModal(true)}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectUser={() => {
          setActiveTab('myTasks');
        }}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar state={state} activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-5">
          {/* View 1: Tasks Control (My Tasks OR Agency Tasks) */}
          {(activeTab === 'myTasks' || activeTab === 'tasks') && (
            <div className="space-y-5">
              {/* Employee Personal Workspace Banner (When in My Tasks Mode) */}
              {isMyTasksMode && (
                <div className="bg-gradient-to-r from-indigo-50 via-white to-sky-50 rounded-2xl p-5 border border-indigo-100 shadow-xs flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900">
                          {currentUser.name}
                        </h2>
                        <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                          {currentUser.department}
                        </span>

                        {/* Work Status Dropdown (Working / Off / On Leave) */}
                        <div className="relative inline-flex items-center ml-1">
                          <select
                            value={getEffectiveWorkStatus(currentUser)}
                            onChange={(e) => store.updateUser(currentUser.id, { workStatus: e.target.value as UserWorkStatus })}
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer transition-all shadow-2xs focus:outline-none appearance-none pr-5 ${
                              getEffectiveWorkStatus(currentUser) === 'off'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : getEffectiveWorkStatus(currentUser) === 'on_leave'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={state.language === 'ar' ? 'تغيير حالة العمل اليوم' : "Today's Work Status"}
                          >
                            <option value="working">🟢 {t.workStatusWorking}</option>
                            <option value="off">🔴 {t.workStatusOff}</option>
                            <option value="on_leave">🌴 {t.workStatusOnLeave}</option>
                          </select>
                          <span className="absolute right-1.5 pointer-events-none text-[8px] text-slate-400">▼</span>
                        </div>

                        {/* Remaining Holidays Pill (Manual edit inline or click) */}
                        {!editingHolidays ? (
                          <div
                            onClick={() => {
                              setEditingHolidays(true);
                              setHolidayInputVal(currentUser.remainingHolidays ?? 21);
                            }}
                            className="group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white hover:bg-indigo-50/50 text-slate-700 border border-slate-200 hover:border-indigo-300 text-[11px] font-semibold cursor-pointer shadow-2xs transition-all"
                            title={state.language === 'ar' ? 'انقر لتعديل رصيد الإجازات المتبقية يدوياً' : 'Click to manually edit remaining holidays'}
                          >
                            <span>🏖️</span>
                            <span className="text-slate-500">{t.remainingHolidays}:</span>
                            <strong className="text-indigo-900 font-extrabold">{currentUser.remainingHolidays ?? 21}</strong>
                            <span className="text-[10px] text-slate-400 font-normal">{t.holidaysLeft}</span>
                            <Pencil className="w-2.5 h-2.5 text-slate-400 group-hover:text-indigo-600 transition-colors ml-0.5" />
                          </div>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              store.updateUser(currentUser.id, { remainingHolidays: Number(holidayInputVal) });
                              setEditingHolidays(false);
                            }}
                            className="inline-flex items-center gap-1 bg-white p-0.5 px-2 rounded-full border border-indigo-400 shadow-xs"
                          >
                            <span>🏖️</span>
                            <input
                              type="number"
                              min="0"
                              max="365"
                              autoFocus
                              value={holidayInputVal}
                              onChange={(e) => setHolidayInputVal(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-12 text-xs font-black text-indigo-700 bg-transparent text-center focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-400">{t.holidaysLeft}</span>
                            <button
                              type="submit"
                              className="w-4 h-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold cursor-pointer"
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingHolidays(false)}
                              className="w-4 h-4 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full flex items-center justify-center text-[9px] font-bold cursor-pointer"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </form>
                        )}

                        <button
                          type="button"
                          onClick={() => setProfileModalUser(currentUser)}
                          className="p-1 rounded-lg hover:bg-white text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title={state.language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit profile'}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Scheduled / Upcoming Days Off Bar */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {getUpcomingOffDates(currentUser).map((dateStr) => {
                          const isToday = dateStr === getTodayIsoLocal();
                          return (
                            <span
                              key={dateStr}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-bold shadow-2xs ${
                                isToday
                                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <span>📅 {state.language === 'ar' ? 'إجازة:' : 'Off:'} {formatOffDateShort(dateStr, state.language)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemovePlannedOffDate(currentUser, dateStr)}
                                className="hover:text-rose-600 text-slate-400 font-black ml-0.5 cursor-pointer"
                                title={state.language === 'ar' ? 'إلغاء يوم الإجازة واسترجاع الرصيد' : 'Remove day off & restore 1 holiday'}
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}

                        {!addingOffDate ? (
                          <button
                            type="button"
                            onClick={() => {
                              setAddingOffDate(true);
                              setOffStartDate(getNextFridayIso());
                              setOffEndDate('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                          >
                            <span>📅 + {state.language === 'ar' ? 'إضافة يوم إجازة' : 'Add Day Off'}</span>
                          </button>
                        ) : (
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleAddPlannedOffDates(currentUser, offStartDate, offEndDate);
                            }}
                            className="inline-flex items-center gap-1.5 bg-white p-1 px-2.5 rounded-xl border border-indigo-400 shadow-xs flex-wrap"
                          >
                            <span className="text-[10px] font-bold text-slate-500">
                              {state.language === 'ar' ? 'من:' : 'Date:'}
                            </span>
                            <input
                              type="date"
                              required
                              min={getTodayIsoLocal()}
                              value={offStartDate}
                              onChange={(e) => setOffStartDate(e.target.value)}
                              className="text-[11px] font-bold text-slate-800 border border-slate-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
                            />
                            <span className="text-[10px] font-bold text-slate-400">
                              {state.language === 'ar' ? 'إلى (اختياري):' : 'To (opt):'}
                            </span>
                            <input
                              type="date"
                              min={offStartDate || getTodayIsoLocal()}
                              value={offEndDate}
                              onChange={(e) => setOffEndDate(e.target.value)}
                              className="text-[11px] font-bold text-slate-800 border border-slate-200 rounded-lg px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const fri = getNextFridayIso();
                                setOffStartDate(fri);
                                setOffEndDate('');
                              }}
                              className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-bold cursor-pointer"
                              title="Set to upcoming Friday"
                            >
                              {state.language === 'ar' ? 'الجمعة القادمة' : 'Next Friday'}
                            </button>
                            <button
                              type="submit"
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              {state.language === 'ar' ? 'حفظ' : 'Add'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingOffDate(false)}
                              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </form>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1.5">
                        Your Personal Workbench: <strong>{myOpenTasks.length} active tasks assigned to you</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Personal Quick Stats */}
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
                      <ListTodo className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-slate-500">Active:</span>
                      <strong className="text-slate-800">{myOpenTasks.length}</strong>
                    </div>

                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-slate-500">Due Today:</span>
                      <strong className="text-amber-700">{myDueToday.length}</strong>
                    </div>

                    {myDelayed.length > 0 && (
                      <div className="bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 shadow-xs flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-rose-700 font-bold">{myDelayed.length} Delayed</span>
                      </div>
                    )}

                    <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-slate-500">Completed:</span>
                      <strong className="text-emerald-700">{myCompleted.length}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Task Sub-Header: Scope Switcher, View Mode Toggle & Filters */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
                {/* Left: Scope Selector (My Tasks vs Agency Overview) & View Mode */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Primary Scope Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                    <button
                      onClick={() => setActiveTab('myTasks')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'myTasks' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>{t.myTasks} ({myOpenTasks.length})</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('tasks')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'tasks' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>{t.allAgencyTasks} ({state.tasks.length})</span>
                    </button>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                    <button
                      onClick={() => setTaskViewMode('list')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        taskViewMode === 'list' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={t.viewList}
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.viewList}</span>
                    </button>

                    <button
                      onClick={() => setTaskViewMode('kanban')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        taskViewMode === 'kanban' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={t.viewKanban}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.viewKanban}</span>
                    </button>

                    <button
                      onClick={() => setTaskViewMode('calendar')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        taskViewMode === 'calendar' 
                          ? 'bg-white text-indigo-700 shadow-xs font-bold' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={t.viewCalendar}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{t.viewCalendar}</span>
                    </button>
                  </div>
                </div>

                {/* Right Filters Dropdowns */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {/* Client Filter */}
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
                  >
                    <option value="all">{t.allClients}</option>
                    {state.clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  {/* Assignee Filter (Only shown when in All Agency Tasks mode) */}
                  {!isMyTasksMode && (
                    <select
                      value={selectedAssigneeId}
                      onChange={(e) => setSelectedAssigneeId(e.target.value)}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
                    >
                      <option value="all">{t.allEmployees}</option>
                      {state.users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  )}

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
                  >
                    <option value="all">{t.allStatuses}</option>
                    <option value="Not started">{t.statusNotStarted}</option>
                    <option value="Briefed">{t.statusBriefed}</option>
                    <option value="In progress">{t.statusInProgress}</option>
                    <option value="Completed">{t.statusCompleted}</option>
                    <option value="overdue">⚠️ {t.statusDelayed} (Auto Detected)</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
                  >
                    <option value="all">{t.allPriorities}</option>
                    <option value="Normal">{t.priorityNormal}</option>
                    <option value="High">{t.priorityHigh}</option>
                    <option value="Urgent">{t.priorityUrgent}</option>
                    <option value="Super Urgent">{t.prioritySuperUrgent}</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{t.clearFilters}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* View Render */}
              {taskViewMode === 'kanban' && (
                <KanbanBoard store={store} state={state} tasks={filteredTasks} onSelectTask={handleOpenTask} />
              )}
              {taskViewMode === 'list' && (
                <TaskList store={store} state={state} tasks={filteredTasks} onSelectTask={handleOpenTask} />
              )}
              {taskViewMode === 'calendar' && (
                <CalendarView store={store} state={state} tasks={filteredTasks} onSelectTask={handleOpenTask} />
              )}
            </div>
          )}

          {/* View 2: Workload & Heatmap */}
          {activeTab === 'workload' && (
            <WorkloadView
              store={store}
              state={state}
              onSelectEmployee={(userId) => {
                setEmployeeProfileUserId(userId);
                setActiveTab('employeeHistory');
              }}
            />
          )}

          {/* View 3: Client WIP Sheet */}
          {activeTab === 'clientWip' && (
            <ClientWipView
              store={store}
              state={state}
              onFilterByClient={(cliId) => {
                setSelectedClientId(cliId);
                setActiveTab('tasks');
              }}
            />
          )}

          {/* View 4: Recurrence Rules */}
          {activeTab === 'recurrence' && <RecurrenceView store={store} state={state} />}

          {/* View 5: Employee History & Audit Log */}
          {activeTab === 'employeeHistory' && (
            <EmployeeProfile
              store={store}
              state={state}
              selectedUserId={employeeProfileUserId}
              onSelectUser={(userId) => setEmployeeProfileUserId(userId)}
            />
          )}

          {/* View 6: Excel Migration */}
          {activeTab === 'excelMigration' && <ImportExportView store={store} state={state} />}

          {/* View 7: Email Notifications & Logs Hub */}
          {activeTab === 'emails' && (
            <EmailHubView
              store={store}
              state={state}
              onOpenTaskModal={handleOpenTask}
              initialTab="preview"
            />
          )}

          {/* View 8: Secure server email configuration */}
          {activeTab === 'emailSettings' && (
            <EmailHubView
              store={store}
              state={state}
              onOpenTaskModal={handleOpenTask}
              initialTab="settings"
            />
          )}

          {/* View 9: Team & Settings */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 space-y-6 border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t.navSettings}</h2>
                  <p className="text-xs text-slate-500">
                    {state.language === 'ar'
                      ? 'أعضاء الفريق، الصلاحيات، والصور والبريد الإلكتروني المحدث على الخادم مباشرة.'
                      : 'Team members, departments, roles, and live server-synced photos and email addresses.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{state.language === 'ar' ? 'مزامنة الخادم نشطة' : 'Live Server Sync Active'}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.users.map((u) => (
                  <div key={u.id} className="bg-slate-50/70 hover:bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:shadow-card transition-all flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3 w-full">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative group shrink-0">
                          <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="truncate">{u.name}</span>
                            {u.id === state.currentUserId && (
                              <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded uppercase shrink-0">
                                {state.language === 'ar' ? 'أنت' : 'You'}
                              </span>
                            )}
                          </h4>
                          <div className="text-xs text-slate-500 truncate">{u.department}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px]" title={u.email}>{u.email}</div>
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="inline-block text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                              {u.role}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                              getEffectiveWorkStatus(u) === 'off'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : getEffectiveWorkStatus(u) === 'on_leave'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              <span>{getEffectiveWorkStatus(u) === 'off' ? '🔴' : getEffectiveWorkStatus(u) === 'on_leave' ? '🌴' : '🟢'}</span>
                              <span>{getEffectiveWorkStatus(u) === 'off' ? t.workStatusOff : getEffectiveWorkStatus(u) === 'on_leave' ? t.workStatusOnLeave : t.workStatusWorking}</span>
                            </span>
                            <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>🏖️</span>
                              <span>{u.remainingHolidays ?? 21} {t.holidaysLeft}</span>
                            </span>
                            {getUpcomingOffDates(u).map((d) => (
                              <span key={d} className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                📅 Off: {formatOffDateShort(d, state.language)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Edit Button - Visible if Current User is Admin OR if it's the user's own card */}
                      {(state.currentRole === 'admin' || u.id === state.currentUserId) && (
                        <button
                          type="button"
                          onClick={() => setProfileModalUser(u)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
                          title={state.language === 'ar' ? 'تعديل الصورة والبيانات' : 'Edit Photo & Profile'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      {showTaskModal && (
        <TaskModal
          store={store}
          state={state}
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {showBulkModal && (
        <BulkTaskModal
          store={store}
          state={state}
          onClose={() => setShowBulkModal(false)}
        />
      )}

      {showNotifications && (
        <NotificationCenter
          store={store}
          state={state}
          onClose={() => setShowNotifications(false)}
          onSelectTask={handleSelectNotificationTask}
        />
      )}

      {/* Edit Profile Modal */}
      {profileModalUser && (
        <EditProfileModal
          store={store}
          state={state}
          user={profileModalUser}
          onClose={() => setProfileModalUser(null)}
        />
      )}

      {/* High Five Celebration Overlay */}
      {celebratingTask && (
        <HighFiveCelebration
          taskTitle={celebratingTask.title}
          onClose={() => setCelebratingTask(null)}
        />
      )}
    </div>
  );
}
