import type {
  AppNotification,
  CatchupDay,
  CurrentUser,
  Deadline,
  TeamMember,
  TimeEntry,
  TimesheetApproval,
  WeekData,
} from "@/types/timeflow";

export const currentUser: CurrentUser = {
  name: "Freja Lindström",
  role: "UX Designer",
  email: "freja@company.com",
  location: "Stockholm",
  initials: "FL",
};

export const projects: string[] = [
  "ACME Corp · Design",
  "Internal · Planning",
  "Beta Client · Research",
  "ACME Corp · Strategy",
];

export const weekData: WeekData = {
  weekNumber: 10,
  label: "Week 10",
  rangeLabel: "March 10 – 14, 2026",
  expectedHours: 40,
  days: [
    { day: "Mon", hours: 7.5, status: "pending" as const },
    { day: "Tue", hours: 8, status: "submitted" as const },
    { day: "Wed", hours: 8, status: "submitted" as const },
    { day: "Thu", hours: 7.5, status: "pending" as const },
    { day: "Fri", hours: 0, status: "future" as const },
  ],
};

export const teamMembers: TeamMember[] = [
  { name: "Freja Lindström", initials: "FL", days: [8, 7.5, 8, 0, 0] },
  { name: "Mykola Shevchenko", initials: "MY", days: [4, 8, 0, 0, 0] },
  { name: "Taras Bondarenko", initials: "TB", days: [8, 8, 7, 0, 0] },
  { name: "Anna Petrenko", initials: "AP", days: [7.5, 0, 0, 0, 0] },
  { name: "Ihor Kovalenko", initials: "IK", days: [8, 8, 8, 0, 0] },
];

export const deadline: Deadline = {
  date: "Fri 20 Mar · 17:00",
  daysLeft: 4,
  weekLabel: "Week 10",
  lateCount: 2,
};

export const catchupDays: CatchupDay[] = [
  {
    day: "Monday, 10 March",
    hours: "7h 30m",
    entriesCount: 4,
    entries: [
      { id: 10, project: "ACME Corp · Design", task: "Wireframe reviews", duration: "3h 00m", confidence: "high" as const },
      { id: 11, project: "Internal · Planning", task: "Daily standup", duration: "0h 30m", confidence: "high" as const },
      { id: 12, project: "Beta Client · Research", task: "User interviews", duration: "2h 30m", confidence: "low" as const },
      { id: 13, project: "ACME Corp · Strategy", task: "Design review", duration: "1h 30m", confidence: "high" as const },
    ],
  },
  {
    day: "Tuesday, 11 March",
    hours: "8h 00m",
    entriesCount: 3,
    entries: [
      { id: 14, project: "ACME Corp · Design", task: "Prototype iteration", duration: "4h 00m", confidence: "high" as const },
      { id: 15, project: "Internal · Planning", task: "Sprint retro", duration: "1h 00m", confidence: "high" as const },
      { id: 16, project: "Beta Client · Research", task: "Competitor analysis", duration: "3h 00m", confidence: "high" as const },
    ],
  },
  {
    day: "Wednesday, 12 March",
    hours: "6h 45m",
    entriesCount: 3,
    entries: [
      { id: 17, project: "ACME Corp · Design", task: "Design system updates", duration: "3h 45m", confidence: "high" as const },
      { id: 18, project: "Internal · Planning", task: "1:1 with manager", duration: "0h 30m", confidence: "high" as const },
      { id: 19, project: "Beta Client · Research", task: "Figma cleanup", duration: "2h 30m", confidence: "low" as const },
    ],
  },
];

export const initialEntries: TimeEntry[] = [
  { id: 1, project: "ACME Corp · Design", task: "Figma — Homepage redesign v3", timeRange: "09:14–12:29", duration: "3h 15m", confidence: "high", source: "Figma", confirmed: true, aiReason: "Matched a long focused Figma session to the ACME design workspace and file naming pattern.", reviewStatus: "accepted" },
  { id: 2, project: "Internal · Planning", task: "Sprint planning · Google Meet", timeRange: "13:00–14:00", duration: "1h 00m", confidence: "high", source: "Calendar", confirmed: true, aiReason: "Mapped directly from a calendar event title and meeting duration.", reviewStatus: "accepted" },
  { id: 3, project: "Beta Client · Research", task: "Browser activity · Notion + Loom", timeRange: "14:05–16:35", duration: "2h 30m", confidence: "low", source: "Browser", confirmed: false, aiReason: "Inferred from continuous browser activity in Notion and Loom, but the project match was less certain.", reviewStatus: "needs_review" },
  { id: 4, project: "ACME Corp · Strategy", task: "Kick-off call · Google Meet", timeRange: "16:40–17:25", duration: "0h 45m", confidence: "high", source: "Calendar", confirmed: true, aiReason: "Mapped from a calendar event with an ACME-related title and a precise meeting window.", reviewStatus: "accepted" },
];

export const initialNotifications: AppNotification[] = [
  {
    id: 1, unread: true, type: 'ai',
    icon: '✦', iconBg: '#EFF2FF', dotColor: '#1A3CFF',
    title: 'AI draft is ready',
    body: '7h 30m logged across 3 projects. 1 entry needs review.',
    time: '2 min ago', date: 'Today',
    action: { label: 'Review & Submit', route: '/review' }
  },
  {
    id: 2, unread: true, type: 'deadline',
    icon: '⚠', iconBg: '#FFF7ED', dotColor: '#FF5C1A',
    title: 'Deadline reminder',
    body: 'Week 10 timesheet due Fri 20 Mar · 4 days left.',
    time: '1 hour ago', date: 'Today',
    action: null
  },
  {
    id: 3, unread: true, type: 'approved',
    icon: '✓', iconBg: '#F0FDFB', dotColor: '#00BFA6',
    title: 'Timesheet approved',
    body: 'Week 9 approved by Taras B.',
    time: 'Yesterday', date: '17:45',
    action: null
  },
  {
    id: 4, unread: false, type: 'ai',
    icon: '✦', iconBg: '#F8FAFC', dotColor: '#E2E8F0',
    title: 'AI draft was ready',
    body: 'Week 9 · 38.5h across 4 projects.',
    time: 'Mon 16 Mar', date: '17:02',
    action: null
  },
  {
    id: 5, unread: false, type: 'submitted',
    icon: '✓', iconBg: '#F8FAFC', dotColor: '#E2E8F0',
    title: 'Timesheet submitted',
    body: 'Week 8 timesheet submitted successfully · 40h logged.',
    time: 'Fri 13 Mar', date: '16:58',
    action: null
  }
];

export const initialApprovals: TimesheetApproval[] = [
  { id: 1, name: 'Freja Lindström', initials: 'FL', week: 'Week 9 (Mar 3–7)', totalHours: 38.5, entries: 18, submittedAt: 'Fri 7 Mar, 16:42', status: 'pending' },
  { id: 2, name: 'Taras Bondarenko', initials: 'TB', week: 'Week 9 (Mar 3–7)', totalHours: 41, entries: 22, submittedAt: 'Fri 7 Mar, 17:10', status: 'pending' },
  { id: 3, name: 'Ihor Kovalenko', initials: 'IK', week: 'Week 9 (Mar 3–7)', totalHours: 39, entries: 19, submittedAt: 'Fri 7 Mar, 15:30', status: 'pending' },
];
