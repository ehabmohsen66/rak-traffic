'use client';

import React from 'react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { Bell, AlertTriangle, CheckCircle2, UserCheck, Clock, X } from 'lucide-react';

interface NotificationCenterProps {
  store: TrafficStore;
  state: AppState;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  store,
  state,
  onClose,
  onSelectTask,
}) => {
  const t = translations[state.language];

  // User notifications
  const userNotifs = state.notifications.filter(
    (n) => n.userId === state.currentUserId || state.currentRole === 'admin'
  );

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'assigned':
      case 'reassigned':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'status_changed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-start justify-end p-4 pt-16" onClick={onClose}>
      <div 
        className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-dropdown animate-in slide-in-from-top-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => store.markAllNotificationsAsRead()}
                className="text-[10px] text-indigo-600 hover:underline font-semibold px-2 py-1 cursor-pointer"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Items List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {userNotifs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No notifications.</div>
          ) : (
            userNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  store.markNotificationAsRead(n.id);
                  if (n.taskId) onSelectTask(n.taskId);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                  n.read 
                    ? 'bg-slate-50 border-slate-100 text-slate-600' 
                    : 'bg-indigo-50/60 border-indigo-200 text-slate-900 font-semibold shadow-2xs'
                }`}
              >
                <div className="p-1.5 bg-white border border-slate-200 rounded-lg shrink-0 mt-0.5 shadow-2xs">
                  {getNotifIcon(n.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="leading-snug">{n.message}</p>
                  <span className="text-[10px] text-slate-400 block font-normal">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
