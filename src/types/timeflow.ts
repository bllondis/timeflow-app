export interface CurrentUser {
  name: string;
  role: string;
  email: string;
  location: string;
  initials: string;
  avatarUrl?: string;
}

export interface TimeEntry {
  id: number;
  project: string;
  task: string;
  timeRange: string;
  duration: string;
  confidence: "high" | "low" | "confirmed";
  source: string;
  confirmed: boolean;
  aiReason?: string;
  reviewStatus?: "accepted" | "edited" | "needs_review";
}

export interface AppNotification {
  id: number;
  unread: boolean;
  type: string;
  icon: string;
  iconBg: string;
  dotColor: string;
  title: string;
  body: string;
  time: string;
  date: string;
  action: { label: string; route: string } | null;
}

export interface WeekDay {
  day: string;
  hours: number;
  status: "pending" | "submitted" | "future";
}

export interface WeekData {
  weekNumber: number;
  label: string;
  rangeLabel: string;
  expectedHours: number;
  days: WeekDay[];
}

export interface TeamMember {
  name: string;
  initials: string;
  days: number[];
}

export interface Deadline {
  date: string;
  daysLeft: number;
  weekLabel: string;
  lateCount: number;
}

export interface CatchupEntry {
  id: number;
  project: string;
  task: string;
  duration: string;
  confidence: "high" | "low";
}

export interface CatchupDay {
  day: string;
  hours: string;
  entriesCount: number;
  entries: CatchupEntry[];
}

export interface TimesheetApproval {
  id: number;
  name: string;
  initials: string;
  week: string;
  totalHours: number;
  entries: number;
  submittedAt: string;
  status: "pending" | "approved" | "revision";
}

export interface IntegrationConnection {
  provider: string;
  connected: boolean;
  expiresAt: string | null;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
}
