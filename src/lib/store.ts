'use client';

import { 
  User, 
  Client, 
  Task, 
  RecurrenceRule, 
  AuditLog, 
  Notification, 
  TaskStatus, 
  Priority, 
  UserRole,
  TaskComment,
  EmailLog,
  EmailConfig,
  EmailNotificationType,
  RetainerType,
  ClientTier
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_CLIENTS, 
  INITIAL_TASKS, 
  INITIAL_RECURRENCE_RULES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS,
  INITIAL_EMAIL_CONFIG,
  INITIAL_EMAIL_LOGS
} from './mockData';
import { 
  sendTaskAssignedNotification, 
  sendDueTodayNotification, 
  sendOverdueDailyNotification, 
  sendTaskCompletedNotification,
  sendTestNotification
} from './emailService';
import { runDailyDeadlineScan, DailyScanResult } from './emailDailyScanner';

const LOCAL_STORAGE_KEY = 'rak_traffic_state_v2';

export interface AppState {
  users: User[];
  clients: Client[];
  tasks: Task[];
  recurrenceRules: RecurrenceRule[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  emailLogs: EmailLog[];
  emailConfig: EmailConfig;
  comments: Record<string, TaskComment[]>; // taskId -> TaskComment[]
  currentUserId: string;
  currentRole: UserRole;
  language: 'en' | 'ar';
}

const getInitialState = (): AppState => ({
  users: INITIAL_USERS,
  clients: INITIAL_CLIENTS,
  tasks: INITIAL_TASKS,
  recurrenceRules: INITIAL_RECURRENCE_RULES,
  auditLogs: INITIAL_AUDIT_LOGS,
  notifications: INITIAL_NOTIFICATIONS,
  emailLogs: INITIAL_EMAIL_LOGS,
  emailConfig: INITIAL_EMAIL_CONFIG,
  comments: {
    'tsk-ehab-1': [
      {
        id: 'cmt-1',
        taskId: 'tsk-ehab-1',
        userId: 'usr-johnny',
        userName: 'Johnny Al Sandroussy',
        userAvatar: INITIAL_USERS[2]?.avatar || '',
        message: 'Please focus on the comparison between Dubai and Abu Dhabi store conversions.',
        createdAt: '2026-08-14T09:30:00Z'
      }
    ]
  },
  currentUserId: 'usr-farah',
  currentRole: 'admin',
  language: 'en'
});

export class TrafficStore {
  private state: AppState;
  private listeners: Set<() => void> = new Set();
  private onTaskCompletedCallback?: (task: Task) => void;

  constructor() {
    this.state = getInitialState();
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // API credentials must never survive in browser storage. Older
          // versions saved this field locally, so strip it during migration.
          // Migrate any legacy 'Delayed' status tasks to 'In progress'
          if (Array.isArray(parsed.tasks)) {
            parsed.tasks = parsed.tasks.map((t: Task) =>
              (t.status as string) === 'Delayed' ? { ...t, status: 'In progress' as TaskStatus } : t
            );
          }

          // Sync official colleague emails and new users
          let mergedUsers = INITIAL_USERS;
          if (Array.isArray(parsed.users)) {
            mergedUsers = INITIAL_USERS.map((initUser) => {
              const savedUser = parsed.users.find((u: User) => u.id === initUser.id);
              return savedUser ? { 
                ...initUser, 
                ...savedUser,
                email: savedUser.email || initUser.email,
                avatar: savedUser.avatar || initUser.avatar,
                name: savedUser.name || initUser.name
              } : initUser;
            });
            // Also keep any custom created users
            parsed.users.forEach((u: User) => {
              if (!mergedUsers.some((m) => m.id === u.id)) {
                mergedUsers.push(u);
              }
            });
          }

          this.state = {
            ...this.state,
            ...parsed,
            users: mergedUsers,
            emailLogs: parsed.emailLogs || INITIAL_EMAIL_LOGS,
            emailConfig: { ...INITIAL_EMAIL_CONFIG, ...(parsed.emailConfig || {}) }
          };
        }
      } catch (e) {
        console.error(e);
      }
      this.evaluateAutomaticDelaysAndRecurrence();
    }
  }

  public onTaskCompleted(cb: (task: Task) => void) {
    this.onTaskCompletedCallback = cb;
  }

  public getState(): AppState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.state));
    }
    this.listeners.forEach((l) => l());
  }

  // Auto Delay Scanner & Recurrence Engine
  public evaluateAutomaticDelaysAndRecurrence() {
    const todayStr = new Date().toISOString().split('T')[0];
    let stateChanged = false;

    // 1. Scan for Overdue Tasks and generate automatic reminder notifications
    this.state.tasks.forEach((task) => {
      if (task.status !== 'Completed' && task.dueDate < todayStr) {
        const alreadyNotified = this.state.notifications.some(
          (n) => n.taskId === task.id && n.type === 'overdue' && n.createdAt.startsWith(todayStr)
        );

        if (!alreadyNotified) {
          stateChanged = true;
          const newNotif: Notification = {
            id: `not-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            userId: task.assignedToId,
            taskId: task.id,
            type: 'overdue',
            message: `Task "${task.title}" is overdue (due: ${task.dueDate}). Please update status or complete.`,
            read: false,
            createdAt: new Date().toISOString()
          };
          this.state.notifications.unshift(newNotif);
        }
      }
    });

    // 2. Scan Recurrence Rules
    this.state.recurrenceRules.forEach((rule) => {
      if (rule.active && rule.nextRunDate <= todayStr) {
        stateChanged = true;
        // Generate Task Instance
        const newTask: Task = {
          id: `tsk-rec-${Date.now()}`,
          title: `${rule.titleTemplate} (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
          clientId: rule.clientId,
          assignedToId: rule.assignedToId,
          assignedById: this.state.currentUserId,
          priority: rule.priority,
          status: 'Not started',
          briefDate: todayStr,
          dueDate: this.calculateNextDueDate(todayStr, rule.recurrenceType, rule.interval),
          notes: rule.notes,
          isRecurring: true,
          recurrenceRuleId: rule.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.state.tasks.unshift(newTask);

        // Calculate next run date for the rule
        rule.nextRunDate = this.calculateNextDueDate(rule.nextRunDate, rule.recurrenceType, rule.interval);

        // Audit Log
        this.state.auditLogs.unshift({
          id: `aud-${Date.now()}`,
          taskId: newTask.id,
          taskTitle: newTask.title,
          changedById: 'SYSTEM',
          changedByName: 'Recurrence Engine',
          field: 'recurrence',
          oldValue: 'Template',
          newValue: 'Generated Task',
          timestamp: new Date().toISOString(),
          actionSummary: `Auto-generated recurring task from rule "${rule.titleTemplate}"`
        });
      }
    });

    if (stateChanged) {
      this.notify();
    }
  }

  private calculateNextDueDate(baseDateStr: string, type: string, interval: number): string {
    const d = new Date(baseDateStr);
    if (type === 'weekly') {
      d.setDate(d.getDate() + 7 * interval);
    } else if (type === 'monthly') {
      d.setMonth(d.getMonth() + interval);
    } else {
      d.setDate(d.getDate() + 7);
    }
    return d.toISOString().split('T')[0];
  }

  // --- ACTIONS ---

  public setLanguage(lang: 'en' | 'ar') {
    this.state.language = lang;
    this.notify();
  }

  public setCurrentUser(userId: string) {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      this.state.currentUserId = user.id;
      this.state.currentRole = user.role;
      this.notify();
    }
  }

  public setCurrentRole(role: UserRole) {
    this.state.currentRole = role;
    this.notify();
  }

  public updateUser(userId: string, updates: Partial<User>) {
    const userIndex = this.state.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return;

    this.state.users[userIndex] = {
      ...this.state.users[userIndex],
      ...updates
    };

    // Update avatar/name of comments if the user's details changed
    if (updates.avatar) {
      Object.keys(this.state.comments).forEach((taskId) => {
        this.state.comments[taskId] = this.state.comments[taskId].map((comment) => {
          if (comment.userId === userId) {
            return { ...comment, userAvatar: updates.avatar! };
          }
          return comment;
        });
      });
    }

    if (updates.name) {
      Object.keys(this.state.comments).forEach((taskId) => {
        this.state.comments[taskId] = this.state.comments[taskId].map((comment) => {
          if (comment.userId === userId) {
            return { ...comment, userName: updates.name! };
          }
          return comment;
        });
      });
    }

    this.notify();
  }

  // Task CRUD
  public addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      status: taskData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.tasks.unshift(newTask);

    const currentUser = this.state.users.find((u) => u.id === this.state.currentUserId);

    // Audit Log
    this.state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      taskId: newTask.id,
      taskTitle: newTask.title,
      changedById: currentUser?.id || 'usr-1',
      changedByName: currentUser?.name || 'System Manager',
      field: 'task_created',
      oldValue: 'None',
      newValue: newTask.status,
      timestamp: new Date().toISOString(),
      actionSummary: `Created task "${newTask.title}" assigned to ${this.getUserName(newTask.assignedToId)}`
    });

    // Notification
    this.state.notifications.unshift({
      id: `not-${Date.now()}`,
      userId: newTask.assignedToId,
      taskId: newTask.id,
      type: 'assigned',
      message: `${currentUser?.name || 'Manager'} assigned you a new task: "${newTask.title}"`,
      read: false,
      createdAt: new Date().toISOString()
    });

    // Dispatch assignment email notification to assignee
    if (this.state.emailConfig.enableAssignmentEmails) {
      const assignee = this.state.users.find((u) => u.id === newTask.assignedToId);
      const client = this.state.clients.find((c) => c.id === newTask.clientId);
      if (assignee && assignee.email) {
        sendTaskAssignedNotification(
          { task: newTask, assignee, assigner: currentUser || null, client: client || null },
          this.state.emailConfig
        ).then((res) => {
          this.state.emailLogs.unshift(res.log);
          this.notify();
        }).catch((err) => console.error('Task assignment email error:', err));
      }
    }

    this.notify();
    return newTask;
  }

  // Bulk Task Assignment
  public addBulkTasks(params: {
    title: string;
    clientIds: string[];
    employeeIds: string[];
    priority: Priority;
    briefDate: string;
    dueDate: string;
    notes: string;
  }) {
    const currentUser = this.state.users.find((u) => u.id === this.state.currentUserId);
    const createdTasks: Task[] = [];

    params.clientIds.forEach((cliId) => {
      params.employeeIds.forEach((empId) => {
        const client = this.state.clients.find((c) => c.id === cliId);
        const newTask: Task = {
          id: `tsk-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          title: `${params.title}${client ? ` - ${client.name}` : ''}`,
          clientId: cliId,
          assignedToId: empId,
          assignedById: currentUser?.id || 'usr-1',
          priority: params.priority,
          status: 'Not started',
          briefDate: params.briefDate,
          dueDate: params.dueDate,
          notes: params.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        this.state.tasks.unshift(newTask);
        createdTasks.push(newTask);

        // Notification
        this.state.notifications.unshift({
          id: `not-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          userId: empId,
          taskId: newTask.id,
          type: 'assigned',
          message: `Bulk assignment: "${newTask.title}"`,
          read: false,
          createdAt: new Date().toISOString()
        });

        // Email Notification
        if (this.state.emailConfig.enableAssignmentEmails) {
          const assignee = this.state.users.find((u) => u.id === empId);
          if (assignee && assignee.email) {
            sendTaskAssignedNotification(
              { task: newTask, assignee, assigner: currentUser || null, client: client || null },
              this.state.emailConfig
            ).then((res) => {
              this.state.emailLogs.unshift(res.log);
              this.notify();
            }).catch((err) => console.error('Bulk assignment email error:', err));
          }
        }
      });
    });

    // Audit summary log
    this.state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      taskId: createdTasks[0]?.id || 'bulk',
      taskTitle: `Bulk Assignment (${createdTasks.length} tasks)`,
      changedById: currentUser?.id || 'usr-1',
      changedByName: currentUser?.name || 'Manager',
      field: 'bulk_create',
      oldValue: '0',
      newValue: `${createdTasks.length} tasks`,
      timestamp: new Date().toISOString(),
      actionSummary: `Created ${createdTasks.length} bulk tasks across clients & team members`
    });

    this.notify();
  }

  public updateTask(id: string, updates: Partial<Task>) {
    const taskIndex = this.state.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    const oldTask = this.state.tasks[taskIndex];
    const currentUser = this.state.users.find((u) => u.id === this.state.currentUserId);
    const todayStr = new Date().toISOString().split('T')[0];

    // Compute updated task state
    const finalStatus = updates.status !== undefined ? updates.status : oldTask.status;

    const updatedTask: Task = {
      ...oldTask,
      ...updates,
      status: finalStatus,
      completedDate: finalStatus === 'Completed' ? (oldTask.completedDate || todayStr) : oldTask.completedDate,
      updatedAt: new Date().toISOString()
    };

    this.state.tasks[taskIndex] = updatedTask;

    // Track Audit Log changes
    if (updates.status && updates.status !== oldTask.status) {
      this.state.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        changedById: currentUser?.id || 'usr-1',
        changedByName: currentUser?.name || 'User',
        field: 'status',
        oldValue: oldTask.status,
        newValue: updatedTask.status,
        timestamp: new Date().toISOString(),
        actionSummary: `Updated status from "${oldTask.status}" to "${updatedTask.status}"`
      });

      // Notify manager if employee completed task
      if (updatedTask.status === 'Completed' && oldTask.assignedById !== currentUser?.id) {
        this.state.notifications.unshift({
          id: `not-${Date.now()}`,
          userId: oldTask.assignedById,
          taskId: updatedTask.id,
          type: 'status_changed',
          message: `${currentUser?.name || 'Employee'} completed task: "${updatedTask.title}"`,
          read: false,
          createdAt: new Date().toISOString()
        });

        // Email manager upon task completion
        const manager = this.state.users.find((u) => u.id === oldTask.assignedById);
        const assignee = this.state.users.find((u) => u.id === updatedTask.assignedToId);
        const client = this.state.clients.find((c) => c.id === updatedTask.clientId);
        if (manager && assignee) {
          sendTaskCompletedNotification(
            { task: updatedTask, assignee, assigner: manager, client: client || null },
            this.state.emailConfig
          ).then((res) => {
            this.state.emailLogs.unshift(res.log);
            this.notify();
          }).catch((err) => console.error('Task completed email error:', err));
        }
      }

      // Trigger High Five Celebration Event
      if (updatedTask.status === 'Completed' && oldTask.status !== 'Completed') {
        if (this.onTaskCompletedCallback) {
          this.onTaskCompletedCallback(updatedTask);
        }
      }
    }

    if (updates.assignedToId && updates.assignedToId !== oldTask.assignedToId) {
      this.state.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        changedById: currentUser?.id || 'usr-1',
        changedByName: currentUser?.name || 'Manager',
        field: 'assignedToId',
        oldValue: this.getUserName(oldTask.assignedToId),
        newValue: this.getUserName(updates.assignedToId),
        timestamp: new Date().toISOString(),
        actionSummary: `Reassigned task to ${this.getUserName(updates.assignedToId)}`
      });

      this.state.notifications.unshift({
        id: `not-${Date.now()}`,
        userId: updates.assignedToId,
        taskId: updatedTask.id,
        type: 'reassigned',
        message: `Task "${updatedTask.title}" was reassigned to you`,
        read: false,
        createdAt: new Date().toISOString()
      });

      // Dispatch reassignment email to new assignee
      if (this.state.emailConfig.enableAssignmentEmails) {
        const newAssignee = this.state.users.find((u) => u.id === updates.assignedToId);
        const client = this.state.clients.find((c) => c.id === updatedTask.clientId);
        if (newAssignee && newAssignee.email) {
          sendTaskAssignedNotification(
            { task: updatedTask, assignee: newAssignee, assigner: currentUser || null, client: client || null },
            this.state.emailConfig
          ).then((res) => {
            this.state.emailLogs.unshift(res.log);
            this.notify();
          }).catch((err) => console.error('Reassignment email error:', err));
        }
      }
    }

    this.notify();
  }

  public deleteTask(id: string) {
    const task = this.state.tasks.find((t) => t.id === id);
    this.state.tasks = this.state.tasks.filter((t) => t.id !== id);
    if (task) {
      const currentUser = this.state.users.find((u) => u.id === this.state.currentUserId);
      this.state.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        taskId: id,
        taskTitle: task.title,
        changedById: currentUser?.id || 'usr-1',
        changedByName: currentUser?.name || 'Manager',
        field: 'task_deleted',
        oldValue: task.title,
        newValue: 'Deleted',
        timestamp: new Date().toISOString(),
        actionSummary: `Deleted task "${task.title}"`
      });
    }
    this.notify();
  }

  // Comments
  public addComment(taskId: string, message: string) {
    const currentUser = this.state.users.find((u) => u.id === this.state.currentUserId);
    if (!currentUser || !message.trim()) return;

    const newComment: TaskComment = {
      id: `cmt-${Date.now()}`,
      taskId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message,
      createdAt: new Date().toISOString()
    };

    if (!this.state.comments[taskId]) {
      this.state.comments[taskId] = [];
    }
    this.state.comments[taskId].push(newComment);
    this.notify();
  }

  // Recurrence Rules CRUD
  public addRecurrenceRule(rule: Omit<RecurrenceRule, 'id' | 'createdAt'>) {
    const newRule: RecurrenceRule = {
      ...rule,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.state.recurrenceRules.unshift(newRule);
    this.evaluateAutomaticDelaysAndRecurrence();
    this.notify();
  }

  public toggleRecurrenceRule(id: string) {
    const rule = this.state.recurrenceRules.find((r) => r.id === id);
    if (rule) {
      rule.active = !rule.active;
      this.notify();
    }
  }

  public deleteRecurrenceRule(id: string) {
    this.state.recurrenceRules = this.state.recurrenceRules.filter((r) => r.id !== id);
    this.notify();
  }

  // Client WIP CRUD
  public addClient(client: Omit<Client, 'id'>) {
    const newClient: Client = {
      ...client,
      id: `cli-${Date.now()}`
    };
    this.state.clients.unshift(newClient);
    this.notify();
  }

  public updateClient(id: string, updates: Partial<Client>) {
    const client = this.state.clients.find((c) => c.id === id);
    if (client) {
      Object.assign(client, updates);
      this.notify();
    }
  }

  // Notifications
  public markNotificationAsRead(id: string) {
    const n = this.state.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.notify();
    }
  }

  public markAllNotificationsAsRead() {
    this.state.notifications.forEach((n) => (n.read = true));
    this.notify();
  }

  // Import Excel/CSV Traffic & WIP Sheet Data
  public importTrafficSheetRows(rows: Array<{
    manager?: string;
    assignee?: string;
    client?: string;
    brief?: string;
    status?: string;
    priority?: string;
    briefDate?: string;
    dueDate?: string;
    notes?: string;
  }>) {
    let count = 0;
    const currentUser = this.state.users.find((u) => u.id === this.state.currentUserId);
    const todayStr = new Date().toISOString().split('T')[0];

    rows.forEach((row) => {
      if (!row.brief || !row.client) return;

      // Find or create Client
      let client = this.state.clients.find(
        (c) => c.name.toLowerCase().trim() === row.client?.toLowerCase().trim()
      );
      if (!client) {
        client = {
          id: `cli-imp-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
          name: row.client.trim(),
          retainerType: 'SM & DIGITAL',
          tier: 'REGULAR',
          accountOwnerIds: [this.state.currentUserId],
          active: true
        };
        this.state.clients.unshift(client);
      }

      // Find or match Assignee
      let assignee = this.state.users.find(
        (u) => u.name.toLowerCase().trim() === row.assignee?.toLowerCase().trim()
      );
      if (!assignee) {
        assignee = this.state.users.find((u) => u.role === 'employee') || this.state.users[2];
      }

      // Match status & priority
      let status: TaskStatus = 'Not started';
      const rowStat = row.status?.toLowerCase().trim() || '';
      if (rowStat.includes('completed') || rowStat.includes('done')) status = 'Completed';
      else if (rowStat.includes('progress')) status = 'In progress';
      else if (rowStat.includes('brief')) status = 'Briefed';

      let priority: Priority = 'Normal';
      const rowPrio = row.priority?.toLowerCase().trim() || '';
      if (rowPrio.includes('urgent')) priority = 'Urgent';
      else if (rowPrio.includes('high')) priority = 'High';

      const briefDate = row.briefDate || todayStr;
      const dueDate = row.dueDate || todayStr;
      const isOverdue = dueDate < todayStr && status !== 'Completed';

      const newTask: Task = {
        id: `tsk-imp-${Date.now()}-${count}`,
        title: row.brief,
        clientId: client.id,
        assignedToId: assignee.id,
        assignedById: currentUser?.id || 'usr-1',
        priority,
        status,
        briefDate,
        dueDate,
        completedDate: status === 'Completed' ? dueDate : null,
        notes: row.notes || 'Imported from legacy traffic sheet.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.state.tasks.unshift(newTask);
      count++;
    });

    this.state.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      taskId: 'import',
      taskTitle: `Excel Traffic Import (${count} rows)`,
      changedById: currentUser?.id || 'usr-1',
      changedByName: currentUser?.name || 'Manager',
      field: 'excel_import',
      oldValue: '0',
      newValue: `${count} imported`,
      timestamp: new Date().toISOString(),
      actionSummary: `Successfully imported ${count} task rows from legacy Excel traffic sheet`
    });

    this.notify();
    return count;
  }

  public importWipSheetRows(rows: Array<{
    clientName?: string;
    retainerType?: string;
    tier?: string;
    accountOwner?: string;
  }>) {
    let count = 0;
    rows.forEach((row) => {
      if (!row.clientName) return;
      const existingIndex = this.state.clients.findIndex(
        (c) => c.name.toLowerCase().trim() === row.clientName?.toLowerCase().trim()
      );

      // Match owner
      const owner = this.state.users.find(
        (u) => u.name.toLowerCase().includes(row.accountOwner?.toLowerCase() || '')
      ) || this.state.users[1];

      const retainer: RetainerType = row.retainerType?.trim() || 'SM & DIGITAL';
      const importedTier = row.tier?.trim().toUpperCase();
      const tier: ClientTier = importedTier === 'LIGHT' || importedTier === 'BIG'
        ? importedTier
        : 'REGULAR';

      if (existingIndex !== -1) {
        this.state.clients[existingIndex].retainerType = retainer;
        this.state.clients[existingIndex].tier = tier;
        this.state.clients[existingIndex].accountOwnerIds = [owner.id];
      } else {
        this.state.clients.unshift({
          id: `cli-wip-${Date.now()}-${count}`,
          name: row.clientName.trim(),
          retainerType: retainer,
          tier: tier,
          accountOwnerIds: [owner.id],
          active: true
        });
      }
      count++;
    });

    this.notify();
    return count;
  }

  // --- EMAIL NOTIFICATION ACTIONS ---

  /**
   * Run Daily Email Scan for Due Today & Overdue tasks (Enforces 1 email/day rule per task)
   */
  public async runDailyEmailScan(force: boolean = false): Promise<DailyScanResult> {
    const todayStr = new Date().toISOString().split('T')[0];
    const scanConfig = { ...this.state.emailConfig };

    const scanResult = await runDailyDeadlineScan({
      tasks: this.state.tasks,
      users: this.state.users,
      clients: this.state.clients,
      config: scanConfig
    });

    // Update tasks with new lastEmailSentDate & reminder counts
    scanResult.updatedTasks.forEach((update) => {
      const t = this.state.tasks.find((task) => task.id === update.taskId);
      if (t) {
        t.lastEmailSentDate = update.lastEmailSentDate;
        t.emailReminderCount = update.emailReminderCount;
      }
    });

    // Prepend new email logs
    if (scanResult.logs.length > 0) {
      this.state.emailLogs.unshift(...scanResult.logs);
    }

    this.state.emailConfig.lastDailyScanDate = todayStr;

    // Add Audit Log
    if (scanResult.totalDispatched > 0) {
      this.state.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        taskId: 'daily-email-scan',
        taskTitle: `Daily Deadline Email Dispatch (${scanResult.totalDispatched} emails)`,
        changedById: 'SYSTEM',
        changedByName: 'Daily Email Scheduler',
        field: 'daily_email_dispatch',
        oldValue: '0',
        newValue: `${scanResult.totalDispatched} dispatched`,
        timestamp: new Date().toISOString(),
        actionSummary: `Dispatched ${scanResult.totalDispatched} daily reminder emails (${scanResult.dueTodaySent} due today, ${scanResult.overdueSent} overdue, ${scanResult.skippedAlreadySentToday} skipped as already sent today)`
      });
    }

    this.notify();
    return scanResult;
  }

  /**
   * Manually dispatch a specific email for a task
   */
  public async sendCustomTaskEmail(taskId: string, type: EmailNotificationType) {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const assignee = this.state.users.find((u) => u.id === task.assignedToId);
    const assigner = this.state.users.find((u) => u.id === task.assignedById) || null;
    const client = this.state.clients.find((c) => c.id === task.clientId) || null;

    if (!assignee) throw new Error('Assignee not found');

    let result;
    const todayStr = new Date().toISOString().split('T')[0];

    if (type === 'assigned') {
      result = await sendTaskAssignedNotification(
        { task, assignee, assigner, client },
        this.state.emailConfig
      );
    } else if (type === 'due_today' || type === 'due_soon') {
      result = await sendDueTodayNotification(
        { task, assignee, assigner, client },
        this.state.emailConfig
      );
      task.lastEmailSentDate = todayStr;
      task.emailReminderCount = (task.emailReminderCount || 0) + 1;
    } else if (type === 'overdue') {
      const dueDateObj = new Date(task.dueDate);
      const diffTime = dueDateObj.getTime() - new Date(todayStr).getTime();
      const daysOverdue = Math.max(1, Math.abs(Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

      result = await sendOverdueDailyNotification(
        { task, assignee, assigner, client, daysOverdue },
        this.state.emailConfig
      );
      task.lastEmailSentDate = todayStr;
      task.emailReminderCount = (task.emailReminderCount || 0) + 1;
    } else if (type === 'completed') {
      if (!assigner) throw new Error('Task manager not found');
      result = await sendTaskCompletedNotification(
        { task, assignee, assigner, client },
        this.state.emailConfig
      );
    } else {
      result = await sendTaskAssignedNotification(
        { task, assignee, assigner, client },
        this.state.emailConfig
      );
    }

    this.state.emailLogs.unshift(result.log);
    this.notify();
    return result;
  }

  /**
   * Send test email to verify credentials
   */
  public async sendTestEmail(recipientEmail: string, recipientName: string = 'Team Member') {
    const result = await sendTestNotification(
      { recipientName, recipientEmail },
      this.state.emailConfig
    );
    this.state.emailLogs.unshift(result.log);
    this.notify();
    return result;
  }

  /**
   * Update Email Configuration (Provider, API Keys, Senders, Toggles)
   */
  public updateEmailConfig(updates: Partial<EmailConfig>) {
    const safeUpdates = { ...updates };
    delete safeUpdates.apiKey;
    this.state.emailConfig = {
      ...this.state.emailConfig,
      ...safeUpdates,
      apiKey: undefined
    };
    this.notify();
  }

  /**
   * Clear outbox logs
   */
  public clearEmailLogs() {
    this.state.emailLogs = [];
    this.notify();
  }

  // Utility helpers
  public getUserName(userId: string): string {
    return this.state.users.find((u) => u.id === userId)?.name || 'Unknown User';
  }

  public getClientName(clientId: string): string {
    return this.state.clients.find((c) => c.id === clientId)?.name || 'Unknown Client';
  }
}

// Global Singleton Instance
export const store = new TrafficStore();
