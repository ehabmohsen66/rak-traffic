'use client';

import { MainTab } from '@/components/Sidebar';

export interface UrlParamsState {
  tab: MainTab;
  user: string;
  view: 'kanban' | 'list' | 'calendar';
  task?: string | null;
  employee?: string | null;
  client?: string;
  assignee?: string;
  status?: string;
  priority?: string;
  search?: string;
}

export function readUrlParams(): Partial<UrlParamsState> {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const result: Partial<UrlParamsState> = {};

  const validTabs: MainTab[] = [
    'myTasks',
    'tasks',
    'workload',
    'clientWip',
    'recurrence',
    'employeeHistory',
    'excelMigration',
    'settings'
  ];

  const tabParam = params.get('tab') as MainTab | null;
  if (tabParam && validTabs.includes(tabParam)) {
    result.tab = tabParam;
  }

  const userParam = params.get('user');
  if (userParam) {
    result.user = userParam;
  }

  const viewParam = params.get('view') as 'kanban' | 'list' | 'calendar' | null;
  if (viewParam && ['kanban', 'list', 'calendar'].includes(viewParam)) {
    result.view = viewParam;
  }

  const taskParam = params.get('task');
  if (taskParam) {
    result.task = taskParam;
  }

  const employeeParam = params.get('employee');
  if (employeeParam) {
    result.employee = employeeParam;
  }

  const clientParam = params.get('client');
  if (clientParam) {
    result.client = clientParam;
  }

  const assigneeParam = params.get('assignee');
  if (assigneeParam) {
    result.assignee = assigneeParam;
  }

  const statusParam = params.get('status');
  if (statusParam) {
    result.status = statusParam;
  }

  const priorityParam = params.get('priority');
  if (priorityParam) {
    result.priority = priorityParam;
  }

  const searchParam = params.get('search');
  if (searchParam) {
    result.search = searchParam;
  }

  return result;
}

export function updateUrl(state: UrlParamsState, replace: boolean = false) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();

  // Tab (default is tasks)
  if (state.tab && state.tab !== 'tasks') {
    params.set('tab', state.tab);
  }

  // Active User
  if (state.user) {
    params.set('user', state.user);
  }

  // View mode (default is kanban)
  if (state.view && state.view !== 'kanban') {
    params.set('view', state.view);
  }

  // Task modal deep link
  if (state.task) {
    params.set('task', state.task);
  }

  // Employee history selection
  if (state.employee) {
    params.set('employee', state.employee);
  }

  // Filters
  if (state.client && state.client !== 'all') {
    params.set('client', state.client);
  }

  if (state.assignee && state.assignee !== 'all') {
    params.set('assignee', state.assignee);
  }

  if (state.status && state.status !== 'all') {
    params.set('status', state.status);
  }

  if (state.priority && state.priority !== 'all') {
    params.set('priority', state.priority);
  }

  if (state.search && state.search.trim()) {
    params.set('search', state.search.trim());
  }

  const newSearch = params.toString();
  const currentPath = window.location.pathname;
  const newUrl = newSearch ? `${currentPath}?${newSearch}` : currentPath;

  if (window.location.search !== (newSearch ? `?${newSearch}` : '')) {
    if (replace) {
      window.history.replaceState({}, '', newUrl);
    } else {
      window.history.pushState({}, '', newUrl);
    }
  }
}
