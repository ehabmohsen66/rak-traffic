import { Task, User, Client, Priority, TaskStatus } from './types';

export interface EmailTemplateParams {
  task: Task;
  assignee: User;
  assigner?: User | null;
  client?: Client | null;
  baseUrl?: string;
  daysOverdue?: number;
  customMessage?: string;
}

const DEFAULT_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

function getPriorityColors(priority: Priority) {
  switch (priority) {
    case 'Urgent':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', label: '🔥 URGENT' };
    case 'High':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: '⚡ HIGH PRIORITY' };
    default:
      return { bg: '#eef2ff', text: '#4338ca', border: '#e0e7ff', label: 'NORMAL' };
  }
}

function getStatusColors(status: TaskStatus) {
  switch (status) {
    case 'Completed':
      return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    case 'Delayed':
      return { bg: '#fff1f2', text: '#be123c', border: '#fecdd3' };
    case 'In progress':
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    case 'Briefed':
      return { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' };
    default:
      return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Common HTML wrapper layout for RAK 4 CREATIVE emails
 */
function wrapEmailLayout({
  preheader,
  headerBanner,
  contentHtml,
  taskUrl,
  ctaText = 'Open Task in Traffic Hub',
  footerNote
}: {
  preheader: string;
  headerBanner?: string;
  contentHtml: string;
  taskUrl?: string;
  ctaText?: string;
  footerNote?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>RAK 4 CREATIVE - Traffic Hub Notification</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1e293b;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      display: block;
    }
    @media only screen and (max-width: 600px) {
      .container-table { width: 100% !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
      .mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-hide { display: none !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9;">
  <!-- Hidden Preheader -->
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9; width:100%; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <!-- Email Container -->
        <table role="presentation" class="container-table" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Top Lebanese Creative Accent Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #dc2626 0%, #4f46e5 50%, #059669 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 24px 28px; background-color: #0f172a;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <div style="display:flex; align-items:baseline;">
                      <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">R</span><span style="font-size: 24px; font-weight: 900; color: #6366f1;">A</span><span style="font-size: 24px; font-weight: 900; color: #ffffff;">K</span>
                      <span style="font-size: 13px; font-weight: 800; color: #818cf8; margin-left: 6px; text-transform: uppercase; letter-spacing: 2px;">4 CREATIVE</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #94a3b8; margin-top: 3px; letter-spacing: 0.5px;">
                      Traffic & Workflow Hub • Beirut HQ 🇱🇧
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.35); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.5px;">
                      Agency Dispatch
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Banner / Alert Header (Optional) -->
          ${headerBanner || ''}

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 32px 28px;" class="mobile-padding">
              ${contentHtml}

              <!-- Primary CTA Button -->
              ${
                taskUrl
                  ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);">
                          <a href="${taskUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px; letter-spacing: 0.2px;">
                            ${escapeHtml(ctaText)} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 11px; color: #94a3b8;">Click button to jump directly to this task in the workspace.</span>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 28px; border-top: 1px solid #e2e8f0; text-align: center;" class="mobile-padding">
              <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #475569;">
                RAK 4 CREATIVE • Beirut & Gulf Operations
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Antelias Creative Center, Beirut, Lebanon • RAK Traffic System<br>
                ${footerNote || 'This is an automated operational notification dispatched by the RAK Traffic Hub.'}
              </p>
              <div style="font-size: 10px; color: #cbd5e1;">
                &copy; ${new Date().getFullYear()} RAK 4 CREATIVE. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. TASK ASSIGNED EMAIL TEMPLATE
 * Sent immediately when a task is assigned to a team member
 */
export function generateTaskAssignedEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;
  const priorityStyle = getPriorityColors(task.priority);
  const statusStyle = getStatusColors(task.status);

  // Compute days until deadline
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dueDateObj = new Date(task.dueDate);
  const diffTime = dueDateObj.getTime() - new Date(todayStr).getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  let deadlinePill = '';
  if (diffDays < 0) {
    deadlinePill = `<span style="background-color:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:6px; font-weight:700; font-size:11px;">⚠️ OVERDUE by ${Math.abs(diffDays)} day(s)</span>`;
  } else if (diffDays === 0) {
    deadlinePill = `<span style="background-color:#fef3c7; color:#92400e; padding:4px 8px; border-radius:6px; font-weight:700; font-size:11px;">⏰ DUE TODAY</span>`;
  } else if (diffDays === 1) {
    deadlinePill = `<span style="background-color:#fef3c7; color:#92400e; padding:4px 8px; border-radius:6px; font-weight:700; font-size:11px;">⏳ Due Tomorrow (1 day)</span>`;
  } else {
    deadlinePill = `<span style="background-color:#e0e7ff; color:#3730a3; padding:4px 8px; border-radius:6px; font-weight:700; font-size:11px;">📅 ${diffDays} days remaining</span>`;
  }

  const subject = `[RAK Traffic] New Task Assigned: ${task.title} - ${client?.name || 'Client Task'}`;
  const preheader = `You have been assigned to "${task.title}" for ${client?.name || 'Client'}. Due date: ${formatDate(task.dueDate)}.`;

  const headerBanner = `
    <tr>
      <td style="background: linear-gradient(135deg, #4338ca 0%, #312e81 100%); padding: 18px 28px; color: #ffffff;" class="mobile-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #a5b4fc;">
                🚀 NEW TASK ASSIGNMENT
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">
                You have a new task assigned to your workbench
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const contentHtml = `
    <!-- Greeting -->
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${escapeHtml(assignee.name)}</strong>,<br>
      <strong>${escapeHtml(assigner?.name || 'The Creative Management Team')}</strong> has assigned you a new task. Please review the brief details below and track your delivery timeline.
    </div>

    <!-- Task Card Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          
          <!-- Badges Row -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td>
                <span style="display:inline-block; background-color:${priorityStyle.bg}; color:${priorityStyle.text}; border:1px solid ${priorityStyle.border}; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase; margin-right:6px;">
                  ${priorityStyle.label}
                </span>
                <span style="display:inline-block; background-color:${statusStyle.bg}; color:${statusStyle.text}; border:1px solid ${statusStyle.border}; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:700;">
                  Status: ${escapeHtml(task.status)}
                </span>
              </td>
              <td align="right">
                ${deadlinePill}
              </td>
            </tr>
          </table>

          <!-- Task Title -->
          <div style="font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.3; margin-bottom: 12px;">
            ${escapeHtml(task.title)}
          </div>

          <!-- Metadata Grid -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 14px;">
            <tr>
              <td width="50%" valign="top" style="padding-bottom: 10px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">Client / Account</div>
                <div style="font-size: 13px; font-weight: 700; color: #1e293b;">
                  🏢 ${escapeHtml(client?.name || 'General Client')}
                </div>
                ${client?.retainerType ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${escapeHtml(client.retainerType)}</div>` : ''}
              </td>
              <td width="50%" valign="top" style="padding-bottom: 10px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">Assigned By</div>
                <div style="font-size: 13px; font-weight: 700; color: #1e293b;">
                  👤 ${escapeHtml(assigner?.name || 'Traffic Manager')}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${escapeHtml(assigner?.department || 'Management')}</div>
              </td>
            </tr>
            <tr>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 2px;">Brief Date</div>
                <div style="font-size: 13px; font-weight: 600; color: #334155;">
                  📅 ${formatDate(task.briefDate)}
                </div>
              </td>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #dc2626; margin-bottom: 2px;">Due Date (Deadline)</div>
                <div style="font-size: 14px; font-weight: 800; color: #b91c1c;">
                  🎯 ${formatDate(task.dueDate)}
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

    <!-- Task Brief / Scope Notes -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 6px;">
        📝 Task Brief & Delivery Scope:
      </div>
      <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 14px 16px; font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-wrap;">
${escapeHtml(task.notes || 'No specific notes provided. Please check in with your manager for extra details.')}
      </div>
    </div>

    <!-- Quick Help Note -->
    <div style="font-size: 12px; color: #64748b; background-color: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center;">
      💡 When you finish the deliverables, remember to mark the task as <strong>Completed</strong> in the Traffic Hub so your manager is immediately updated!
    </div>
  `;

  const text = `
RAK 4 CREATIVE - TASK ASSIGNMENT NOTIFICATION
============================================

Hello ${assignee.name},

You have been assigned a new task:
Title: ${task.title}
Client: ${client?.name || 'General Client'} (${client?.retainerType || 'Retainer'})
Assigned By: ${assigner?.name || 'Management'}
Priority: ${task.priority}
Status: ${task.status}

TIMELINE:
- Brief Date: ${task.briefDate}
- Due Date: ${task.dueDate}

TASK BRIEF & NOTES:
--------------------------------------------
${task.notes || 'No additional notes.'}
--------------------------------------------

Open task directly: ${taskUrl}

RAK 4 CREATIVE Traffic Hub • Beirut HQ
`;

  const html = wrapEmailLayout({
    preheader,
    headerBanner,
    contentHtml,
    taskUrl,
    ctaText: 'Open & Start Task in Traffic Hub',
    footerNote: 'You received this email because you were assigned to this task in RAK 4 Creative Traffic Hub.'
  });

  return { subject, html, text };
}

/**
 * 2. DUE TODAY REMINDER EMAIL TEMPLATE
 * Dispatched when the task deadline is today
 */
export function generateDueTodayEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;
  const priorityStyle = getPriorityColors(task.priority);

  const subject = `[⏰ DUE TODAY] Task Deadline: ${task.title} - ${client?.name || 'Client'}`;
  const preheader = `Reminder: Task "${task.title}" is due today (${formatDate(task.dueDate)}). Please update your progress.`;

  const headerBanner = `
    <tr>
      <td style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 18px 28px; color: #ffffff;" class="mobile-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #fef3c7;">
                ⏰ DEADLINE TODAY
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">
                Task deadline is scheduled for today
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const contentHtml = `
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${escapeHtml(assignee.name)}</strong>,<br>
      This is a friendly reminder that the task <strong>"${escapeHtml(task.title)}"</strong> is scheduled for completion <strong>today (${formatDate(task.dueDate)})</strong>.
    </div>

    <!-- Task Details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="display:inline-block; background-color:${priorityStyle.bg}; color:${priorityStyle.text}; border:1px solid ${priorityStyle.border}; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase;">
              ${priorityStyle.label}
            </span>
            <span style="display:inline-block; background-color:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800;">
              TARGET: TODAY
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 800; color: #78350f; margin-bottom: 12px;">
            ${escapeHtml(task.title)}
          </div>

          <div style="font-size: 13px; color: #92400e; margin-bottom: 6px;">
            🏢 <strong>Client:</strong> ${escapeHtml(client?.name || 'Client')}
          </div>
          <div style="font-size: 13px; color: #92400e; margin-bottom: 6px;">
            👤 <strong>Assigned By:</strong> ${escapeHtml(assigner?.name || 'Management')}
          </div>
          <div style="font-size: 13px; color: #92400e;">
            📊 <strong>Current Status:</strong> ${escapeHtml(task.status)}
          </div>
        </td>
      </tr>
    </table>

    <!-- Notes Preview -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
        Brief Notes:
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${escapeHtml(task.notes || 'No notes.')}
      </div>
    </div>

    <div style="font-size: 13px; color: #334155; line-height: 1.5; text-align: center; margin-top: 16px;">
      Please ensure deliverables are submitted and status is marked as <strong>Completed</strong> or updated in the system today.
    </div>
  `;

  const text = `
RAK 4 CREATIVE - DEADLINE TODAY REMINDER
========================================

Hello ${assignee.name},

Reminder: The following task is due TODAY:
Title: ${task.title}
Client: ${client?.name || 'Client'}
Due Date: ${task.dueDate} (TODAY)
Priority: ${task.priority}
Current Status: ${task.status}

Direct Link to Update: ${taskUrl}
`;

  const html = wrapEmailLayout({
    preheader,
    headerBanner,
    contentHtml,
    taskUrl,
    ctaText: 'Review & Complete Task Now',
    footerNote: 'Daily deadline reminder from RAK 4 Creative Traffic Engine.'
  });

  return { subject, html, text };
}

/**
 * 3. DAILY OVERDUE REMINDER EMAIL TEMPLATE (1 EMAIL PER DAY UNTIL CLOSED)
 * Dispatched daily for active delayed/overdue tasks until marked completed
 */
export function generateOverdueDailyEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL, daysOverdue = 1 } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;
  const reminderCount = task.emailReminderCount ? task.emailReminderCount + 1 : 1;

  const subject = `[🚨 OVERDUE - Daily Update #${reminderCount}] ${task.title} (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} late)`;
  const preheader = `URGENT: Task "${task.title}" is ${daysOverdue} days overdue (Due: ${formatDate(task.dueDate)}). Please update status.`;

  const headerBanner = `
    <tr>
      <td style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 18px 28px; color: #ffffff;" class="mobile-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #ffe4e6;">
                🚨 DAILY OVERDUE REMINDER • NOTICE #${reminderCount}
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">
                Task is past due date (${daysOverdue} day${daysOverdue > 1 ? 's' : ''} late)
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const contentHtml = `
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${escapeHtml(assignee.name)}</strong>,<br>
      This is your <strong>daily update</strong> regarding an outstanding overdue task. The deadline passed <strong>${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago (${formatDate(task.dueDate)})</strong> and is currently awaiting your completion.
    </div>

    <!-- Overdue Urgency Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td>
                <span style="display:inline-block; background-color:#be123c; color:#ffffff; padding:3px 10px; border-radius:6px; font-size:11px; font-weight:800;">
                  ⚠️ ${daysOverdue} DAYS OVERDUE
                </span>
              </td>
              <td align="right">
                <span style="font-size:12px; font-weight:700; color:#9f1239;">
                  Due Date: ${formatDate(task.dueDate)}
                </span>
              </td>
            </tr>
          </table>

          <div style="font-size: 18px; font-weight: 800; color: #881337; line-height: 1.3; margin-bottom: 12px;">
            ${escapeHtml(task.title)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #fecdd3; padding-top: 12px;">
            <tr>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519;">${escapeHtml(client?.name || 'Client')}</div>
              </td>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Manager</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519;">${escapeHtml(assigner?.name || 'Management')}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Task Notes -->
    <div style="margin-bottom: 20px;">
      <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 6px;">
        Task Scope:
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${escapeHtml(task.notes || 'No notes.')}
      </div>
    </div>

    <!-- Daily Protocol Notice -->
    <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 14px; text-align: center; margin-bottom: 10px;">
      <div style="font-size: 12px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">
        📌 Daily Escalation Policy
      </div>
      <div style="font-size: 12px; color: #7f1d1d; line-height: 1.4;">
        You will receive <strong>1 daily email update</strong> every morning until this task is marked as <strong>Completed</strong> or updated in the system.
      </div>
    </div>
  `;

  const text = `
RAK 4 CREATIVE - DAILY OVERDUE REMINDER (NOTICE #${reminderCount})
===============================================================

URGENT: The following task is ${daysOverdue} days overdue!
Title: ${task.title}
Client: ${client?.name || 'Client'}
Due Date: ${task.dueDate} (${daysOverdue} days late)
Assigned By: ${assigner?.name || 'Management'}
Current Status: ${task.status}

You will receive 1 email per day until this task is marked as Completed.

Update Task Status: ${taskUrl}

RAK 4 CREATIVE Traffic Operations
`;

  const html = wrapEmailLayout({
    preheader,
    headerBanner,
    contentHtml,
    taskUrl,
    ctaText: 'Update Task & Mark Completed Now',
    footerNote: 'You will receive 1 daily update for this overdue task until it is marked as Completed.'
  });

  return { subject, html, text };
}

/**
 * 4. TASK COMPLETED EMAIL TEMPLATE
 * Dispatched to the manager when the assignee completes the task
 */
export function generateTaskCompletedEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;

  const subject = `[✅ Task Completed] ${task.title} - by ${assignee.name}`;
  const preheader = `${assignee.name} has completed the task "${task.title}" for ${client?.name || 'Client'}.`;

  const headerBanner = `
    <tr>
      <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 18px 28px; color: #ffffff;" class="mobile-padding">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #a7f3d0;">
                🎉 TASK COMPLETED
              </div>
              <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 4px;">
                Deliverables submitted & task marked as completed
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  const contentHtml = `
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${escapeHtml(assigner?.name || 'Manager')}</strong>,<br>
      <strong>${escapeHtml(assignee.name)}</strong> has marked the following task as <strong>Completed</strong>:
    </div>

    <!-- Completed Task Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <div style="font-size: 18px; font-weight: 800; color: #14532d; line-height: 1.3; margin-bottom: 12px;">
            ${escapeHtml(task.title)}
          </div>
          <div style="font-size: 13px; color: #166534; margin-bottom: 4px;">
            🏢 <strong>Client:</strong> ${escapeHtml(client?.name || 'Client')}
          </div>
          <div style="font-size: 13px; color: #166534; margin-bottom: 4px;">
            👤 <strong>Completed by:</strong> ${escapeHtml(assignee.name)} (${escapeHtml(assignee.department)})
          </div>
          <div style="font-size: 13px; color: #166534;">
            📅 <strong>Completed on:</strong> ${formatDate(task.completedDate || new Date().toISOString().split('T')[0])}
          </div>
        </td>
      </tr>
    </table>
  `;

  const text = `
RAK 4 CREATIVE - TASK COMPLETED
===============================

Hello ${assigner?.name || 'Manager'},

${assignee.name} has completed the task:
Title: ${task.title}
Client: ${client?.name || 'Client'}
Completed Date: ${task.completedDate || new Date().toISOString().split('T')[0]}

View in Hub: ${taskUrl}
`;

  const html = wrapEmailLayout({
    preheader,
    headerBanner,
    contentHtml,
    taskUrl,
    ctaText: 'View Completed Task in Traffic Hub',
    footerNote: 'Dispatched to creative management upon task completion.'
  });

  return { subject, html, text };
}

/**
 * 5. TEST EMAIL TEMPLATE
 */
export function generateTestEmail(params: { recipientName: string; recipientEmail: string; baseUrl?: string }): { subject: string; html: string; text: string } {
  const { recipientName, recipientEmail, baseUrl = DEFAULT_BASE_URL } = params;

  const subject = `[RAK Traffic] Email Notification System Test Connection`;
  const preheader = `Connection verified! RAK 4 Creative email notification system is working correctly.`;

  const contentHtml = `
    <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
      Hello <strong>${escapeHtml(recipientName)}</strong>,<br>
      This is a test notification confirming that the <strong>RAK 4 CREATIVE Email Dispatcher</strong> is successfully configured and connected.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
      <tr>
        <td>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Connection Status: <span style="color: #059669;">ONLINE & OPERATIONAL</span>
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
            • Target Recipient: ${escapeHtml(recipientEmail)}<br>
            • Time of Dispatch: ${new Date().toUTCString()}<br>
            • Automated Daily Scan: Active (1 email / day per overdue task)
          </div>
        </td>
      </tr>
    </table>
  `;

  const text = `
RAK 4 CREATIVE - TEST EMAIL
===========================
Hello ${recipientName},

Your email notification setup is verified and active!
Recipient: ${recipientEmail}
Time: ${new Date().toISOString()}

RAK 4 CREATIVE Traffic System
`;

  const html = wrapEmailLayout({
    preheader,
    contentHtml,
    taskUrl: baseUrl,
    ctaText: 'Open RAK Traffic Hub',
    footerNote: 'Test email generated by RAK 4 Creative settings console.'
  });

  return { subject, html, text };
}
