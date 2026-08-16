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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar: string;
  active: boolean;
  weeklyOffDays: number[]; // 0 = Sun, 5 = Fri, 6 = Sat
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

export type Priority = 'Normal' | 'Urgent' | 'High';

export type TaskStatus = 'Not started' | 'Briefed' | 'In progress' | 'Completed' | 'Delayed';

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
