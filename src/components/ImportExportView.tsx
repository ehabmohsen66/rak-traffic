'use client';

import React, { useState } from 'react';
import { AppState, TrafficStore } from '@/lib/store';
import { translations } from '@/lib/i18n';
import { FileSpreadsheet, Upload, Download, CheckCircle2 } from 'lucide-react';

interface ImportExportViewProps {
  store: TrafficStore;
  state: AppState;
}

export const ImportExportView: React.FC<ImportExportViewProps> = ({ store, state }) => {
  const t = translations[state.language];

  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Parse CSV text into array of objects
  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      result.push(obj);
    }
    return result;
  };

  const handleTrafficFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);

      const mapped = parsed.map((row) => ({
        manager: row['Task Manager'] || row['Manager'] || '',
        assignee: row['Assignee'] || row['Task Assignee'] || '',
        client: row['Client'] || row['Client Name'] || '',
        brief: row['Task or Email Brief'] || row['Task'] || row['Brief'] || '',
        status: row['Status'] || '',
        priority: row['Priority'] || '',
        briefDate: row['Brief Date'] || '',
        dueDate: row['Due Date'] || '',
        notes: row['Notes'] || ''
      }));

      const count = store.importTrafficSheetRows(mapped);
      setImportStatus(`Successfully imported ${count} task rows from Traffic Sheet!`);
    };
    reader.readAsText(file);
  };

  const handleWipFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const parsed = parseCSV(content);

      const mapped = parsed.map((row) => ({
        clientName: row['Client Name'] || row['Client'] || '',
        retainerType: row['Retainer Type'] || row['Retainer'] || '',
        tier: row['Tier'] || row['Account Size'] || '',
        accountOwner: row['Account Owner'] || row['Owner'] || ''
      }));

      const count = store.importWipSheetRows(mapped);
      setImportStatus(`Successfully imported ${count} clients from WIP Sheet!`);
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleTraffic = () => {
    const sampleCsv = 
`Task Manager,Assignee,Client,Task or Email Brief,Status,Priority,Brief Date,Due Date,Notes
Sarah Jenkins,Ahmed Hassan,Al Marai GCC,Q3 Social Media Reels Grid,In progress,High,2026-08-01,2026-08-15,10 grid posts and 2 reels
Tariq Al-Mansoor,Layla Mahmoud,Riyadh Retail Group,Brand Story Copywriting,Briefed,Normal,2026-08-05,2026-08-20,Arabic & English brand story
Sarah Jenkins,Omar Zaki,RAK Real Estate,3D Exterior Elevation Render,Not started,Urgent,2026-08-10,2026-08-18,4K render for billboard
`;
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RAK_Traffic_Sheet_Sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleWip = () => {
    const sampleCsv = 
`Client Name,Retainer Type,Tier,Account Owner
Al Marai GCC,SM & DIGITAL,BIG,Sarah Jenkins
Riyadh Retail Group,SM & DIGITAL + BRANDING,BIG,Tariq Al-Mansoor
Cairo Digital Hub,PERFORMANCE MARKETING,REGULAR,Tariq Al-Mansoor
RAK Real Estate,BRANDING & STRATEGY,BIG,Sarah Jenkins
`;
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'RAK_WIP_Sheet_Sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllTasks = () => {
    let csv = `Task ID,Task Manager,Assignee,Client,Task or Email Brief,Status,Priority,Brief Date,Due Date,Completed Date,Notes\n`;
    state.tasks.forEach((t) => {
      csv += `"${t.id}","${store.getUserName(t.assignedById)}","${store.getUserName(t.assignedToId)}","${store.getClientName(t.clientId)}","${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${t.briefDate}","${t.dueDate}","${t.completedDate || ''}","${(t.notes || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RAK_Traffic_Tasks_Export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t.migrationTitle}</h2>
            <p className="text-xs text-slate-500">{t.migrationSub}</p>
          </div>
        </div>

        <button
          onClick={handleExportAllTasks}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-emerald-200 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export All Tasks to CSV</span>
        </button>
      </div>

      {importStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Sheet Upload Card */}
        <div className="bg-white rounded-2xl p-6 space-y-4 border border-slate-200 shadow-xs hover:shadow-card transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">{t.uploadTrafficSheet}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your legacy per-employee Traffic CSV sheet containing columns:
              <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded ml-1 font-mono">Task Manager</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Client</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Task Brief</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Status</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Priority</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Brief Date</code>, <code className="text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded font-mono">Due Date</code>.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-indigo-50/20">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">{t.dropFileHere}</span>
              <span className="text-[10px] text-slate-400 mt-1">Supports UTF-8 .csv files</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleTrafficFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleDownloadSampleTraffic}
              className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadSampleTraffic}</span>
            </button>
          </div>
        </div>

        {/* Client WIP Sheet Upload Card */}
        <div className="bg-white rounded-2xl p-6 space-y-4 border border-slate-200 shadow-xs hover:shadow-card transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-sky-600" />
              <h3 className="text-base font-bold text-slate-900">{t.uploadWipSheet}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload your Client WIP Excel or CSV sheet mapping clients to retainers and account owners.
              Columns: <code className="text-sky-600 bg-sky-50 px-1 py-0.5 rounded ml-1 font-mono">Client Name</code>, <code className="text-sky-600 bg-sky-50 px-1 py-0.5 rounded font-mono">Retainer Type</code>, <code className="text-sky-600 bg-sky-50 px-1 py-0.5 rounded font-mono">Tier</code>, <code className="text-sky-600 bg-sky-50 px-1 py-0.5 rounded font-mono">Account Owner</code>.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-sky-50/20">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-800">{t.dropFileHere}</span>
              <span className="text-[10px] text-slate-400 mt-1">Supports UTF-8 .csv files</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleWipFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handleDownloadSampleWip}
              className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.downloadSampleWip}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
