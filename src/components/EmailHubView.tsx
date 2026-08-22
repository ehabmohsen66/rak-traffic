'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { 
  EmailLog, 
  EmailNotificationType, 
  EmailProviderType, 
  Task 
} from '@/lib/types';
import { 
  generateTaskAssignedEmail, 
  generateDueTodayEmail, 
  generateOverdueDailyEmail, 
  generateTaskCompletedEmail, 
  generateTestEmail 
} from '@/lib/emailTemplates';
import { getErrorMessage } from '@/lib/errors';
import { 
  Mail, 
  Send, 
  Eye, 
  Settings, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Copy, 
  Check, 
  ExternalLink, 
  Filter, 
  X, 
  Trash2, 
  Zap, 
  ShieldCheck,
  Calendar,
  UserCheck
} from 'lucide-react';

interface EmailHubViewProps {
  store: TrafficStore;
  state: AppState;
  onOpenTaskModal?: (task: Task) => void;
  initialTab?: 'preview' | 'logs' | 'settings';
}

interface EmailServerStatus {
  provider: EmailProviderType;
  credentialConfigured: boolean;
  deliveryMode: 'simulated' | 'live';
  fromName: string | null;
  fromEmail: string | null;
  replyTo: string | null;
  allowedDomains: string[];
  serverManaged: true;
}

export const EmailHubView: React.FC<EmailHubViewProps> = ({
  store,
  state,
  onOpenTaskModal,
  initialTab = 'preview',
}) => {
  const t = translations[state.language];
  const isRtl = state.language === 'ar';

  const [activeTab, setActiveTab] = useState<'preview' | 'logs' | 'settings'>(initialTab);

  // Previewer State
  const [selectedTemplate, setSelectedTemplate] = useState<EmailNotificationType>('assigned');
  const [selectedTaskId, setSelectedTaskId] = useState<string>(state.tasks[0]?.id || '');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [viewSource, setViewSource] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  // Logs State
  const [logSearch, setLogSearch] = useState('');
  const [logFilterType, setLogFilterType] = useState<string>('all');
  const [logFilterStatus, setLogFilterStatus] = useState<string>('all');
  const [selectedLogForModal, setSelectedLogForModal] = useState<EmailLog | null>(null);

  // Settings State
  const [provider, setProvider] = useState<EmailProviderType>(state.emailConfig.provider || 'simulated');
  const [fromName, setFromName] = useState(state.emailConfig.fromName || 'RAK 4 CREATIVE Traffic');
  const [fromEmail, setFromEmail] = useState(state.emailConfig.fromEmail || 'traffic@rak4creative.com');
  const [replyTo, setReplyTo] = useState(state.emailConfig.replyTo || 'farah.y@rak4creative.com');
  const [enableAssignmentEmails, setEnableAssignmentEmails] = useState(state.emailConfig.enableAssignmentEmails);
  const [enableDailyReminders, setEnableDailyReminders] = useState(state.emailConfig.enableDailyReminders);
  const [testEmailRecipient, setTestEmailRecipient] = useState(
    state.users.find((u) => u.id === state.currentUserId)?.email || 'ehab.m@rak4creative.com'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [dailyScanRunning, setDailyScanRunning] = useState(false);
  const [dailyScanResultBanner, setDailyScanResultBanner] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<EmailServerStatus | null>(null);
  const [serverStatusLoading, setServerStatusLoading] = useState(true);
  const [serverStatusError, setServerStatusError] = useState<string | null>(null);

  const loadServerStatus = useCallback(async () => {
    setServerStatusLoading(true);
    setServerStatusError(null);
    try {
      const response = await fetch('/api/email/config', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }
      const status: EmailServerStatus = await response.json();
      setServerStatus(status);
      setProvider(status.provider);
      if (status.fromName) setFromName(status.fromName);
      if (status.fromEmail) setFromEmail(status.fromEmail);
      if (status.replyTo) setReplyTo(status.replyTo);
    } catch (error) {
      setServerStatusError(error instanceof Error ? error.message : 'Unable to read server email status');
    } finally {
      setServerStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    // Synchronize with the external server configuration endpoint on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadServerStatus();
  }, [loadServerStatus]);

  // Compute selected task object for live preview
  const currentTask = useMemo(() => {
    return state.tasks.find((t) => t.id === selectedTaskId) || state.tasks[0];
  }, [state.tasks, selectedTaskId]);

  const currentAssignee = useMemo(() => {
    if (!currentTask) return state.users[4] || state.users[0];
    return state.users.find((u) => u.id === currentTask.assignedToId) || state.users[0];
  }, [state.users, currentTask]);

  const currentAssigner = useMemo(() => {
    if (!currentTask) return state.users[2] || state.users[0];
    return state.users.find((u) => u.id === currentTask.assignedById) || state.users[0];
  }, [state.users, currentTask]);

  const currentClient = useMemo(() => {
    if (!currentTask) return state.clients[0];
    return state.clients.find((c) => c.id === currentTask.clientId) || state.clients[0];
  }, [state.clients, currentTask]);

  // Generate Email Preview Content in real-time
  const renderedEmail = useMemo(() => {
    if (!currentTask) {
      return {
        subject: 'No task selected',
        html: '<p>Please select a task to preview</p>',
        text: 'Please select a task to preview'
      };
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    switch (selectedTemplate) {
      case 'assigned':
      case 'reassigned':
        return generateTaskAssignedEmail({
          task: currentTask,
          assignee: currentAssignee,
          assigner: currentAssigner,
          client: currentClient,
          baseUrl
        });

      case 'due_today':
      case 'due_soon':
        return generateDueTodayEmail({
          task: currentTask,
          assignee: currentAssignee,
          assigner: currentAssigner,
          client: currentClient,
          baseUrl
        });

      case 'overdue': {
        const todayStr = new Date().toISOString().split('T')[0];
        const dueDateObj = new Date(currentTask.dueDate);
        const diffTime = dueDateObj.getTime() - new Date(todayStr).getTime();
        const daysOverdue = Math.max(1, Math.abs(Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

        return generateOverdueDailyEmail({
          task: currentTask,
          assignee: currentAssignee,
          assigner: currentAssigner,
          client: currentClient,
          baseUrl,
          daysOverdue
        });
      }

      case 'completed':
        return generateTaskCompletedEmail({
          task: currentTask,
          assignee: currentAssignee,
          assigner: currentAssigner,
          client: currentClient,
          baseUrl
        });

      case 'test':
      default:
        return generateTestEmail({
          recipientName: currentAssignee.name,
          recipientEmail: currentAssignee.email,
          baseUrl
        });
    }
  }, [selectedTemplate, currentTask, currentAssignee, currentAssigner, currentClient]);

  // Copy HTML snippet
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(renderedEmail.html);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // Send test email from previewer
  const handleSendCurrentPreview = async () => {
    if (!currentAssignee.email) return;
    setSendingTest(true);
    setTestSuccessMessage(null);
    try {
      const result = await store.sendCustomTaskEmail(currentTask.id, selectedTemplate);
      if (!result.success) {
        throw new Error(result.error || 'The email provider rejected this message.');
      }
      setTestSuccessMessage(
        state.language === 'ar'
          ? `تم إرسال بريد "${renderedEmail.subject}" بنجاح إلى ${currentAssignee.email}!`
          : `Email "${renderedEmail.subject}" successfully sent to ${currentAssignee.email}!`
      );
      setTimeout(() => setTestSuccessMessage(null), 5000);
    } catch (err: unknown) {
      alert(`Error sending email: ${getErrorMessage(err, 'Unknown delivery error')}`);
    } finally {
      setSendingTest(false);
    }
  };

  // Save Config
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateEmailConfig({
      provider,
      fromName: fromName.trim(),
      fromEmail: fromEmail.trim(),
      replyTo: replyTo.trim(),
      enableAssignmentEmails,
      enableDailyReminders
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Trigger manual daily scan
  const handleRunDailyScan = async () => {
    setDailyScanRunning(true);
    setDailyScanResultBanner(null);
    try {
      const scanResult = await store.runDailyEmailScan(true);
      setDailyScanResultBanner(
        state.language === 'ar'
          ? `اكتمل الفحص اليومي: تم مسح ${scanResult.totalActiveTasksScanned} مهمة نشطة. تم إرسال ${scanResult.totalDispatched} بريد (${scanResult.dueTodaySent} تسليم اليوم، ${scanResult.overdueSent} متأخرة، وتخطي ${scanResult.skippedAlreadySentToday} أُرسلت اليوم بالفعل).`
          : `Daily scan complete: Scanned ${scanResult.totalActiveTasksScanned} active tasks. Dispatched ${scanResult.totalDispatched} emails (${scanResult.dueTodaySent} due today, ${scanResult.overdueSent} overdue, and skipped ${scanResult.skippedAlreadySentToday} already sent today).`
      );
    } catch (err: unknown) {
      alert(`Error running scan: ${getErrorMessage(err, 'Unknown scan error')}`);
    } finally {
      setDailyScanRunning(false);
    }
  };

  // Filtered Logs
  const filteredLogs = state.emailLogs.filter((log) => {
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      const matchSub = log.subject.toLowerCase().includes(q);
      const matchRec = log.recipientName.toLowerCase().includes(q) || log.recipientEmail.toLowerCase().includes(q);
      const matchTask = (log.taskTitle || '').toLowerCase().includes(q);
      if (!matchSub && !matchRec && !matchTask) return false;
    }
    if (logFilterType !== 'all' && log.type !== logFilterType) return false;
    if (logFilterStatus !== 'all' && log.status !== logFilterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Lebanese Cedar Ambient Decoration */}
        <div className="absolute -right-8 -bottom-8 text-indigo-500/10 pointer-events-none transform rotate-12">
          <svg viewBox="0 0 36 36" fill="currentColor" className="w-64 h-64">
            <path d="M18 2L15.5 6.5H17L13.5 11.5H16L10.5 17.5H14L6.5 25H16.5V31H19.5V25H29.5L22 17.5H25.5L20 11.5H22.5L19 6.5H20.5L18 2Z" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1.5">
                <span>🇱🇧</span>
                <span>Beirut Traffic Engine</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>1 Email/Day Daily Escalation</span>
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              {state.language === 'ar' ? 'نظام إشعارات البريد الإلكتروني الذكي' : 'Email Notification & Dispatch System'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {state.language === 'ar'
                ? 'إرسال بريد إلكتروني مفصل وأنيق للموظف فور تعيين المهمة، مع متابعة وتحديث يومي مستمر (إيميل واحد يومياً) عند اقتراب أو تجاوز موعد التسليم حتى إغلاق المهمة.'
                : 'Automatic task assignment dispatches with rich brief details, plus guaranteed 1-email-per-day deadline reminders and overdue escalations until tasks are completed.'}
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-28">
              <div className="text-2xl font-black text-white">{state.emailLogs.length}</div>
              <div className="text-[11px] font-medium text-indigo-200">Dispatched</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center min-w-28">
              <div className="text-2xl font-black text-amber-300">
                {state.tasks.filter((t) => t.status === 'Delayed').length}
              </div>
              <div className="text-[11px] font-medium text-amber-200">Active Overdue</div>
            </div>

            <button
              onClick={handleRunDailyScan}
              disabled={dailyScanRunning}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold px-4 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
              title="Run 1 email/day deadline scan immediately"
            >
              <RefreshCw className={`w-4 h-4 ${dailyScanRunning ? 'animate-spin' : ''}`} />
              <span className="text-xs">{dailyScanRunning ? 'Scanning...' : 'Run Daily Scan'}</span>
            </button>
          </div>
        </div>

        {/* Daily Scan Result Banner */}
        {dailyScanResultBanner && (
          <div className="mt-4 bg-indigo-900/80 border border-indigo-400/40 text-indigo-100 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dailyScanResultBanner}</span>
            </div>
            <button
              onClick={() => setDailyScanResultBanner(null)}
              className="text-indigo-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>{state.language === 'ar' ? 'المعاينة الحية والتصاميم' : 'Live Template Designer & Preview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>{state.language === 'ar' ? 'سجل الرسائل الصادرة' : 'Email Outbox & Activity Logs'}</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-100">
              {state.emailLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-600" />
            <span>{state.language === 'ar' ? 'إعدادات المزود والربط' : 'Email Engine & Provider Settings'}</span>
          </button>
        </div>

        {/* Current Active Provider Pill */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Dispatcher:</span>
          <span className="uppercase text-slate-900 font-extrabold bg-slate-100 px-2 py-0.5 rounded-md">
            {serverStatus?.provider || provider}
          </span>
        </div>
      </div>

      {/* TAB 1: LIVE TEMPLATE DESIGNER & PREVIEW */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Control Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {state.language === 'ar' ? 'اختيار نوع القالب' : '1. Select Email Template'}
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                {state.language === 'ar' ? 'اختر الإشعار لمعاينته مباشرة' : 'Preview branded templates for each notification trigger'}
              </p>

              <div className="space-y-1.5">
                {[
                  {
                    id: 'assigned' as EmailNotificationType,
                    name: state.language === 'ar' ? '🚀 تعيين مهمة جديدة (شامل كل التفاصيل)' : '🚀 Task Assignment (Full Details & Brief)',
                    desc: 'Dispatched immediately when task is created or reassigned.'
                  },
                  {
                    id: 'due_today' as EmailNotificationType,
                    name: state.language === 'ar' ? '⏰ تذكير موعد اليوم (Due Today)' : '⏰ Deadline Today Reminder',
                    desc: 'Sent on the day of delivery.'
                  },
                  {
                    id: 'overdue' as EmailNotificationType,
                    name: state.language === 'ar' ? '🚨 تصعيد التأخير اليومي (1 إيميل/يوم)' : '🚨 Daily Overdue Escalation (1 email/day)',
                    desc: 'Sent daily for delayed tasks until marked Completed.'
                  },
                  {
                    id: 'completed' as EmailNotificationType,
                    name: state.language === 'ar' ? '✅ إشعار إكمال المهمة للمدير' : '✅ Task Completed Notification (To Manager)',
                    desc: 'Sent to manager when assignee finishes work.'
                  }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTemplate(item.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all cursor-pointer border ${
                      selectedTemplate === item.id
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">{item.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Task Selector */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                {state.language === 'ar' ? '2. اختيار المهمة للمعاينة الحية' : '2. Preview with Workspace Task Data'}
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {state.tasks.map((task) => {
                  const client = state.clients.find((c) => c.id === task.clientId);
                  const assignee = state.users.find((u) => u.id === task.assignedToId);
                  return (
                    <option key={task.id} value={task.id}>
                      [{task.priority}] {task.title} • {client?.name || 'Client'} ({assignee?.name || 'Assignee'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Task Quick Metadata Card */}
            {currentTask && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Assignee:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    <img src={currentAssignee.avatar} alt={currentAssignee.name} className="w-4 h-4 rounded-full" />
                    <span>{currentAssignee.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Recipient Email:</span>
                  <span className="font-mono text-[11px] text-indigo-600 font-semibold">{currentAssignee.email}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Due Date:</span>
                  <span className="font-bold text-rose-600">{currentTask.dueDate}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleSendCurrentPreview}
                disabled={sendingTest}
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>
                  {sendingTest
                    ? 'Dispatching...'
                    : state.language === 'ar'
                    ? `إرسال هذا الإيميل التجريبي إلى ${currentAssignee.name.split(' ')[0]}`
                    : `Dispatch This Email to ${currentAssignee.name.split(' ')[0]}`}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHtml}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedHtml ? 'Copied HTML!' : 'Copy HTML'}</span>
                </button>

                <button
                  onClick={() => setViewSource(!viewSource)}
                  className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>{viewSource ? 'Show Render' : 'View Code'}</span>
                </button>
              </div>

              {testSuccessMessage && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testSuccessMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Preview Viewport (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Viewport Top Bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject:</span>
                <span className="text-xs font-bold text-slate-800 truncate">{renderedEmail.subject}</span>
              </div>

              {/* View Mode Toggle: Desktop vs Mobile */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'desktop'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>

                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    previewDevice === 'mobile'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Email Viewport Container */}
            <div className="bg-slate-200/70 p-4 lg:p-8 rounded-2xl border border-slate-300/80 flex items-center justify-center min-h-[620px] overflow-hidden">
              {viewSource ? (
                <div className="w-full max-h-[580px] overflow-y-auto bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs leading-relaxed border border-slate-800">
                  <pre>{renderedEmail.html}</pre>
                </div>
              ) : (
                <div
                  className={`transition-all duration-300 overflow-hidden shadow-2xl rounded-2xl border border-slate-300 bg-white ${
                    previewDevice === 'mobile'
                      ? 'w-[375px] max-w-full h-[650px] ring-8 ring-slate-800'
                      : 'w-full max-w-[620px] h-[650px]'
                  }`}
                >
                  {/* Embedded IFrame for clean styling isolation */}
                  <iframe
                    srcDoc={renderedEmail.html}
                    title="Email Preview"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-same-origin allow-popups"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OUTBOX & ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
          {/* Log Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search logs by subject, recipient, or task title..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={logFilterType}
                onChange={(e) => setLogFilterType(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Email Types</option>
                <option value="assigned">Task Assigned</option>
                <option value="due_today">Due Today</option>
                <option value="overdue">Overdue (Daily)</option>
                <option value="completed">Task Completed</option>
                <option value="test">Test Connection</option>
              </select>

              <select
                value={logFilterStatus}
                onChange={(e) => setLogFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="simulated">Simulated (Dev)</option>
                <option value="failed">Failed</option>
              </select>

              {state.emailLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all email outbox logs?')) {
                      store.clearEmailLogs();
                    }
                  }}
                  className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Clear email logs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200">
                  <th className="p-3">Time & Date</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3">Email Subject & Task</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No email dispatch logs found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">
                          {new Date(log.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(log.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-800">{log.recipientName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{log.recipientEmail}</div>
                      </td>

                      <td className="p-3 max-w-xs">
                        <div className="font-bold text-slate-900 truncate" title={log.subject}>
                          {log.subject}
                        </div>
                        {log.taskTitle && (
                          <div className="text-[11px] text-indigo-600 font-semibold truncate">
                            Task: {log.taskTitle}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            log.type === 'overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : log.type === 'due_today'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : log.type === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}
                        >
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3">
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                              log.status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : log.status === 'failed'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {log.status === 'delivered' && <Check className="w-3 h-3 text-emerald-600" />}
                            {log.status === 'failed' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                            <span>{log.status} ({log.provider})</span>
                          </span>

                          {log.errorMessage && (
                            <div className="text-[10px] text-rose-600 mt-1 max-w-xs font-normal leading-tight bg-rose-50/50 p-1.5 rounded-lg border border-rose-100">
                              ⚠️ {log.errorMessage}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedLogForModal(log)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          View HTML
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS & DISPATCHER CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Settings Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Email Dispatcher Configuration</h3>
              <p className="text-xs text-slate-500">
                Check the secure server connection and manage workspace sender previews and notification rules.
              </p>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-5 text-xs">
              {/* Secure server-side delivery connection */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <h4 className="font-bold text-slate-900">Server Delivery Connection</h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      The Resend API key is stored only in cPanel and is never returned to this browser.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadServerStatus()}
                    disabled={serverStatusLoading}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-50"
                  >
                    {serverStatusLoading ? 'Checking…' : 'Refresh Status'}
                  </button>
                </div>

                {serverStatusError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                    Unable to check server configuration: {serverStatusError}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Provider</div>
                      <div className="mt-1 font-black uppercase text-slate-900">
                        {serverStatus?.provider || 'Checking…'}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">API Credential</div>
                      <div className={`mt-1 font-black ${serverStatus?.provider === 'simulated' || serverStatus?.credentialConfigured ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {serverStatusLoading
                          ? 'Checking…'
                          : serverStatus?.provider === 'simulated'
                            ? 'Not required'
                          : serverStatus?.credentialConfigured
                            ? 'Configured securely'
                            : 'Missing on server'}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-400 font-bold">Delivery</div>
                      <div className={`mt-1 font-black uppercase ${serverStatus?.deliveryMode === 'live' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {serverStatus?.deliveryMode || 'Checking…'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-[11px] leading-relaxed text-indigo-900">
                  In cPanel → <strong>Setup Node.js App</strong> → Environment Variables, set
                  <code className="mx-1 rounded bg-indigo-100 px-1 py-0.5 font-mono">EMAIL_PROVIDER=resend</code>
                  and <code className="rounded bg-indigo-100 px-1 py-0.5 font-mono">RESEND_API_KEY</code>, then restart the app.
                  The key value is intentionally never displayed here.
                </div>

                {serverStatus?.allowedDomains.length ? (
                  <div className="text-[11px] text-slate-600">
                    Allowed recipient domains: <strong>{serverStatus.allowedDomains.join(', ')}</strong>
                  </div>
                ) : null}
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Workspace Sender Name</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="RAK 4 CREATIVE Traffic Operations"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Workspace Sender Email</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="traffic@rak4creative.com"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reply-To Address</label>
                <input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="farah.y@rak4creative.com"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="block font-bold text-slate-800 mb-2">Automated Notification Rules</label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAssignmentEmails}
                    onChange={(e) => setEnableAssignmentEmails(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-800">Dispatch Task Assignment Emails</div>
                    <div className="text-[11px] text-slate-500">
                      Instantly sends a comprehensive brief email with all task details when assigned or reassigned.
                    </div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDailyReminders}
                    onChange={(e) => setEnableDailyReminders(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-800">Daily Deadline & Overdue Reminders (1 Email / Day)</div>
                    <div className="text-[11px] text-slate-500">
                      Automatically sends exactly 1 reminder per day to the assignee for active tasks that are Due Today or Overdue until completed.
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-indigo-200 transition-all cursor-pointer"
                >
                  Save Settings
                </button>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Configuration saved successfully!</span>
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Right Verification Card (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-800">Send Test Email</h4>
              </div>

              <p className="text-xs text-slate-500">
                Verify live email delivery to your inbox via Resend.
              </p>

              {/* Free Onboarding Domain Notice */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-[11px] text-indigo-900 leading-relaxed">
                <span className="font-bold">💡 Resend Test Mode:</span> When using <code className="bg-indigo-100 px-1 py-0.5 rounded font-mono text-[10px]">onboarding@resend.dev</code>, Resend only allows sending to the email address registered on your Resend account (e.g. <span className="font-bold text-indigo-950">ehabmohsen66@gmail.com</span>). To send to <span className="font-semibold">@rak4creative.com</span>, add your domain in Resend.
              </div>

              <div className="space-y-2 text-xs">
                <label className="block font-semibold text-slate-700">Test Recipient Address</label>
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="ehabmohsen66@gmail.com"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={async () => {
                    if (!testEmailRecipient) {
                      alert('Please enter a recipient email address');
                      return;
                    }
                    try {
                      const res = await store.sendTestEmail(testEmailRecipient);
                      if (res.success && res.log?.status === 'delivered') {
                        alert(`✅ Test email delivered successfully to ${testEmailRecipient}! Check your inbox.`);
                      } else {
                        alert(`⚠️ Delivery Failed:\n${res.error || res.log?.errorMessage || 'Check outbox logs for error details'}`);
                      }
                    } catch (err: unknown) {
                      alert(`Test failed: ${getErrorMessage(err, 'Unknown delivery error')}`);
                    }
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>

            {/* Daily Schedule Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-5 border border-indigo-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-900">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold">1-Email-Per-Day Guarantee</h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                The daily scheduler automatically scans active tasks. Tasks scheduled for today or overdue will receive <strong>at most 1 email per 24-hour cycle</strong>, preventing mailbox spam while maintaining strict deadline accountability.
              </p>

              <button
                type="button"
                onClick={handleRunDailyScan}
                disabled={dailyScanRunning}
                className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 rounded-xl text-xs border border-indigo-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dailyScanRunning ? 'animate-spin' : ''}`} />
                <span>Trigger Manual Scan Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rendered Email Modal for Logs */}
      {selectedLogForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">{selectedLogForModal.subject}</h4>
                <p className="text-xs text-slate-500">
                  To: {selectedLogForModal.recipientName} ({selectedLogForModal.recipientEmail}) • {new Date(selectedLogForModal.sentAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedLogForModal(null)}
                className="p-1.5 bg-slate-100 text-slate-500 hover:text-slate-900 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedLogForModal.status === 'failed' && (
              <div className="bg-rose-50 border-b border-rose-100 p-3.5 px-4 text-xs text-rose-800 font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Delivery Error from Resend:</span>
                  <div className="mt-0.5 text-rose-700 font-normal">{selectedLogForModal.errorMessage}</div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-hidden p-4 bg-slate-100">
              <iframe
                srcDoc={selectedLogForModal.htmlBody}
                title="Rendered Email Modal"
                className="w-full h-full min-h-[500px] rounded-xl border border-slate-300 bg-white"
                sandbox="allow-same-origin allow-popups"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
