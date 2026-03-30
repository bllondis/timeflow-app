import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  currentUser as fallbackCurrentUser,
  deadline as fallbackDeadline,
  initialEntries,
  initialNotifications,
  projects as fallbackProjects,
} from '@/data/mockData';
import {
  getCurrentUserByAuth,
  getDeadline,
  getGoogleCalendarEvents,
  getNotifications,
  getProjects,
  getTimeEntries,
  mapGoogleCalendarEventToEntry,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  updateCurrentUser,
} from '@/services/timeflow';
import type { AppNotification, CurrentUser, Deadline, TimeEntry } from '@/types/timeflow';
import { useAuthContext } from '@/contexts/AuthContext';

export type Role = 'employee' | 'manager';
export type DayStatus = 'pending' | 'reviewing' | 'submitted';
const ROLE_STORAGE_KEY = 'timeflow-role';

const getRoleStorageKey = (authUserId?: string | null) =>
  authUserId ? `${ROLE_STORAGE_KEY}:${authUserId}` : ROLE_STORAGE_KEY;

interface AppState {
  hydrated: boolean;
  role: Role;
  setRole: (r: Role) => void;
  dayStatus: DayStatus;
  setDayStatus: (s: DayStatus) => void;
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  deadline: Deadline;
  projects: string[];
  entries: TimeEntry[];
  setEntries: (e: TimeEntry[]) => void;
  showAiBanner: boolean;
  setShowAiBanner: (b: boolean) => void;
  notifications: AppNotification[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuthContext();
  const [role, setRoleState] = useState<Role>('employee');
  const [dayStatus, setDayStatus] = useState<DayStatus>('pending');
  const [currentUser, setCurrentUser] = useState<CurrentUser>(fallbackCurrentUser);
  const [deadline, setDeadline] = useState<Deadline>(fallbackDeadline);
  const [projects, setProjects] = useState<string[]>(fallbackProjects);
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
  const [showAiBanner, setShowAiBanner] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedRole = window.localStorage.getItem(getRoleStorageKey(user?.id));
    setRoleState(storedRole === 'manager' ? 'manager' : 'employee');
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) {
      setHydrated(false);
      return;
    }

    let active = true;

    const hydrate = async () => {
      try {
        const [latestUser, due, projectOptions, latestEntries, latestNotifications] = await Promise.all([
          getCurrentUserByAuth(user?.id),
          getDeadline(),
          getProjects(),
          getTimeEntries(),
          getNotifications(),
        ]);

        const calendarEvents = await getGoogleCalendarEvents(user?.id);
        const calendarEntries = calendarEvents.map(mapGoogleCalendarEventToEntry);

        if (!active) return;

        setCurrentUser(latestUser);
        setDeadline(due);
        setProjects(projectOptions);
        setEntries([...latestEntries, ...calendarEntries]);
        setNotifications(latestNotifications);
      } catch (error) {
        console.error("Failed to hydrate app context.", error);
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, [authLoading, user?.id]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const setRole = (nextRole: Role) => {
    setRoleState(nextRole);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(getRoleStorageKey(user?.id), nextRole);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    void markAllNotificationsAsRead();
  };

  const markNotificationRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    void markNotificationAsRead(id);
  };

  return (
    <AppContext.Provider value={{
      hydrated,
      role, setRole, dayStatus, setDayStatus, currentUser, deadline, projects, entries, setEntries,
      setCurrentUser,
      showAiBanner, setShowAiBanner,
      notifications, unreadCount, markAllNotificationsRead, markNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export type { AppNotification as Notification, TimeEntry };
