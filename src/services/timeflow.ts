import {
  currentUser as mockCurrentUser,
  projects as mockProjects,
  weekData as mockWeekData,
  teamMembers as mockTeamMembers,
  deadline as mockDeadline,
  catchupDays as mockCatchupDays,
  initialEntries as mockEntries,
  initialNotifications as mockNotifications,
  initialApprovals as mockApprovals,
} from "@/data/mockData";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type {
  AppNotification,
  CatchupDay,
  CurrentUser,
  Deadline,
  GoogleCalendarEvent,
  IntegrationConnection,
  TeamMember,
  TimeEntry,
  TimesheetApproval,
  WeekData,
} from "@/types/timeflow";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const PROFILE_STORAGE_KEY = "timeflow-profile";
const GOOGLE_CALENDAR_PROVIDER = "google";
const GOOGLE_CALENDAR_REDIRECT_URI = "https://timeflow-assistant-main.vercel.app/auth/callback/google";
const DEADLINE_TIME_LABEL = "17:00";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getProfileStorageKey = (authUserId?: string | null) =>
  authUserId ? `${PROFILE_STORAGE_KEY}:${authUserId}` : PROFILE_STORAGE_KEY;

const useFallback = <T,>(fallback: T): T => clone(fallback);

const withFallback = async <T,>(
  loader: () => Promise<T>,
  fallback: T
): Promise<T> => {
  if (!hasSupabaseConfig || !supabase) {
    return useFallback(fallback);
  }

  try {
    return await loader();
  } catch (error) {
    console.warn("Supabase request failed, using mock fallback.", error);
    return useFallback(fallback);
  }
};

const mapCurrentUser = (row: any): CurrentUser => ({
  name: row.name,
  role: row.role,
  email: row.email,
  location: row.location,
  initials: row.initials,
  avatarUrl: row.avatar_url ?? row.avatarUrl ?? undefined,
});

const buildInitials = (name: string, fallback = mockCurrentUser.initials) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || fallback;
};

const getNameFromAuthUser = (user: User) => {
  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  if (metadataName?.trim()) {
    return metadataName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return mockCurrentUser.name;
};

const getAvatarUrlFromAuthUser = (user?: User | null) =>
  typeof user?.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url.trim().length > 0
    ? user.user_metadata.avatar_url
    : undefined;

const getCurrentWeekFriday = (currentDate = new Date()) => {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - mondayOffset);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  friday.setHours(0, 0, 0, 0);

  return friday;
};

const formatDeadlineDate = (targetDate: Date) => {
  const formattedDate = targetDate.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return `${formattedDate} · ${DEADLINE_TIME_LABEL}`;
};

const getDaysLeftUntil = (targetDate: Date, currentDate = new Date()) => {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  return Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / DAY_IN_MS));
};

const withDynamicDeadline = (deadline: Deadline): Deadline => {
  const friday = getCurrentWeekFriday();

  return {
    ...deadline,
    date: formatDeadlineDate(friday),
    daysLeft: getDaysLeftUntil(friday),
  };
};

const getStoredCurrentUser = (authUserId?: string | null): CurrentUser | null => {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(authUserId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistCurrentUser = (user: CurrentUser, authUserId?: string | null) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getProfileStorageKey(authUserId), JSON.stringify(user));
};

const mapTimeEntry = (row: any): TimeEntry => ({
  id: Number(row.id),
  project: row.project,
  task: row.task,
  timeRange: row.time_range ?? "",
  duration: row.duration,
  confidence: row.confidence ?? "high",
  source: row.source ?? "Manual",
  confirmed: Boolean(row.confirmed),
  aiReason: row.ai_reason ?? undefined,
  reviewStatus: row.review_status ?? undefined,
});

const mapNotification = (row: any): AppNotification => ({
  id: Number(row.id),
  unread: Boolean(row.unread),
  type: row.type,
  icon: row.icon,
  iconBg: row.icon_bg,
  dotColor: row.dot_color,
  title: row.title,
  body: row.body,
  time: row.time_label,
  date: row.date_label,
  action: row.action_label && row.action_route
    ? { label: row.action_label, route: row.action_route }
    : null,
});

const mapIntegrationConnection = (row: any): IntegrationConnection => ({
  provider: row.provider,
  connected: true,
  expiresAt: row.expires_at ?? null,
});

const getTodayCalendarRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
  };
};

const formatDurationMinutes = (minutes: number) => {
  const safeMinutes = Math.max(0, minutes);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return `${hours}h ${remainingMinutes.toString().padStart(2, "0")}m`;
};

const formatCalendarTime = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const mapGoogleCalendarEvent = (event: any): GoogleCalendarEvent => {
  const start = event.start?.dateTime ?? event.start?.date ?? null;
  const end = event.end?.dateTime ?? event.end?.date ?? null;

  return {
    id: String(event.id ?? crypto.randomUUID()),
    summary: typeof event.summary === "string" && event.summary.trim()
      ? event.summary.trim()
      : "Calendar event",
    start,
    end,
  };
};

export const mapGoogleCalendarEventToEntry = (
  event: GoogleCalendarEvent,
  index: number
): TimeEntry => {
  const startDate = event.start ? new Date(event.start) : null;
  const endDate = event.end ? new Date(event.end) : null;
  const durationMinutes =
    startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())
      ? Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000))
      : 0;

  return {
    id: -(index + 1),
    project: "Google Calendar",
    task: event.summary,
    timeRange: `${formatCalendarTime(event.start)}-${formatCalendarTime(event.end)}`.replace(/^-|-$/g, ""),
    duration: formatDurationMinutes(durationMinutes),
    confidence: "high",
    source: "Calendar",
    confirmed: false,
  };
};

const getGoogleCalendarRedirectUrl = () => {
  if (typeof window === "undefined") {
    return GOOGLE_CALENDAR_REDIRECT_URI;
  }

  return window.location.hostname === "localhost"
    ? `${window.location.origin}/auth/callback/google`
    : GOOGLE_CALENDAR_REDIRECT_URI;
};

export const getCurrentUser = async (): Promise<CurrentUser> =>
  withFallback(async () => {
    const { data, error } = await supabase!
      .from("profiles")
      .select("name, role, email, location, initials")
      .order("name", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    const user = data ? mapCurrentUser(data) : getStoredCurrentUser() ?? mockCurrentUser;
    persistCurrentUser(user);
    return user;
  }, getStoredCurrentUser() ?? mockCurrentUser);

export const ensureCurrentUserProfile = async (authUser: User): Promise<CurrentUser> => {
  const derivedName = getNameFromAuthUser(authUser);
  const avatarUrl = getAvatarUrlFromAuthUser(authUser);
  const seededProfile: CurrentUser = {
    name: derivedName,
    role: "",
    email: authUser.email ?? mockCurrentUser.email,
    location: "",
    initials: buildInitials(derivedName),
    avatarUrl,
  };

  if (!hasSupabaseConfig || !supabase) {
    persistCurrentUser(seededProfile, authUser.id);
    return seededProfile;
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("name, role, email, location, initials")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existingProfileError) {
    throw existingProfileError;
  }

  if (existingProfile) {
    const mappedProfile = mapCurrentUser(existingProfile);
    const nextProfile = {
      ...mappedProfile,
      avatarUrl: avatarUrl ?? mappedProfile.avatarUrl,
    };
    persistCurrentUser(nextProfile, authUser.id);
    return nextProfile;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: authUser.id,
      name: seededProfile.name,
      role: seededProfile.role,
      email: seededProfile.email,
      location: seededProfile.location,
      initials: seededProfile.initials,
    })
    .select("name, role, email, location, initials")
    .single();

  if (error) {
    throw error;
  }

  const nextProfile = {
    ...mapCurrentUser(data),
    avatarUrl,
  };
  persistCurrentUser(nextProfile, authUser.id);
  return nextProfile;
};

export const updateCurrentUser = async (
  updates: Pick<CurrentUser, "name" | "role" | "email" | "location">,
  authUserId?: string | null
): Promise<CurrentUser> => {
  const nextUser: CurrentUser = {
    ...(getStoredCurrentUser(authUserId) ?? mockCurrentUser),
    ...updates,
  };

  if (!hasSupabaseConfig || !supabase) {
    persistCurrentUser(nextUser, authUserId);
    return nextUser;
  }

  const profileQuery = supabase.from("profiles").select("id, role, initials");
  const { data: existingUser, error: existingUserError } = await (authUserId
    ? profileQuery.eq("id", authUserId).maybeSingle()
    : profileQuery.order("name", { ascending: true }).limit(1).maybeSingle());

  if (existingUserError) throw existingUserError;

  const initials = buildInitials(updates.name, existingUser?.initials || mockCurrentUser.initials);

  const payload = {
    id: authUserId ?? existingUser?.id,
    name: updates.name,
    email: updates.email,
    location: updates.location,
    role: updates.role || existingUser?.role || mockCurrentUser.role,
    initials,
  };

  const query = existingUser?.id
    ? supabase
        .from("profiles")
        .update(payload)
        .eq("id", existingUser.id)
    : supabase
        .from("profiles")
        .insert({
          id: payload.id,
          name: payload.name,
          role: payload.role,
          email: payload.email,
          location: payload.location,
          initials: payload.initials,
        });

  const { data, error } = await query
    .select("name, role, email, location, initials")
    .single();

  if (error) throw error;
  const savedUser = {
    ...mapCurrentUser(data),
    avatarUrl: nextUser.avatarUrl,
  };
  persistCurrentUser(savedUser, authUserId);
  return savedUser;
};

export const isCurrentUserProfileComplete = (user: CurrentUser) =>
  Boolean(user.name.trim() && user.email.trim() && user.role.trim() && user.location.trim());

export const getGoogleCalendarIntegration = async (
  authUserId?: string | null
): Promise<IntegrationConnection | null> =>
  withFallback(async () => {
    if (!authUserId) {
      return null;
    }

    const { data, error } = await supabase!
      .from("integrations")
      .select("provider, expires_at")
      .eq("user_id", authUserId)
      .eq("provider", GOOGLE_CALENDAR_PROVIDER)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapIntegrationConnection(data) : null;
  }, null);

export const connectGoogleCalendar = async () => {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getGoogleCalendarRedirectUrl(),
      scopes: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
        include_granted_scopes: "true",
      },
    },
  });

  if (error) {
    throw error;
  }
};

export const getGoogleCalendarEvents = async (authUserId?: string | null): Promise<GoogleCalendarEvent[]> => {
  if (!authUserId || !hasSupabaseConfig || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("user_id", authUserId)
      .eq("provider", GOOGLE_CALENDAR_PROVIDER)
      .maybeSingle();

    if (error || !data?.access_token) {
      return [];
    }

    const { timeMin, timeMax } = getTodayCalendarRange();
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];
    return items.map(mapGoogleCalendarEvent);
  } catch (error) {
    console.warn("Google Calendar request failed, using empty calendar events.", error);
    return [];
  }
};

export const disconnectGoogleCalendar = async (authUserId?: string | null) => {
  if (!authUserId) {
    return;
  }

  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("user_id", authUserId)
    .eq("provider", GOOGLE_CALENDAR_PROVIDER);

  if (error) {
    throw error;
  }
};

export const saveGoogleCalendarTokens = async (params: {
  authUserId: string;
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null;
}) => {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured");
  }

  const { authUserId, accessToken, refreshToken, expiresAt } = params;

  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: authUserId,
      provider: GOOGLE_CALENDAR_PROVIDER,
      access_token: accessToken,
      refresh_token: refreshToken ?? null,
      expires_at: expiresAt ?? null,
    },
    {
      onConflict: "user_id,provider",
    }
  );

  if (error) {
    throw error;
  }
};

export const completeGoogleCalendarOAuth = async () => {
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }

  if (typeof window === "undefined") {
    throw new Error("OAuth callback is only available in the browser");
  }

  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      throw error;
    }
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session?.user) {
    throw new Error("No authenticated user found after Google Calendar connect.");
  }

  if (!session.provider_token) {
    throw new Error("Google access token is missing. Check the Google provider scopes in Supabase.");
  }

  await saveGoogleCalendarTokens({
    authUserId: session.user.id,
    accessToken: session.provider_token,
    refreshToken: session.provider_refresh_token,
    expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
  });

  return session.user.id;
};

export const getCurrentUserByAuth = async (authUserId?: string | null): Promise<CurrentUser> =>
  withFallback(async () => {
    if (!authUserId) {
      const storedUser = getStoredCurrentUser();
      if (storedUser) {
        return storedUser;
      }

      return mockCurrentUser;
    }

    let authAvatarUrl: string | undefined;
    try {
      const { data: authData } = await supabase!.auth.getUser();
      if (authData.user?.id === authUserId) {
        authAvatarUrl = getAvatarUrlFromAuthUser(authData.user);
      }
    } catch (error) {
      console.warn("Failed to resolve auth user avatar.", error);
    }

    const { data, error } = await supabase!
      .from("profiles")
      .select("name, role, email, location, initials")
      .eq("id", authUserId)
      .maybeSingle();

    if (error) throw error;

    const fallbackUser = getStoredCurrentUser(authUserId) ?? mockCurrentUser;
    const mappedUser = data ? mapCurrentUser(data) : null;
    const user = mappedUser
      ? {
          ...mappedUser,
          avatarUrl: authAvatarUrl ?? mappedUser.avatarUrl,
        }
      : {
          ...fallbackUser,
          avatarUrl: authAvatarUrl ?? fallbackUser.avatarUrl,
        };
    persistCurrentUser(user, authUserId);
    return user;
  }, getStoredCurrentUser(authUserId) ?? mockCurrentUser);

export const getProjects = async (): Promise<string[]> =>
  withFallback(async () => {
    const { data, error } = await supabase!
      .from("projects")
      .select("name")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw error;
    return data.map((project) => project.name);
  }, mockProjects);

export const getWeekData = async (): Promise<WeekData> =>
  withFallback(async () => {
    const [{ data: summary, error: summaryError }, { data: days, error: daysError }] =
      await Promise.all([
        supabase!
          .from("weekly_summary")
          .select("week_number, label, range_label, expected_hours")
          .limit(1)
          .single(),
        supabase!
          .from("weekly_days")
          .select("day_label, hours, status, sort_order")
          .order("sort_order", { ascending: true }),
      ]);

    if (summaryError) throw summaryError;
    if (daysError) throw daysError;

    return {
      weekNumber: summary.week_number,
      label: summary.label,
      rangeLabel: summary.range_label,
      expectedHours: summary.expected_hours,
      days: days.map((day) => ({
        day: day.day_label,
        hours: Number(day.hours),
        status: day.status,
      })),
    };
  }, mockWeekData);

export const getTeamMembers = async (): Promise<TeamMember[]> =>
  withFallback(async () => {
    const { data, error } = await supabase!
      .from("team_members")
      .select("name, initials, days")
      .order("name", { ascending: true });

    if (error) throw error;

    return data.map((member) => ({
      name: member.name,
      initials: member.initials,
      days: Array.isArray(member.days) ? member.days.map(Number) : [],
    }));
  }, mockTeamMembers);

export const getDeadline = async (): Promise<Deadline> =>
  withFallback(async () => {
    const { data, error } = await supabase!
      .from("deadlines")
      .select("date_label, days_left, week_label, late_count")
      .limit(1)
      .single();

    if (error) throw error;

    return withDynamicDeadline({
      date: data.date_label,
      daysLeft: Number(data.days_left),
      weekLabel: data.week_label ?? "Week 10",
      lateCount: Number(data.late_count ?? 0),
    });
  }, withDynamicDeadline(mockDeadline));

export const getCatchupDays = async (): Promise<CatchupDay[]> =>
  withFallback(async () => {
    const [{ data: days, error: daysError }, { data: entries, error: entriesError }] =
      await Promise.all([
        supabase!
          .from("catchup_days")
          .select("id, day_label, hours_label, entries_count, sort_order")
          .order("sort_order", { ascending: true }),
        supabase!
          .from("catchup_entries")
          .select("id, catchup_day_id, project, task, duration, confidence, sort_order")
          .order("sort_order", { ascending: true }),
      ]);

    if (daysError) throw daysError;
    if (entriesError) throw entriesError;

    return days.map((day) => ({
      day: day.day_label,
      hours: day.hours_label,
      entriesCount: Number(day.entries_count),
      entries: entries
        .filter((entry) => entry.catchup_day_id === day.id)
        .map((entry) => ({
          id: Number(entry.id),
          project: entry.project,
          task: entry.task,
          duration: entry.duration,
          confidence: entry.confidence,
        })),
    }));
  }, mockCatchupDays);

export const getTimeEntries = async (): Promise<TimeEntry[]> =>
  withFallback(async () => {
    const { data, error } = await supabase!
      .from("time_entries")
      .select("id, project, task, time_range, duration, confidence, source, confirmed")
      .order("id", { ascending: true });

    if (error) throw error;
    return data.map(mapTimeEntry);
  }, mockEntries);

export const saveTimeEntry = async (entry: Omit<TimeEntry, "id"> & { id?: number }): Promise<TimeEntry> => {
  if (!hasSupabaseConfig || !supabase) {
    return {
      ...entry,
      id: entry.id ?? Date.now(),
    } as TimeEntry;
  }

  const payload = {
    id: entry.id,
    project: entry.project,
    task: entry.task,
    time_range: entry.timeRange,
    duration: entry.duration,
    confidence: entry.confidence,
    source: entry.source,
    confirmed: entry.confirmed,
    ai_reason: entry.aiReason,
    review_status: entry.reviewStatus,
  };

  const { data, error } = await supabase
    .from("time_entries")
    .upsert(payload)
    .select("id, project, task, time_range, duration, confidence, source, confirmed, ai_reason, review_status")
    .single();

  if (error) throw error;
  return mapTimeEntry(data);
};

export const deleteTimeEntry = async (id: number): Promise<void> => {
  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  const { error } = await supabase.from("time_entries").delete().eq("id", id);
  if (error) throw error;
};

export const getNotifications = async (): Promise<AppNotification[]> =>
  withFallback(async () => {
    const { data, error } = await supabase!
      .from("notifications")
      .select("id, unread, type, icon, icon_bg, dot_color, title, body, time_label, date_label, action_label, action_route")
      .order("id", { ascending: true });

    if (error) throw error;
    return data.map(mapNotification);
  }, mockNotifications);

export const markNotificationAsRead = async (id: number): Promise<void> => {
  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ unread: false })
    .eq("id", id);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  if (!hasSupabaseConfig || !supabase) {
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ unread: false })
    .eq("unread", true);

  if (error) throw error;
};

export const getTimesheetApprovals = async (): Promise<TimesheetApproval[]> =>
  withFallback(async () => {
    const { data, error } = await supabase!
      .from("timesheet_approvals")
      .select("id, name, initials, week_label, total_hours, entries_count, submitted_at_label, status")
      .order("id", { ascending: true });

    if (error) throw error;

    return data.map((item) => ({
      id: Number(item.id),
      name: item.name,
      initials: item.initials,
      week: item.week_label,
      totalHours: Number(item.total_hours),
      entries: Number(item.entries_count),
      submittedAt: item.submitted_at_label,
      status: item.status,
    }));
  }, mockApprovals);
