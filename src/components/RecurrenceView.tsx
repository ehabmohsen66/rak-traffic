'use client';

import React, { useState } from 'react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { RecurrenceRule, RecurrenceType, Priority } from '@/lib/types';
import { Repeat, Plus, Play, Calendar, CheckCircle2, XCircle, Trash2, X } from 'lucide-react';

interface RecurrenceViewProps {
  store: TrafficStore;
  state: AppState;
}

export const RecurrenceView: React.FC<RecurrenceViewProps> = ({ store, state }) => {
  const t = translations[state.language];

  const [showAddModal, setShowAddModal] = useState(false);
  const [titleTemplate, setTitleTemplate] = useState('');
  const [clientId, setClientId] = useState(state.clients[0]?.id || 'cli-1');
  const [assignedToId, setAssignedToId] = useState(state.users[2]?.id || 'usr-3');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [notes, setNotes] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('weekly');
  const [interval, setIntervalVal] = useState(1);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleTemplate.trim()) return;

    const todayStr = new Date().toISOString().split('T')[0];

    store.addRecurrenceRule({
      titleTemplate,
      clientId,
      assignedToId,
      priority,
      notes,
      recurrenceType,
      interval,
      startDate: todayStr,
      nextRunDate: todayStr,
      active: true
    });

    setTitleTemplate('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleRunScheduler = () => {
    store.evaluateAutomaticDelaysAndRecurrence();
    alert('Recurrence Engine evaluated! Checked active rules and generated upcoming tasks.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.activeRules}</h2>
            <p className="text-xs text-slate-500">
              Automated weekly & monthly task generator. Instances are created automatically on scheduled dates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunScheduler}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Simulate background cron run"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            <span>Run Scheduler Now</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addRule}</span>
          </button>
        </div>
      </div>

      {/* Rules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.recurrenceRules.map((rule) => {
          const clientName = store.getClientName(rule.clientId);
          const assigneeName = store.getUserName(rule.assignedToId);

          return (
            <div
              key={rule.id}
              className={`rounded-2xl p-5 space-y-4 border transition-all shadow-xs ${
                rule.active 
                  ? 'bg-white border-purple-200/80 hover:shadow-card' 
                  : 'bg-slate-50/70 border-slate-200 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{rule.titleTemplate}</h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mt-1">
                    <span>Client: {clientName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700">Assignee: {assigneeName}</span>
                  </div>
                </div>

                <button
                  onClick={() => store.toggleRecurrenceRule(rule.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    rule.active 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {rule.active ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{rule.active ? 'Active' : 'Paused'}</span>
                </button>
              </div>

              {rule.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                  {rule.notes}
                </p>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg font-bold uppercase text-[11px]">
                    {rule.recurrenceType} (Every {rule.interval})
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Next: <strong className="text-slate-800">{rule.nextRunDate}</strong>
                  </span>
                </div>

                <button
                  onClick={() => store.deleteRecurrenceRule(rule.id)}
                  className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{t.addRule}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Task Title Template</label>
                <input
                  type="text"
                  required
                  value={titleTemplate}
                  onChange={(e) => setTitleTemplate(e.target.value)}
                  placeholder="e.g. Weekly Social Media Content Brief"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.filterByClient}</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {state.clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.filterByEmployee}</label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    {state.users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.repeatType}</label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t.filterByPriority}</label>
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
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes Template</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Template instructions carried over to generated tasks..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
