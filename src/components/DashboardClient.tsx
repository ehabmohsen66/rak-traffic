'use client';

import React, { useState, useEffect } from 'react';
import { TrafficStore, store } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { Task } from '@/lib/types';
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
import { readUrlParams, updateUrl } from '@/lib/useUrlSync';
import { 
  LayoutGrid, 
  List, 
  Calendar as CalendarIcon, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  User,
  ListTodo,
  Building
} from 'lucide-react';

export default function DashboardClient() {
  const [state, setState] = useState(store.getState());
  const [celebratingTask, setCelebratingTask] = useState<Task | null>(null);

  useEffect(() => {
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

  // Navigation & View Mode: Default to 'tasks' (All Agency Tasks)
  const [activeTab, setActiveTab] = useState<MainTab>('tasks');
  const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');

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

    if (selectedClientId !== 'all' && task.clientId !== selectedClientId) return false;
    if (!isMyTasksMode && selectedAssigneeId !== 'all' && task.assignedToId !== selectedAssigneeId) return false;
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;

    return true;
  });

  // User personal metrics
  const myTasks = state.tasks.filter((t) => t.assignedToId === state.currentUserId);
  const myOpenTasks = myTasks.filter((t) => t.status !== 'Completed');
  const todayStr = new Date().toISOString().split('T')[0];
  const myDueToday = myTasks.filter((t) => t.dueDate === todayStr && t.status !== 'Completed');
  const myDelayed = myTasks.filter((t) => t.status === 'Delayed');
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
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">
                          {currentUser.name}
                        </h2>
                        <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                          {currentUser.department}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
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
                      <User className="w-3.5 h-3.5" />
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
                    <option value="Delayed">{t.statusDelayed}</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs cursor-pointer"
                  >
                    <option value="all">{t.allPriorities}</option>
                    <option value="Normal">{t.priorityNormal}</option>
                    <option value="Urgent">{t.priorityUrgent}</option>
                    <option value="High">{t.priorityHigh}</option>
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
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">{t.navSettings}</h2>
                <p className="text-xs text-slate-500">Team members, departments, and active role configurations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.users.map((u) => (
                  <div key={u.id} className="bg-slate-50/70 hover:bg-white rounded-2xl p-4 flex items-center gap-3.5 border border-slate-200 shadow-xs hover:shadow-card transition-all">
                    <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">{u.name}</h4>
                      <div className="text-xs text-slate-500">{u.department}</div>
                      <span className="inline-block text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                        {u.role}
                      </span>
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
