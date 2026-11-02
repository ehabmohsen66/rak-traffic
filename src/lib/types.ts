export type UserRole = 'admin' | 'manager' | 'employee';

export type Department = 
  | 'Management'
  | 'Creative' 
  | 'Creative Direction'
  | 'Design' 
  | 'Digital / Performance'
  | 'Digital/Paid Media' 
  | 'Senior Digital Marketing'
  | 'Social Media'
  | 'Social Media Specialist'
  | 'SEO' 
  | 'Motion Graphics' 
  | 'Media Production'
  | 'Creative Media Producer'
  | 'Account Management' 
  | 'Account Executive'
  | 'Content & Strategy'
  | 'Narrative Strategist'
  | 'Copywriting'
  | 'Senior Copywriter'
  | 'Finance'
  | 'Finance & Accounts'
  | 'Sales';

export type UserWorkStatus = 'working' | 'off' | 'on_leave';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  active: boolean;
  weeklyOffDays: number[]; // 0 = Sun, 5 = Fri, 6 = Sat
  workStatus?: UserWorkStatus;
  remainingHolidays?: number;
  plannedOffDates?: string[]; // Array of YYYY-MM-DD scheduled off dates or custom text entries
}

export function getTodayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatIsoToDdMmYyyy(isoStr: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoStr.trim());
  if (!m) return isoStr;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function parseFlexibleDate(input: string): { iso: string; note?: string } | null {
  const raw = input.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();
  if (lower === 'today' || lower === 'اليوم') {
    return { iso: getTodayIsoLocal() };
  }
  if (lower === 'tomorrow' || lower === 'tmrw' || lower === 'غدا' || lower === 'غداً') {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { iso: `${y}-${m}-${day}` };
  }

  // Match YYYY-MM-DD or YYYY/MM/DD (with optional trailing note after | or - or space)
  const isoMatch = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s*(?:\||[-–—:]|\s)\s*(.+))?$/.exec(raw);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]);
    const d = Number(isoMatch[3]);
    const note = isoMatch[4]?.trim();
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return note ? { iso, note } : { iso };
    }
  }

  // Match DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (or 2-digit year YY), with optional trailing note
  const dmyMatch = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})(?:\s*(?:\||[-–—:]|\s)\s*(.+))?$/.exec(raw);
  if (dmyMatch) {
    let d = Number(dmyMatch[1]);
    let m = Number(dmyMatch[2]);
    let y = Number(dmyMatch[3]);
    const note = dmyMatch[4]?.trim();
    if (y < 100) y += 2000;
    if (m > 12 && d <= 12) {
      const tmp = d;
      d = m;
      m = tmp;
    }
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= 2100) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return note ? { iso, note } : { iso };
    }
  }

  // Match DD/MM without year (assume current year)
  const dmMatch = /^(\d{1,2})[-/](\d{1,2})(?:\s*(?:\||[-–—:]|\s)\s*(.+))?$/.exec(raw);
  if (dmMatch) {
    const d = Number(dmMatch[1]);
    const m = Number(dmMatch[2]);
    const note = dmMatch[3]?.trim();
    const y = new Date().getFullYear();
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      return note ? { iso, note } : { iso };
    }
  }

  return null;
}

export function extractIsoDate(dateOrText: string): string | null {
  if (!dateOrText) return null;
  const parsed = parseFlexibleDate(dateOrText);
  return parsed ? parsed.iso : null;
}

export function getEffectiveWorkStatus(user?: User): UserWorkStatus {
  if (!user) return 'working';
  const today = getTodayIsoLocal();
  if (user.plannedOffDates?.some((d) => extractIsoDate(d) === today)) {
    return 'off';
  }
  return user.workStatus || 'working';
}

export function getUpcomingOffDates(user?: User): string[] {
  if (!user?.plannedOffDates || !Array.isArray(user.plannedOffDates)) return [];
  const today = getTodayIsoLocal();
  return [...user.plannedOffDates]
    .filter((d) => {
      const iso = extractIsoDate(d);
      return iso ? iso >= today : Boolean(d && d.trim());
    })
    .sort();
}

export function formatOffDateShort(dateStr: string, lang: 'en' | 'ar' = 'en'): string {
  const parsed = parseFlexibleDate(dateStr);
  if (!parsed) return dateStr;
  const parts = parsed.iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const formatted = date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return parsed.note ? `${formatted} (${parsed.note})` : formatted;
}

export function expandDateRange(startStr: string, endStr?: string): string[] {
  const rawStart = startStr.trim();
  const rawEnd = (endStr || '').trim();
  if (!rawStart) return [];

  const startParsed = parseFlexibleDate(rawStart);
  const endParsed = rawEnd ? parseFlexibleDate(rawEnd) : null;

  if (startParsed && endParsed) {
    const startIso = startParsed.iso;
    const endIso = endParsed.iso;
    const note = startParsed.note || endParsed.note;
    if (endIso <= startIso) {
      return [note ? `${startIso}|${note}` : startIso];
    }
    const [sy, sm, sd] = startIso.split('-').map(Number);
    const [ey, em, ed] = endIso.split('-').map(Number);
    const cur = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    const dates: string[] = [];
    // Cap range at 60 days for safety
    let count = 0;
    while (cur <= end && count < 60) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const d = String(cur.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      dates.push(note ? `${iso}|${note}` : iso);
      cur.setDate(cur.getDate() + 1);
      count++;
    }
    return dates;
  }

  if (startParsed) {
    const combinedNote = [startParsed.note, rawEnd].filter(Boolean).join(' - ');
    return [combinedNote ? `${startParsed.iso}|${combinedNote}` : startParsed.iso];
  }

  if (rawEnd) {
    return [`${rawStart} - ${rawEnd}`];
  }
  return [rawStart];
}

export function getAssigneeOffAlert(
  user?: User,
  briefDate?: string,
  dueDate?: string,
  lang: 'en' | 'ar' = 'en'
): {
  hasAlert: boolean;
  isConflictWithTaskDates: boolean;
  isOffToday: boolean;
  conflictingDates: string[];
  upcomingDates: string[];
  message: string;
} {
  if (!user) {
    return {
      hasAlert: false,
      isConflictWithTaskDates: false,
      isOffToday: false,
      conflictingDates: [],
      upcomingDates: [],
      message: '',
    };
  }
  const today = getTodayIsoLocal();
  const statusToday = getEffectiveWorkStatus(user);
  const isOffToday = statusToday !== 'working';
  const upcomingDates = getUpcomingOffDates(user);

  const start = briefDate || today;
  const end = dueDate && dueDate >= start ? dueDate : start;
  const conflictingDates = upcomingDates.filter((d) => {
    const iso = extractIsoDate(d);
    return iso ? iso >= start && iso <= end : false;
  });
  const isConflictWithTaskDates = isOffToday || conflictingDates.length > 0;
  const hasAlert = isOffToday || upcomingDates.length > 0;

  if (!hasAlert) {
    return {
      hasAlert: false,
      isConflictWithTaskDates: false,
      isOffToday: false,
      conflictingDates: [],
      upcomingDates: [],
      message: '',
    };
  }

  const formattedConflict = conflictingDates.map((d) => formatOffDateShort(d, lang)).join(', ');
  const formattedUpcoming = upcomingDates.map((d) => formatOffDateShort(d, lang)).join(', ');

  let message = '';
  if (lang === 'ar') {
    if (conflictingDates.length > 0) {
      message = `تنبيه: ${user.name} في إجازة بتاريخ (${formattedConflict}) خلال فترة هذه المهمة!`;
    } else if (isOffToday && upcomingDates.length > 0) {
      message = `تنبيه: ${user.name} في إجازة اليوم ولديه إجازات مجدولة (${formattedUpcoming})!`;
    } else if (isOffToday) {
      message = `تنبيه: ${user.name} في إجازة اليوم (${statusToday === 'on_leave' ? 'في إجازة سنوية' : 'غير متاح'})!`;
    } else {
      message = `ملاحظة: ${user.name} لديه أيام إجازة قادمة بتاريخ (${formattedUpcoming}).`;
    }
  } else {
    if (conflictingDates.length > 0) {
      message = `Alert: ${user.name} is scheduled OFF on ${formattedConflict} (falls within this task's dates)!`;
    } else if (isOffToday && upcomingDates.length > 0) {
      message = `Alert: ${user.name} is OFF today and scheduled OFF on ${formattedUpcoming}!`;
    } else if (isOffToday) {
      message = `Alert: ${user.name} is currently ${statusToday === 'on_leave' ? 'On Leave' : 'OFF today'}!`;
    } else {
      message = `Heads up: ${user.name} is scheduled to be OFF on ${formattedUpcoming}.`;
    }
  }

  return {
    hasAlert,
    isConflictWithTaskDates,
    isOffToday,
    conflictingDates,
    upcomingDates,
    message,
  };
}

export type RetainerType = 
  | 'SM & DIGITAL' 
  | 'SM & DIGITAL + BRANDING' 
  | 'DIGITAL & COMMUNICATIONS'
  | 'PERFORMANCE MARKETING' 
  | 'BRANDING & STRATEGY' 
  | 'SM RETAINER'
  | 'SM RETAINER + BRANDING'
  | 'SM RETAINER + SEO'
  | 'WEB SUPPORT SCOPE'
  | 'DIGITAL & WEB HOSTING'
  | 'WEB DEVELOPMENT'
  | 'QR CODE & DIGITAL'
  | 'SEO & CONTENT'
  | string;

export type ClientTier = 'LIGHT' | 'REGULAR' | 'BIG';

export interface Client {
  id: string;
  name: string;
  retainerType: RetainerType;
  tier: ClientTier;
  accountOwnerIds: string[]; // User IDs
  active: boolean;
  notes?: string;
  logo?: string;
}

export type Priority = 'Normal' | 'High' | 'Urgent' | 'Super Urgent';

export type TaskStatus = 'Not started' | 'Briefed' | 'In progress' | 'Super Urgent' | 'Completed' | 'Delayed';

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  assignedToId: string; // Primary assignee
  teamMemberIds?: string[]; // Optional secondary team members
  assignedById: string; // Manager who created/assigned
  priority: Priority;
  status: TaskStatus;
  briefDate: string; // ISO date string (YYYY-MM-DD)
  dueDate: string; // ISO date string (YYYY-MM-DD)
  completedDate?: string | null;
  notes: string;
  attachments?: TaskAttachment[];
  recurrenceRuleId?: string | null;
  isRecurring?: boolean;
  lastEmailSentDate?: string | null; // Track date (YYYY-MM-DD) of last sent email reminder
  emailReminderCount?: number; // Total number of deadline/overdue reminder emails sent
  createdAt?: string;
  updatedAt?: string;
}

export type RecurrenceType = 'one_time' | 'weekly' | 'monthly';

export interface RecurrenceRule {
  id: string;
  titleTemplate: string;
  clientId: string;
  assignedToId: string;
  priority: Priority;
  notes: string;
  recurrenceType: RecurrenceType;
  interval: number; // e.g. every 1 week, every 2 months
  dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
  dayOfMonth?: number; // 1-31 or 99 for last day of month (for monthly)
  startDate: string;
  endDate?: string | null;
  nextRunDate: string;
  active: boolean;
  createdById?: string;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  taskId: string;
  taskTitle: string;
  changedById: string;
  changedByName: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
  actionSummary: string;
}

export type NotificationType = 'overdue' | 'due_soon' | 'assigned' | 'reassigned' | 'status_changed';

export interface Notification {
  id: string;
  userId: string;
  taskId?: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
}

export type EmailNotificationType = 
  | 'assigned' 
  | 'reassigned' 
  | 'due_soon' 
  | 'due_today' 
  | 'overdue' 
  | 'completed' 
  | 'test';

export type EmailDeliveryStatus = 'sent' | 'delivered' | 'failed' | 'simulated';

export interface EmailLog {
  id: string;
  taskId?: string;
  taskTitle?: string;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  type: EmailNotificationType;
  htmlBody: string;
  textBody: string;
  sentAt: string;
  status: EmailDeliveryStatus;
  provider: string;
  errorMessage?: string;
}

export type EmailProviderType = 'vercel' | 'resend' | 'sendgrid' | 'brevo' | 'webhook' | 'simulated';

export interface EmailConfig {
  provider: EmailProviderType;
  apiKey?: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  webhookUrl?: string;
  enableAssignmentEmails: boolean;
  enableDailyReminders: boolean;
  lastDailyScanDate?: string;
}

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


