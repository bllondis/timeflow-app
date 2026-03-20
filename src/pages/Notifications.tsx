import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/AppContext';

const tabConfig = [
  { id: 'all', label: 'All' },
  { id: 'primary', label: 'Primary' },
  { id: 'reminders', label: 'Reminders' },
  { id: 'approval', label: 'Approval' },
] as const;

type TabId = typeof tabConfig[number]['id'];

const typeToTab: Record<string, TabId> = {
  ai: 'primary',
  deadline: 'reminders',
  approved: 'approval',
  submitted: 'approval',
};

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAllNotificationsRead, markNotificationRead } = useAppContext();
  const [activeTab, setActiveTab] = useState<TabId>('all');

  const filtered = activeTab === 'all'
    ? notifications
    : notifications.filter(n => typeToTab[n.type] === activeTab);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-medium text-[36px] text-foreground tracking-tight">Notifications</h1>
        {notifications.some(n => n.unread) && (
          <Button
            size="sm"
            onClick={markAllNotificationsRead}
            className="text-[12px]"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Tabs — same style as Manager View */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="mb-6">
        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
          {tabConfig.map(tab => {
            const count = tab.id === 'all'
              ? notifications.length
              : notifications.filter(n => typeToTab[n.type] === tab.id).length;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-[13px] flex items-center gap-1.5"
              >
                {tab.label}
                {count > 0 && (
                  <span className="text-[11px] text-muted-foreground/60">{count}</span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 px-6 text-center">
            <div className="text-[28px] mb-2">🔔</div>
            <p className="type-body font-semibold text-foreground">You're all caught up</p>
            <p className="type-secondary">No new notifications</p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (notif.unread) markNotificationRead(notif.id);
                if (notif.action?.route) navigate(notif.action.route);
              }}
              className={`flex items-start gap-2.5 px-4 py-3.5 border-b border-border/30 cursor-pointer transition-colors hover:bg-secondary/30 ${
                notif.unread ? 'bg-primary/[0.02]' : 'bg-card'
              }`}
            >
              <div
                className="w-[7px] h-[7px] rounded-full flex-shrink-0 mt-[6px]"
                style={{ backgroundColor: notif.unread ? notif.dotColor : 'hsl(var(--border))' }}
              />
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[13px] flex-shrink-0"
                style={{ backgroundColor: notif.iconBg }}
              >
                {notif.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{notif.title}</p>
                <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{notif.body}</p>
                <p className="font-mono text-[9px] text-muted-foreground/60 mt-1">{notif.time} · {notif.date}</p>
                {notif.action && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(notif.action!.route); }}
                    className="font-mono text-[10px] text-primary hover:text-primary/80 mt-1.5 cursor-pointer"
                  >
                    {notif.action.label}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
