'use client';

import React, { useState } from 'react';
import { Task, TaskStatus, Priority, User } from '@/lib/types';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { 
  X, 
  MessageSquare, 
  Send,
  Mail,
  ChevronDown,
  Check
} from 'lucide-react';
import { EmailNotificationType } from '@/lib/types';
import { getErrorMessage } from '@/lib/errors';

interface TaskModalProps {
  store: TrafficStore;
  state: AppState;
  task?: Task | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  store,
  state,
  task,
  onClose,
}) => {
  const t = translations[state.language];
  const isEditing = !!task;

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(task?.title || '');
  const [clientId, setClientId] = useState(task?.clientId || state.clients[0]?.id || 'cli-1');
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId || state.users[2]?.id || 'usr-3');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'Normal');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'Not started');
  const [briefDate, setBriefDate] = useState(task?.briefDate || todayStr);
  const [dueDate, setDueDate] = useState(task?.dueDate || todayStr);
  const [notes, setNotes] = useState(task?.notes || '');
  const [newComment, setNewComment] = useState('');
  const [showEmailMenu, setShowEmailMenu] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  const comments = task ? state.comments[task.id] || [] : [];

  const handleSendEmailAction = async (type: EmailNotificationType) => {
    if (!task) return;
    setSendingEmail(true);
    setShowEmailMenu(false);
    try {
      await store.sendCustomTaskEmail(task.id, type);
      const assigneeName = store.getUserName(task.assignedToId);
      setEmailSuccessMsg(
        state.language === 'ar'
          ? `تم إرسال إشعار البريد الإلكتروني بنجاح إلى ${assigneeName}!`
          : `Email notification successfully dispatched to ${assigneeName}!`
      );
      setTimeout(() => setEmailSuccessMsg(null), 4000);
    } catch (err: unknown) {
      alert(`Error sending email: ${getErrorMessage(err, 'Unknown delivery error')}`);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && task) {
      store.updateTask(task.id, {
        title,
        clientId,
        assignedToId,
        priority,
        status,
        briefDate,
        dueDate,
        notes
      });
    } else {
      store.addTask({
        title,
        clientId,
        assignedToId,
        assignedById: state.currentUserId,
        priority,
        status,
        briefDate,
        dueDate,
        notes
      });
    }
    onClose();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    store.addComment(task.id, newComment);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">
              {isEditing ? t.edit : t.newTask}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && task && (
              <>
                {/* Send Email Action Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmailMenu(!showEmailMenu)}
                    disabled={sendingEmail}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-colors cursor-pointer disabled:opacity-50"
                    title="Send Email notification for this task"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{sendingEmail ? 'Sending...' : state.language === 'ar' ? 'إرسال بريد' : 'Email Brief'}</span>
                    <ChevronDown className="w-3 h-3 opacity-80" />
                  </button>

                  {showEmailMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 space-y-1 text-left">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Email To Dispatch:
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleSendEmailAction('assigned')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>🚀 Task Assignment Brief</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendEmailAction('due_today')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-800 hover:bg-amber-50 hover:text-amber-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>⏰ Deadline Today Reminder</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendEmailAction('overdue')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-800 hover:bg-rose-50 hover:text-rose-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>🚨 Daily Overdue Escalation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendEmailAction('completed')}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>✅ Completed Notice to Manager</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}?task=${task.id}`;
                    navigator.clipboard.writeText(url);
                    alert(state.language === 'ar' ? 'تم نسخ رابط المهمة المباشر!' : 'Task direct link copied to clipboard!');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy direct task URL"
                >
                  <span>🔗 {state.language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email Success Toast */}
        {emailSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{emailSuccessMsg}</span>
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">{t.colTaskTitle}</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Back-to-School Social Media Carousel Brief"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t.filterByClient}</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {state.clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.retainerType})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t.colAssignee}</label>
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {state.users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t.colStatus}</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Not started">{t.statusNotStarted}</option>
                <option value="Briefed">{t.statusBriefed}</option>
                <option value="In progress">{t.statusInProgress}</option>
                <option value="Completed">{t.statusCompleted}</option>
                <option value="Delayed">{t.statusDelayed}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t.colPriority}</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Normal">{t.priorityNormal}</option>
                <option value="Urgent">{t.priorityUrgent}</option>
                <option value="High">{t.priorityHigh}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t.colBriefDate}</label>
              <input
                type="date"
                value={briefDate}
                onChange={(e) => setBriefDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">{t.colDueDate}</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">{t.colNotes}</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Task scope, references, deliverables, guidelines..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm shadow-indigo-200 cursor-pointer"
            >
              {t.save}
            </button>
          </div>
        </form>

        {/* Comments Section (If Editing existing task) */}
        {isEditing && task && (
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-slate-800">Comments & Activity Thread</h4>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-[11px] text-slate-400 italic">No comments yet. Start the conversation below.</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <img src={c.userAvatar} alt={c.userName} className="w-4 h-4 rounded-full border border-slate-200" />
                        <span>{c.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{c.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or update note..."
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
