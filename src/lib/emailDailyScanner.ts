import { Task, User, Client, EmailConfig, EmailLog } from './types';
import { sendDueTodayNotification, sendOverdueDailyNotification } from './emailService';

export interface DailyScanResult {
  scanDate: string;
  totalActiveTasksScanned: number;
  dueTodaySent: number;
  overdueSent: number;
  skippedAlreadySentToday: number;
  totalDispatched: number;
  logs: EmailLog[];
  updatedTasks: { taskId: string; lastEmailSentDate: string; emailReminderCount: number }[];
}

/**
 * Daily Task Scanner & Deadline Email Dispatcher
 * Ensures active tasks at or past deadline receive exactly 1 email per day until completed.
 */
export async function runDailyDeadlineScan({
  tasks,
  users,
  clients,
  config,
  baseUrl,
}: {
  tasks: Task[];
  users: User[];
  clients: Client[];
  config: EmailConfig;
  baseUrl?: string;
}): Promise<DailyScanResult> {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDateObj = new Date(todayStr);

  const result: DailyScanResult = {
    scanDate: todayStr,
    totalActiveTasksScanned: 0,
    dueTodaySent: 0,
    overdueSent: 0,
    skippedAlreadySentToday: 0,
    totalDispatched: 0,
    logs: [],
    updatedTasks: []
  };

  // Only scan if daily reminders are enabled in config
  if (!config.enableDailyReminders) {
    return result;
  }

  for (const task of tasks) {
    // Only active (uncompleted) tasks require daily notifications
    if (task.status === 'Completed') {
      continue;
    }

    result.totalActiveTasksScanned++;

    const dueDateObj = new Date(task.dueDate);
    const diffTime = dueDateObj.getTime() - todayDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Find Assignee, Assigner & Client
    const assignee = users.find((u) => u.id === task.assignedToId);
    if (!assignee || !assignee.email) {
      continue;
    }

    const assigner = users.find((u) => u.id === task.assignedById) || null;
    const client = clients.find((c) => c.id === task.clientId) || null;

    // Check 1 email per day rate limit / idempotency
    const alreadySentToday = task.lastEmailSentDate === todayStr;

    if (diffDays === 0) {
      // 1. Task is DUE TODAY
      if (alreadySentToday) {
        result.skippedAlreadySentToday++;
        continue;
      }

      const dispatchResult = await sendDueTodayNotification(
        { task, assignee, assigner, client, baseUrl },
        config
      );

      result.logs.push(dispatchResult.log);
      result.dueTodaySent++;
      result.totalDispatched++;

      const newCount = (task.emailReminderCount || 0) + 1;
      result.updatedTasks.push({
        taskId: task.id,
        lastEmailSentDate: todayStr,
        emailReminderCount: newCount
      });
    } else if (diffDays < 0) {
      // 2. Task is OVERDUE (1 email per day until completed)
      const daysOverdue = Math.abs(diffDays);

      if (alreadySentToday) {
        result.skippedAlreadySentToday++;
        continue;
      }

      const dispatchResult = await sendOverdueDailyNotification(
        { task, assignee, assigner, client, baseUrl, daysOverdue },
        config
      );

      result.logs.push(dispatchResult.log);
      result.overdueSent++;
      result.totalDispatched++;

      const newCount = (task.emailReminderCount || 0) + 1;
      result.updatedTasks.push({
        taskId: task.id,
        lastEmailSentDate: todayStr,
        emailReminderCount: newCount
      });
    }
  }

  return result;
}
