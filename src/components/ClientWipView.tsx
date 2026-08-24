'use client';

import React, { useState } from 'react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { Client, RetainerType, ClientTier } from '@/lib/types';
import { Building2, Plus, Users, Tag, X } from 'lucide-react';

interface ClientWipViewProps {
  store: TrafficStore;
  state: AppState;
  onFilterByClient: (clientId: string) => void;
}

export const ClientWipView: React.FC<ClientWipViewProps> = ({
  store,
  state,
  onFilterByClient,
}) => {
  const t = translations[state.language];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newRetainer, setNewRetainer] = useState<RetainerType>('SM & DIGITAL');
  const [newTier, setNewTier] = useState<ClientTier>('REGULAR');
  const [newOwnerId, setNewOwnerId] = useState(state.users[1]?.id || 'usr-2');
  const [newNotes, setNewNotes] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    store.addClient({
      name: newClientName,
      retainerType: newRetainer,
      tier: newTier,
      accountOwnerIds: [newOwnerId],
      active: true,
      notes: newNotes
    });

    setNewClientName('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const getTierBadge = (tier: ClientTier) => {
    switch (tier) {
      case 'BIG':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-extrabold px-2.5 py-0.5 rounded-full">BIG ACCOUNT</span>;
      case 'REGULAR':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold px-2.5 py-0.5 rounded-full">REGULAR</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-0.5 rounded-full">LIGHT</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.clientWipSheet}</h2>
            <p className="text-xs text-slate-500">
              Replaces the manual WIP Excel sheet mapping client retainers, account owners, and tier packages.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addClient}</span>
        </button>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.clients.map((client) => {
          const todayStr = new Date().toISOString().split('T')[0];
          const clientTasks = state.tasks.filter((t) => t.clientId === client.id);
          const activeTasks = clientTasks.filter((t) => t.status !== 'Completed');
          const delayedTasks = clientTasks.filter((t) => t.status !== 'Completed' && t.dueDate < todayStr);
          const owners = state.users.filter((u) => client.accountOwnerIds.includes(u.id));

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl p-4 space-y-4 border border-slate-200 shadow-xs hover:shadow-card hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Name & Tier */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" 
                      onClick={() => onFilterByClient(client.id)}
                    >
                      {client.name}
                    </h3>
                    <span className="text-xs font-semibold text-sky-700 flex items-center gap-1 mt-0.5">
                      <Tag className="w-3 h-3" />
                      {client.retainerType}
                    </span>
                  </div>
                  {getTierBadge(client.tier)}
                </div>

                {/* Account Owners */}
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">{t.accountOwner}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {owners.map((owner) => (
                      <div key={owner.id} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 font-medium">
                        <img src={owner.avatar} alt={owner.name} className="w-4 h-4 rounded-full border border-slate-200" />
                        <span>{owner.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {client.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                    {client.notes}
                  </p>
                )}
              </div>

              {/* Stats Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">Total: <strong className="text-slate-800">{clientTasks.length}</strong></span>
                  <span className="text-slate-500">Active: <strong className="text-amber-600 font-bold">{activeTasks.length}</strong></span>
                  {delayedTasks.length > 0 && (
                    <span className="text-rose-600 font-bold">{delayedTasks.length} Delayed</span>
                  )}
                </div>

                <button
                  onClick={() => onFilterByClient(client.id)}
                  className="px-3 py-1 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  View Tasks
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">{t.addClient}</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Client Name</label>
                <input
                  type="text"
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Riyadh Retail Group"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.retainerType}</label>
                <select
                  value={newRetainer}
                  onChange={(e) => setNewRetainer(e.target.value as RetainerType)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="SM & DIGITAL">SM & DIGITAL</option>
                  <option value="SM & DIGITAL + BRANDING">SM & DIGITAL + BRANDING</option>
                  <option value="PERFORMANCE MARKETING">PERFORMANCE MARKETING</option>
                  <option value="BRANDING & STRATEGY">BRANDING & STRATEGY</option>
                  <option value="SEO & CONTENT">SEO & CONTENT</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.clientTier}</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as ClientTier)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="LIGHT">LIGHT</option>
                  <option value="REGULAR">REGULAR</option>
                  <option value="BIG">BIG ACCOUNT</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t.accountOwner}</label>
                <select
                  value={newOwnerId}
                  onChange={(e) => setNewOwnerId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {state.users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Key account details..."
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
