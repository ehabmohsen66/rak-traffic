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

const DEFAULT_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://rak4dev.com';

function getPriorityPill(priority: Priority) {
  switch (priority) {
    case 'Super Urgent':
    case 'Urgent':
      return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', label: '🔥 URGENT' };
    case 'High':
      return { bg: '#fffbeb', text: '#d97706', border: '#fde68a', label: '⚡ HIGH' };
    default:
      return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', label: 'NORMAL' };
  }
}

function getStatusPill(status: TaskStatus) {
  switch (status) {
    case 'Completed':
      return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', label: 'Completed' };
    case 'Delayed':
      return { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3', label: 'Delayed' };
    case 'In progress':
      return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe', label: 'In Progress' };
    case 'Briefed':
      return { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff', label: 'Briefed' };
    default:
      return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0', label: status };
  }
}

function escapeHtml(text: string): string {
  if (!text) return '';
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
 * Clean & Modern Email Layout Wrapper
 */
function wrapEmailLayout({
  preheader,
  badgeText = 'RAK Traffic',
  headline,
  accentColor = '#4f46e5',
  contentHtml,
  taskUrl,
  ctaText = 'View Task in RAK Traffic',
  footerNote
}: {
  preheader: string;
  badgeText?: string;
  headline?: string;
  accentColor?: string;
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
  <title>RAK Traffic</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #0f172a;
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
      .container-table { width: 100% !important; border-radius: 0 !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc;">
  <!-- Hidden Preheader -->
  <div style="display:none;font-size:1px;color:#f8fafc;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; width:100%; min-height:100vh;">
    <tr>
      <td align="center" style="padding: 32px 12px;">
        
        <!-- Main Email Card -->
        <table role="presentation" class="container-table" width="580" cellpadding="0" cellspacing="0" border="0" style="width:580px; max-width:580px; background-color:#ffffff; border-radius:16px; overflow:hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);">
          
          <!-- Sleek Header -->
          <tr>
            <td style="padding: 22px 28px; background-color: #0f172a;" class="mobile-padding">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <span style="font-size: 19px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">RAK</span>
                    <span style="font-size: 13px; font-weight: 800; color: #818cf8; letter-spacing: 1.5px; margin-left: 6px; text-transform: uppercase;">TRAFFIC</span>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #cbd5e1; letter-spacing: 0.3px;">
                      ${escapeHtml(badgeText)}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            headline
              ? `
          <!-- Headline Banner -->
          <tr>
            <td style="background-color: ${accentColor}; padding: 14px 28px; color: #ffffff;" class="mobile-padding">
              <div style="font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">
                ${escapeHtml(headline)}
              </div>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 28px 32px 28px;" class="mobile-padding">
              ${contentHtml}

              <!-- Action Button -->
              ${
                taskUrl
                  ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="border-radius: 10px; background-color: #4f46e5;">
                          <a href="${taskUrl}" target="_blank" style="display: inline-block; padding: 13px 26px; font-size: 13px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 10px; letter-spacing: 0.2px;">
                            ${escapeHtml(ctaText)} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
            </td>
          </tr>

          <!-- Clean Minimalist Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 28px; border-top: 1px solid #f1f5f9; text-align: center;" class="mobile-padding">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: #64748b;">
                RAK Traffic • Agency Workflow Platform
              </p>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                ${footerNote || 'Automated operational notification. You received this because you are part of this task assignment.'}
              </p>
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
 */
export function generateTaskAssignedEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;
  const priorityStyle = getPriorityPill(task.priority);
  const statusStyle = getStatusPill(task.status);
  const assigneeName = assignee?.name || 'Team Member';
  const assignerName = assigner?.name || 'Management';

  const subject = `[New Task] ${task.title} - ${client?.name || 'Client'}`;
  const preheader = `Hi @${assigneeName}, you have been assigned to "${task.title}". Due: ${formatDate(task.dueDate)}.`;

  const contentHtml = `
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #4f46e5;">@${escapeHtml(assigneeName)}</strong>,<br>
      <span style="color: #475569;">You have been assigned a new task by <strong>${escapeHtml(assignerName)}</strong>:</span>
    </div>

    <!-- Task Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          
          <!-- Badges -->
          <div style="margin-bottom: 10px;">
            <span style="display:inline-block; background-color:${priorityStyle.bg}; color:${priorityStyle.text}; border:1px solid ${priorityStyle.border}; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase; margin-right:6px;">
              ${priorityStyle.label}
            </span>
            <span style="display:inline-block; background-color:${statusStyle.bg}; color:${statusStyle.text}; border:1px solid ${statusStyle.border}; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">
              ${statusStyle.label}
            </span>
          </div>

          <!-- Title -->
          <div style="font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.35; margin-bottom: 14px;">
            ${escapeHtml(task.title)}
          </div>

          <!-- Metadata Table -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #e2e8f0; padding-top: 12px;">
            <tr>
              <td width="50%" valign="top" style="padding-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px;">
                  ${escapeHtml(client?.name || 'Client')}
                </div>
              </td>
              <td width="50%" valign="top" style="padding-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Assigned By</div>
                <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-top: 2px;">
                  ${escapeHtml(assignerName)}
                </div>
              </td>
            </tr>
            <tr>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Brief Date</div>
                <div style="font-size: 13px; font-weight: 600; color: #475569; margin-top: 2px;">
                  ${formatDate(task.briefDate)}
                </div>
              </td>
              <td width="50%" valign="top">
                <div style="font-size: 11px; font-weight: 700; color: #dc2626; text-transform: uppercase;">Due Date</div>
                <div style="font-size: 13px; font-weight: 800; color: #dc2626; margin-top: 2px;">
                  ${formatDate(task.dueDate)}
                </div>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>

    <!-- Brief / Notes -->
    ${
      task.notes
        ? `
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
        Brief & Notes
      </div>
      <div style="background-color: #f8fafc; border-left: 3px solid #6366f1; border-radius: 0 8px 8px 0; padding: 12px 14px; font-size: 13px; color: #334155; line-height: 1.5; white-space: pre-wrap;">
${escapeHtml(task.notes)}
      </div>
    </div>
    `
        : ''
    }
  `;

  const text = `
Hi @${assigneeName},

You have been assigned a new task:
Task: ${task.title}
Client: ${client?.name || 'Client'}
Assigned By: ${assignerName}
Due Date: ${task.dueDate}
Priority: ${task.priority}

Brief Notes:
${task.notes || 'No specific notes.'}

Open in RAK Traffic: ${taskUrl}
`;

  const html = wrapEmailLayout({
    preheader,
    badgeText: 'New Assignment',
    headline: 'New Task Assigned',
    accentColor: '#4f46e5',
    contentHtml,
    taskUrl,
    ctaText: 'Open Task in RAK Traffic'
  });

  return { subject, html, text };
}

/**
 * 2. DUE TODAY REMINDER EMAIL TEMPLATE
 */
export function generateDueTodayEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;
  const priorityStyle = getPriorityPill(task.priority);
  const assigneeName = assignee?.name || 'Team Member';
  const assignerName = assigner?.name || 'Management';

  const subject = `[Due Today] ${task.title} - ${client?.name || 'Client'}`;
  const preheader = `Hi @${assigneeName}, reminder that "${task.title}" is due today.`;

  const contentHtml = `
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #d97706;">@${escapeHtml(assigneeName)}</strong>,<br>
      <span style="color: #475569;">Friendly reminder that the following task is scheduled for completion <strong>today</strong>:</span>
    </div>

    <!-- Task Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="margin-bottom: 8px;">
            <span style="display:inline-block; background-color:${priorityStyle.bg}; color:${priorityStyle.text}; border:1px solid ${priorityStyle.border}; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">
              ${priorityStyle.label}
            </span>
            <span style="display:inline-block; background-color:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800; margin-left:6px;">
              DUE TODAY
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 800; color: #78350f; line-height: 1.35; margin-bottom: 12px;">
            ${escapeHtml(task.title)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #fef3c7; padding-top: 10px;">
            <tr>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #78350f; margin-top: 2px;">${escapeHtml(client?.name || 'Client')}</div>
              </td>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase;">Manager</div>
                <div style="font-size: 13px; font-weight: 700; color: #78350f; margin-top: 2px;">${escapeHtml(assignerName)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      task.notes
        ? `
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
        Brief Notes
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${escapeHtml(task.notes)}
      </div>
    </div>
    `
        : ''
    }

    <div style="font-size: 13px; color: #64748b; text-align: center;">
      Please submit your deliverables and mark the task as <strong>Completed</strong> in RAK Traffic once done.
    </div>
  `;

  const text = `
Hi @${assigneeName},

Reminder: The following task is due TODAY:
Task: ${task.title}
Client: ${client?.name || 'Client'}
Due Date: ${task.dueDate} (Today)
Priority: ${task.priority}

Open & Complete in RAK Traffic: ${taskUrl}
`;

  const html = wrapEmailLayout({
    preheader,
    badgeText: 'Deadline Today',
    headline: 'Task Due Today',
    accentColor: '#d97706',
    contentHtml,
    taskUrl,
    ctaText: 'Review & Complete Task'
  });

  return { subject, html, text };
}

/**
 * 3. DAILY OVERDUE REMINDER EMAIL TEMPLATE
 */
export function generateOverdueDailyEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL, daysOverdue = 1 } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;
  const assigneeName = assignee?.name || 'Team Member';
  const assignerName = assigner?.name || 'Management';

  const subject = `[Overdue] ${task.title} (${daysOverdue}d late) - ${client?.name || 'Client'}`;
  const preheader = `Hi @${assigneeName}, task "${task.title}" is ${daysOverdue} days overdue. Please update.`;

  const contentHtml = `
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #e11d48;">@${escapeHtml(assigneeName)}</strong>,<br>
      <span style="color: #475569;">This is a daily reminder regarding an overdue task. The deadline passed <strong>${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago (${formatDate(task.dueDate)})</strong>:</span>
    </div>

    <!-- Overdue Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="margin-bottom: 8px;">
            <span style="display:inline-block; background-color:#e11d48; color:#ffffff; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">
              ⚠️ ${daysOverdue} DAYS OVERDUE
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 800; color: #881337; line-height: 1.35; margin-bottom: 12px;">
            ${escapeHtml(task.title)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #fecdd3; padding-top: 10px;">
            <tr>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519; margin-top: 2px;">${escapeHtml(client?.name || 'Client')}</div>
              </td>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #9f1239; text-transform: uppercase;">Manager</div>
                <div style="font-size: 13px; font-weight: 700; color: #4c0519; margin-top: 2px;">${escapeHtml(assignerName)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${
      task.notes
        ? `
    <div style="margin-bottom: 18px;">
      <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
        Scope & Notes
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; line-height: 1.5;">
        ${escapeHtml(task.notes)}
      </div>
    </div>
    `
        : ''
    }
  `;

  const text = `
Hi @${assigneeName},

Task Overdue Reminder:
Task: ${task.title} (${daysOverdue} days late)
Client: ${client?.name || 'Client'}
Due Date: ${task.dueDate}
Manager: ${assignerName}

Update in RAK Traffic: ${taskUrl}
`;

  const html = wrapEmailLayout({
    preheader,
    badgeText: 'Action Required',
    headline: `Overdue Task (${daysOverdue}d late)`,
    accentColor: '#e11d48',
    contentHtml,
    taskUrl,
    ctaText: 'Update Task Status'
  });

  return { subject, html, text };
}

/**
 * 4. TASK COMPLETED EMAIL TEMPLATE
 */
export function generateTaskCompletedEmail(params: EmailTemplateParams): { subject: string; html: string; text: string } {
  const { task, assignee, assigner, client, baseUrl = DEFAULT_BASE_URL } = params;
  const taskUrl = `${baseUrl}/?task=${task.id}`;
  const assigneeName = assignee?.name || 'Team Member';
  const assignerName = assigner?.name || 'Manager';

  const subject = `[Completed] ${task.title} - by @${assigneeName}`;
  const preheader = `Hi @${assignerName}, @${assigneeName} has completed "${task.title}".`;

  const contentHtml = `
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #059669;">@${escapeHtml(assignerName)}</strong>,<br>
      <span style="color: #475569;"><strong>@${escapeHtml(assigneeName)}</strong> has marked the following task as <strong>Completed</strong>:</span>
    </div>

    <!-- Completed Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="margin-bottom: 8px;">
            <span style="display:inline-block; background-color:#059669; color:#ffffff; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:800;">
              ✓ COMPLETED
            </span>
          </div>

          <div style="font-size: 17px; font-weight: 800; color: #14532d; line-height: 1.35; margin-bottom: 12px;">
            ${escapeHtml(task.title)}
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 1px solid #dcfce7; padding-top: 10px;">
            <tr>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Client</div>
                <div style="font-size: 13px; font-weight: 700; color: #14532d; margin-top: 2px;">${escapeHtml(client?.name || 'Client')}</div>
              </td>
              <td width="50%">
                <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase;">Completed By</div>
                <div style="font-size: 13px; font-weight: 700; color: #14532d; margin-top: 2px;">${escapeHtml(assigneeName)}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  const text = `
Hi @${assignerName},

Task Completed:
Task: ${task.title}
Client: ${client?.name || 'Client'}
Completed By: ${assigneeName}

View in RAK Traffic: ${taskUrl}
`;

  const html = wrapEmailLayout({
    preheader,
    badgeText: 'Task Completed',
    headline: 'Task Marked Completed',
    accentColor: '#059669',
    contentHtml,
    taskUrl,
    ctaText: 'View Completed Task'
  });

  return { subject, html, text };
}

/**
 * 5. TEST CONNECTION EMAIL TEMPLATE
 */
export function generateTestEmail(params: { recipientName: string; recipientEmail: string; baseUrl?: string }): { subject: string; html: string; text: string } {
  const { recipientName, recipientEmail, baseUrl = DEFAULT_BASE_URL } = params;

  const subject = `[RAK Traffic] Connection Verified`;
  const preheader = `Hi @${recipientName}, email dispatch connection is verified and operational.`;

  const contentHtml = `
    <!-- Personal Greeting -->
    <div style="font-size: 15px; color: #0f172a; margin-bottom: 18px; line-height: 1.5;">
      Hi <strong style="color: #4f46e5;">@${escapeHtml(recipientName)}</strong>,<br>
      <span style="color: #475569;">Your RAK Traffic notifications are active. You will receive real-time updates here whenever tasks are assigned, updated, or completed.</span>
    </div>

    <!-- Info Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      <tr>
        <td style="padding: 18px 20px;">
          <div style="font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 8px;">
            Notification Preferences
          </div>
          <div style="font-size: 12px; color: #64748b; line-height: 1.6;">
            • Recipient: <strong style="color:#1e293b;">${escapeHtml(recipientEmail)}</strong><br>
            • Task Assignments & Due Dates: Active<br>
            • Daily Morning Reminders: Active
          </div>
        </td>
      </tr>
    </table>
  `;

  const text = `
Hi @${recipientName},

Your email notification setup is verified and active!
Recipient: ${recipientEmail}
Time: ${new Date().toISOString()}

RAK Traffic Hub
`;

  const html = wrapEmailLayout({
    preheader,
    badgeText: 'Connection Verified',
    headline: 'Email Engine Online',
    accentColor: '#4f46e5',
    contentHtml,
    taskUrl: baseUrl,
    ctaText: 'Open RAK Traffic'
  });

  return { subject, html, text };
}
