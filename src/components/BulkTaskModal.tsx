'use client';

import React, { useState } from 'react';
import { Priority } from '@/lib/types';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { X, Zap, Users, Building, CheckSquare, Square } from 'lucide-react';

interface BulkTaskModalProps {
  store: TrafficStore;
  state: AppState;
  onClose: () => void;
}

export const BulkTaskModal: React.FC<BulkTaskModalProps> = ({ store, state, onClose }) => {
  const t = translations[state.language];

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(state.clients.map((c) => c.id));
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([state.users[2]?.id || 'usr-3']);
  const [priority, setPriority] = useState<Priority>('Normal');
  const [briefDate, setBriefDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(todayStr);
  const [notes, setNotes] = useState('');

  const toggleClient = (id: string) => {
    if (selectedClientIds.includes(id)) {
      setSelectedClientIds(selectedClientIds.filter((c) => c !== id));
    } else {
      setSelectedClientIds([...selectedClientIds, id]);
    }
  };

  const toggleEmployee = (id: string) => {
    if (selectedEmployeeIds.includes(id)) {
      setSelectedEmployeeIds(selectedEmployeeIds.filter((e) => e !== id));
    } else {
      setSelectedEmployeeIds([...selectedEmployeeIds, id]);
    }
  };

  const totalGeneratedCount = selectedClientIds.length * selectedEmployeeIds.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedClientIds.length === 0 || selectedEmployeeIds.length === 0) return;

    store.addBulkTasks({
      title,
      clientIds: selectedClientIds,
      employeeIds: selectedEmployeeIds,
      priority,
      briefDate,
      dueDate,
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Zap className="w-5 h-5 fill-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t.bulkTask}</h3>
              <p className="text-xs text-slate-500">
                Assign 1 brief across multiple clients or team members simultaneously.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Brief Title / Template</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Campaign Visual Brief"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Client Multi-Select Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-600" />
                <span>Select Target Clients ({selectedClientIds.length} selected)</span>
              </label>
              <button
                type="button"
                onClick={() => setSelectedClientIds(selectedClientIds.length === state.clients.length ? [] : state.clients.map((c) => c.id))}
                className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                {selectedClientIds.length === state.clients.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
              {state.clients.map((c) => {
                const isSelected = selectedClientIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleClient(c.id)}
                    className={`p-2 rounded-lg text-left flex items-center gap-2 border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold shadow-2xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-sky-600 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span className="truncate text-[11px]">{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Employee Multi-Select Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Team Assignees ({selectedEmployeeIds.length} selected)</span>
              </label>
              <button
                type="button"
                onClick={() => setSelectedEmployeeIds(selectedEmployeeIds.length === state.users.length ? [] : state.users.map((u) => u.id))}
                className="text-[11px] text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                {selectedEmployeeIds.length === state.users.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 max-h-36 overflow-y-auto">
              {state.users.map((u) => {
                const isSelected = selectedEmployeeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleEmployee(u.id)}
                    className={`p-2 rounded-lg text-left flex items-center gap-2 border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold shadow-2xs' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-600 shrink-0" /> : <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span className="truncate text-[11px]">{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-slate-700 font-semibold mb-1">{t.colDueDate}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">{t.colNotes}</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bulk instructions..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl">
              Will generate {totalGeneratedCount} task instance(s)
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={totalGeneratedCount === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 disabled:opacity-50 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Create {totalGeneratedCount} Tasks</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
