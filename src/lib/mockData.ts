import { User, Client, Task, RecurrenceRule, AuditLog, Notification, EmailLog, EmailConfig } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-farah',
    name: 'Farah Younes',
    email: 'farah@rak4cloud.com',
    role: 'admin',
    department: 'General Management',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-krystel',
    name: 'Krystel Saleh',
    email: 'krystel.saleh@gmail.com',
    role: 'manager',
    department: 'Creative Direction',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-johnny',
    name: 'Johnny Al Sandroussy',
    email: 'j.sandroussy@rak4digital.com',
    role: 'manager',
    department: 'Account Management',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-alex',
    name: 'Alex Yanni',
    email: 'a.yanni@rak4digital.com',
    role: 'employee',
    department: 'Account Executive',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-ehab',
    name: 'Ehab Mohsen',
    email: 'ehab.m@rak4digital.com',
    role: 'employee',
    department: 'Senior Digital Marketing',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-khaled',
    name: 'Khaled Soueid',
    email: 'k.soueid@rak4digital.com',
    role: 'employee',
    department: 'Social Media Specialist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-tatiana',
    name: 'Tatiana Tarabay',
    email: 't.tarabay@rak4digital.com',
    role: 'employee',
    department: 'Lead Graphic Designer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-myriam',
    name: 'Myriam Ghosn',
    email: 'm.ghosn@rak4digital.com',
    role: 'employee',
    department: 'Graphic Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-hoda',
    name: 'Hoda Azizi',
    email: 'h.azizi@rak4digital.com',
    role: 'employee',
    department: 'Senior Graphic Designer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-selim',
    name: 'Selim Chahwan',
    email: 'selim.c@rak4digital.com',
    role: 'employee',
    department: 'Motion Graphics & AI',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-tarek',
    name: 'Tarek Abou-Moghelbey',
    email: 'tarek.am@rak4digital.com',
    role: 'employee',
    department: 'Creative Media Producer',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-elio',
    name: 'Elio Chammas',
    email: 'e.chammas@rak4digital.com',
    role: 'employee',
    department: 'Narrative Strategist',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-majd',
    name: 'Majd Yassine',
    email: 'm.yassine@rak4digital.com',
    role: 'employee',
    department: 'Senior Copywriter',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-ychami',
    name: 'Youssef Chami',
    email: 'y.chami@rak4digital.com',
    role: 'employee',
    department: 'Account & Creative Executive',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  },
  {
    id: 'usr-pascale',
    name: 'Pascale Ghanime',
    email: 'pascale.g@rak4creative.com',
    role: 'employee',
    department: 'Finance & Accounts',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    active: true,
    weeklyOffDays: [5, 6]
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-matrix-dubai',
    name: 'Matrix / Johnson Dubai',
    retainerType: 'SM & DIGITAL + BRANDING',
    tier: 'BIG',
    accountOwnerIds: ['usr-johnny', 'usr-farah'],
    active: true,
    notes: 'Key Enterprise Account: Fitness equipment & retail UAE campaign releases.'
  },
  {
    id: 'cli-matrix-ksa',
    name: 'Matrix / Johnson KSA',
    retainerType: 'DIGITAL & COMMUNICATIONS',
    tier: 'BIG',
    accountOwnerIds: ['usr-johnny'],
    active: true,
    notes: 'KSA Regional Market expansion and digital communication.'
  },
  {
    id: 'cli-feetlab',
    name: 'Feetlab / Feetness UAE',
    retainerType: 'SM & DIGITAL',
    tier: 'REGULAR',
    accountOwnerIds: ['usr-johnny', 'usr-alex'],
    active: true,
    notes: 'Orthotics & Footwear wellness brand - continuous weekly content and SEO.'
  },
  {
    id: 'cli-guardia',
    name: 'Guardia Systems',
    retainerType: 'SM RETAINER + SEO',
    tier: 'REGULAR',
    accountOwnerIds: ['usr-johnny'],
    active: true,
    notes: 'Security and technology systems provider - monthly grid & SEO tracking.'
  },
  {
    id: 'cli-lavora',
    name: 'Lavora Clinic',
    retainerType: 'SM & DIGITAL + BRANDING',
    tier: 'BIG',
    accountOwnerIds: ['usr-tarek', 'usr-farah'],
    active: true,
    notes: 'VIP Healthcare Clinic - Life Hacks video series, Ultraformer, and VIP Experience.'
  },
  {
    id: 'cli-softpharm',
    name: 'SoftPharm',
    retainerType: 'SM RETAINER',
    tier: 'LIGHT',
    accountOwnerIds: ['usr-johnny'],
    active: true,
    notes: 'Pharmaceutical products - campaigns, boosted posts, and lead generation.'
  },
  {
    id: 'cli-technal',
    name: 'Technal',
    retainerType: 'SM RETAINER + BRANDING',
    tier: 'REGULAR',
    accountOwnerIds: ['usr-johnny'],
    active: true,
    notes: 'Architectural aluminum systems.'
  },
  {
    id: 'cli-mojo',
    name: 'Mojo',
    retainerType: 'SM & DIGITAL + BRANDING',
    tier: 'BIG',
    accountOwnerIds: ['usr-farah'],
    active: true,
    notes: 'Lifestyle and F&B brand.'
  },
  {
    id: 'cli-saifan',
    name: 'Saifan',
    retainerType: 'SM & DIGITAL + BRANDING',
    tier: 'REGULAR',
    accountOwnerIds: ['usr-johnny', 'usr-alex'],
    active: true,
    notes: 'Olive oil and culinary heritage brand.'
  },
  {
    id: 'cli-allstate',
    name: 'Allstate',
    retainerType: 'SM & DIGITAL + BRANDING',
    tier: 'BIG',
    accountOwnerIds: ['usr-farah'],
    active: true,
    notes: 'Insurance and financial services.'
  },
  {
    id: 'cli-saudi-biga',
    name: 'Saudi Biga',
    retainerType: 'WEB SUPPORT SCOPE',
    tier: 'LIGHT',
    accountOwnerIds: ['usr-johnny'],
    active: true,
    notes: 'Bakery & Food service - website hosting & maintenance.'
  },
  {
    id: 'cli-rak-internal',
    name: 'RAK Internal / Analytics',
    retainerType: 'BRANDING & STRATEGY',
    tier: 'BIG',
    accountOwnerIds: ['usr-farah', 'usr-alex'],
    active: true,
    notes: 'Agency in-house branding, Intellix video scripts, wall murals, and website.'
  },
  {
    id: 'cli-khl',
    name: 'KHL',
    retainerType: 'DIGITAL & WEB HOSTING',
    tier: 'LIGHT',
    accountOwnerIds: ['usr-farah'],
    active: true,
    notes: 'Industrial and trading services.'
  },
  {
    id: 'cli-get-refreshed',
    name: 'Get Refreshed',
    retainerType: 'SM & DIGITAL',
    tier: 'LIGHT',
    accountOwnerIds: ['usr-alex'],
    active: true,
    notes: 'Beverage & refreshment brand.'
  }
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_RECURRENCE_RULES: RecurrenceRule[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const INITIAL_EMAIL_CONFIG: EmailConfig = {
  provider: 'vercel',
  fromName: 'RAK 4 CREATIVE Traffic Operations',
  fromEmail: 'onboarding@resend.dev',
  replyTo: 'farah@rak4cloud.com',
  enableAssignmentEmails: true,
  enableDailyReminders: true,
  lastDailyScanDate: '2026-08-17'
};

export const INITIAL_EMAIL_LOGS: EmailLog[] = [];
