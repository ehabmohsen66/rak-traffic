export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;
  navMyTasks: string;
  navTasks: string;
  myTasks: string;
  allAgencyTasks: string;
  navWorkload: string;
  navClientWip: string;
  navRecurrence: string;
  navEmployeeAnalytics: string;
  navExcelMigration: string;
  navEmails: string;
  navSettings: string;
  
  // Roles
  roleAdmin: string;
  roleManager: string;
  roleEmployee: string;
  currentUser: string;
  switchRole: string;
  
  // Common Actions
  newTask: string;
  bulkTask: string;
  searchPlaceholder: string;
  filterByClient: string;
  filterByEmployee: string;
  filterByStatus: string;
  filterByPriority: string;
  filterByDate: string;
  allClients: string;
  allEmployees: string;
  allStatuses: string;
  allPriorities: string;
  clearFilters: string;
  exportCsv: string;
  importExcel: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  viewDetails: string;
  close: string;
  
  // Statuses
  statusNotStarted: string;
  statusBriefed: string;
  statusInProgress: string;
  statusCompleted: string;
  statusDelayed: string;
  
  // Priorities
  priorityNormal: string;
  priorityHigh: string;
  priorityUrgent: string;
  prioritySuperUrgent: string;
  
  // Table Columns
  colTaskTitle: string;
  colClient: string;
  colAssignee: string;
  colManager: string;
  colStatus: string;
  colPriority: string;
  colBriefDate: string;
  colDueDate: string;
  colCompletedDate: string;
  colNotes: string;
  colActions: string;

  // View Options
  viewKanban: string;
  viewList: string;
  viewCalendar: string;

  // Overdue / Delayed
  overdueAlertTitle: string;
  overdueAlertMsg: string;
  daysOverdue: string;
  dueToday: string;
  dueTomorrow: string;

  // Recurrence
  repeatType: string;
  oneTime: string;
  weekly: string;
  monthly: string;
  nextRunDate: string;
  activeRules: string;
  addRule: string;

  // Employee Profile
  employeePerformance: string;
  selectEmployee: string;
  timeframe: string;
  thisWeek: string;
  lastMonth: string;
  last30Days: string;
  customRange: string;
  completedTasks: string;
  onTimeRate: string;
  avgTurnaround: string;
  currentWorkload: string;
  auditTrail: string;

  // Client WIP
  clientWipSheet: string;
  retainerType: string;
  clientTier: string;
  accountOwner: string;
  activeTasks: string;
  addClient: string;

  // Excel Migration
  migrationTitle: string;
  migrationSub: string;
  uploadTrafficSheet: string;
  uploadWipSheet: string;
  downloadSampleTraffic: string;
  downloadSampleWip: string;
  dropFileHere: string;
  importSuccess: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: "RAK 4 CREATIVE",
    appSubtitle: "Traffic & Workflow Management",
    navMyTasks: "My Tasks",
    navTasks: "Agency Tasks",
    myTasks: "My Tasks",
    allAgencyTasks: "All Agency Tasks",
    navWorkload: "Workload & Heatmap",
    navClientWip: "Client WIP Sheet",
    navRecurrence: "Recurring Rules",
    navEmployeeAnalytics: "Employee History",
    navExcelMigration: "Excel Migration",
    navEmails: "Email Notifications & Logs",
    navSettings: "Team & Settings",
    
    roleAdmin: "Admin",
    roleManager: "Creative Manager",
    roleEmployee: "Team Member",
    currentUser: "Active User",
    switchRole: "Switch View As",
    
    newTask: "New Task",
    bulkTask: "Bulk Task",
    searchPlaceholder: "Search tasks, briefs, clients, or assignees...",
    filterByClient: "Client",
    filterByEmployee: "Assignee",
    filterByStatus: "Status",
    filterByPriority: "Priority",
    filterByDate: "Date Range",
    allClients: "All Clients",
    allEmployees: "All Team Members",
    allStatuses: "All Statuses",
    allPriorities: "All Priorities",
    clearFilters: "Reset Filters",
    exportCsv: "Export CSV",
    importExcel: "Import Excel",
    save: "Save Task",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    viewDetails: "View Details",
    close: "Close",
    
    statusNotStarted: "Not Started",
    statusBriefed: "Briefed",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusDelayed: "Delayed / Overdue",
    
    priorityNormal: "Normal",
    priorityHigh: "High Priority",
    priorityUrgent: "Urgent",
    prioritySuperUrgent: "🔥 Super Urgent",
    
    colTaskTitle: "Task / Brief",
    colClient: "Client",
    colAssignee: "Assignee",
    colManager: "Manager",
    colStatus: "Status",
    colPriority: "Priority",
    colBriefDate: "Brief Date",
    colDueDate: "Due Date",
    colCompletedDate: "Completed Date",
    colNotes: "Notes & Brief",
    colActions: "Actions",

    viewKanban: "Kanban Board",
    viewList: "Table List",
    viewCalendar: "Calendar",

    overdueAlertTitle: "Delayed Tasks Alert",
    overdueAlertMsg: "tasks require immediate attention!",
    daysOverdue: "days late",
    dueToday: "Due Today",
    dueTomorrow: "Due Tomorrow",

    repeatType: "Recurrence Schedule",
    oneTime: "One-Time Task",
    weekly: "Weekly",
    monthly: "Monthly",
    nextRunDate: "Next Run Date",
    activeRules: "Active Recurrence Rules",
    addRule: "Add Recurring Rule",

    employeePerformance: "Employee Performance & Audit History",
    selectEmployee: "Select Employee",
    timeframe: "Timeframe",
    thisWeek: "This Week",
    lastMonth: "Last Month",
    last30Days: "Last 30 Days",
    customRange: "Custom Range",
    completedTasks: "Tasks Completed",
    onTimeRate: "On-Time Delivery Rate",
    avgTurnaround: "Avg Turnaround",
    currentWorkload: "Active Workload",
    auditTrail: "Chronological Activity & Audit Log",

    clientWipSheet: "Client WIP & Account Mapping",
    retainerType: "Retainer Type",
    clientTier: "Account Size / Tier",
    accountOwner: "Account Owners",
    activeTasks: "Active Tasks",
    addClient: "Add Client",

    migrationTitle: "Excel & CSV Data Migration Engine",
    migrationSub: "Import existing Excel Traffic Sheets and Client WIP files directly into the system.",
    uploadTrafficSheet: "Upload Traffic Sheet (.xlsx / .csv)",
    uploadWipSheet: "Upload Client WIP Sheet (.xlsx / .csv)",
    downloadSampleTraffic: "Download Traffic Sample CSV",
    downloadSampleWip: "Download WIP Sample CSV",
    dropFileHere: "Drag and drop your Excel or CSV file here, or click to browse",
    importSuccess: "Data imported successfully!"
  },
  ar: {
    appName: "راك فور كرييتف",
    appSubtitle: "إدارة المهام والتحكم بالمرور الإبداعي",
    navMyTasks: "مهامي الخاصة",
    navTasks: "مهام الوكالة",
    myTasks: "مهامي",
    allAgencyTasks: "جميع مهام الوكالة",
    navWorkload: "عبء العمل والضغط",
    navClientWip: "سجل العملاء WIP",
    navRecurrence: "المهام التكرارية",
    navEmployeeAnalytics: "سجل وإنتاجية الموظف",
    navExcelMigration: "استيراد ملفات الإكسيل",
    navEmails: "مركز الإيميلات والإشعارات",
    navSettings: "الفريق والإعدادات",
    
    roleAdmin: "مسؤول النظام (Admin)",
    roleManager: "مدير إبداعي (Manager)",
    roleEmployee: "عضو فريق (Employee)",
    currentUser: "المستخدم الحالي",
    switchRole: "تبديل صلاحية العرض",
    
    newTask: "مهمة جديدة",
    bulkTask: "تعيين جماعي",
    searchPlaceholder: "ابحث عن مهمة، موجز، عميل، أو موظف...",
    filterByClient: "العميل",
    filterByEmployee: "المسؤول",
    filterByStatus: "الحالة",
    filterByPriority: "الأولوية",
    filterByDate: "الفترة الزمنية",
    allClients: "جميع العملاء",
    allEmployees: "جميع أعضاء الفريق",
    allStatuses: "جميع الحالات",
    allPriorities: "جميع الأولويات",
    clearFilters: "إعادة ضبط الفلاتر",
    exportCsv: "تصدير CSV",
    importExcel: "استيراد إكسيل",
    save: "حفظ المهمة",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    viewDetails: "عرض التفاصيل",
    close: "إغلاق",
    
    statusNotStarted: "لم تبدأ",
    statusBriefed: "تم الإحاطة",
    statusInProgress: "قيد التنفيذ",
    statusCompleted: "مكتملة",
    statusDelayed: "متأخرة / متجاوزة",
    
    priorityNormal: "عادي",
    priorityHigh: "أولوية عالية",
    priorityUrgent: "عاجل",
    prioritySuperUrgent: "🔥 عاجل جداً (Super Urgent)",
    
    colTaskTitle: "المهمة / الموجز الإبداعي",
    colClient: "العميل",
    colAssignee: "المسؤول عن التنفيذ",
    colManager: "مدير المهمة",
    colStatus: "الحالة",
    colPriority: "الأولوية",
    colBriefDate: "تاريخ الموجز",
    colDueDate: "تاريخ الاستلام",
    colCompletedDate: "تاريخ الإكمال",
    colNotes: "ملاحظات وتفاصيل",
    colActions: "إجراءات",

    viewKanban: "لوحة كانبان",
    viewList: "جدول المهام",
    viewCalendar: "التقويم",

    overdueAlertTitle: "تنبيه المهام المتأخرة",
    overdueAlertMsg: "مهام تتطلب اتخاذ إجراء فورياً!",
    daysOverdue: "أيام تأخير",
    dueToday: "تسليم اليوم",
    dueTomorrow: "تسليم الغد",

    repeatType: "جدول التكرار",
    oneTime: "مهمة لمرة واحدة",
    weekly: "أسبوعي",
    monthly: "شهري",
    nextRunDate: "تاريخ التشغيل القادم",
    activeRules: "قواعد التكرار النشطة",
    addRule: "إضافة قاعدة تكرار",

    employeePerformance: "أداء الموظف وسجل الأنشطة التاريخي",
    selectEmployee: "اختر الموظف",
    timeframe: "النطاق الزمني",
    thisWeek: "هذا الأسبوع",
    lastMonth: "الشهر الماضي",
    last30Days: "آخر 30 يوم",
    customRange: "فترة مخصصة",
    completedTasks: "المهام المكتملة",
    onTimeRate: "نسبة التسليم في الموعد",
    avgTurnaround: "متوسط وقت التنفيذ",
    currentWorkload: "المهام الحالية النشطة",
    auditTrail: "سجل التدقيق والأنشطة التاريخي",

    clientWipSheet: "جدول WIP والربط بالعملاء",
    retainerType: "نوع العقد / الباقة",
    clientTier: "حجم الحساب / التصنيف",
    accountOwner: "مدير الحساب Responsibles",
    activeTasks: "المهام النشطة",
    addClient: "إضافة عميل",

    migrationTitle: "محرك استيراد وتصدير بيانات الإكسيل",
    migrationSub: "استورد شيتات الإكسيل القديمة (Traffic Sheet & WIP Sheet) بضغطة زرواحدة.",
    uploadTrafficSheet: "رفع شيت المهام Traffic Sheet (.xlsx / .csv)",
    uploadWipSheet: "رفع شيت العملاء WIP Sheet (.xlsx / .csv)",
    downloadSampleTraffic: "تحميل نموذج شيت المهام CSV",
    downloadSampleWip: "تحميل نموذج شيت العملاء CSV",
    dropFileHere: "اسحب وأسقط ملف الإكسيل أو CSV هنا، أو اضغط للاختيار",
    importSuccess: "تم استيراد البيانات بنجاح!"
  }
};
