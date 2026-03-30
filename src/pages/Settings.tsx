import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Settings as SettingsIcon, Unplug } from 'lucide-react';
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  getGoogleCalendarIntegration,
  updateCurrentUser,
} from '@/services/timeflow';

interface Integration {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  description: string;
  connected: boolean;
  account?: string;
  badges?: { label: string; allowed: boolean }[];
}

interface CollectionToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  custom?: boolean;
}

const defaultIntegrations: Integration[] = [
  { id: 'gcal', name: 'Google Calendar', icon: 'Cal', iconBg: 'bg-[hsl(217_89%_51%)]', description: 'Event titles · duration · attendees count', connected: false, badges: [{ label: 'Event titles', allowed: true }, { label: 'Duration', allowed: true }, { label: 'Event content', allowed: false }, { label: 'Attendee names', allowed: false }] },
  { id: 'figma', name: 'Figma', icon: 'Fig', iconBg: 'bg-[hsl(0_0%_12%)]', description: 'Active files · session duration · project names', connected: true, account: '@olena_kovalenko', badges: [{ label: 'File names', allowed: true }, { label: 'Session time', allowed: true }, { label: 'File content', allowed: false }, { label: 'Screenshots', allowed: false }] },
  { id: 'jira', name: 'Jira', icon: 'Jira', iconBg: 'bg-[hsl(214_100%_40%)]', description: 'Tickets viewed · comments added · status changes', connected: true, account: 'olena@company.com', badges: [{ label: 'Ticket IDs', allowed: true }, { label: 'Time on ticket', allowed: true }, { label: 'Ticket content', allowed: false }, { label: 'Comments text', allowed: false }] },
  { id: 'github', name: 'GitHub', icon: 'GH', iconBg: 'bg-[hsl(210_12%_16%)]', description: 'Commits · PRs · code review activity', connected: false },
  { id: 'teams', name: 'Microsoft Teams', icon: 'MS', iconBg: 'bg-[hsl(248_53%_53%)]', description: 'Meetings · call duration · channel activity', connected: false },
  { id: 'slack', name: 'Slack', icon: 'Slk', iconBg: 'bg-[hsl(315_100%_15%)]', description: 'Active hours · channel context', connected: false },
  { id: 'browser', name: 'Browser Extension', icon: '🌐', iconBg: 'bg-secondary border border-border', description: 'Active tabs · domains · time per site', connected: false },
];

const defaultCollectionToggles: CollectionToggle[] = [
  { id: 'cal-titles', label: 'Calendar event titles', description: 'Meeting names used to suggest project tags', enabled: true },
  { id: 'figma-files', label: 'Figma file names', description: 'Used to identify which project you worked on', enabled: true },
  { id: 'jira-tickets', label: 'Jira ticket IDs', description: 'Ticket number only — no titles or descriptions', enabled: true },
  { id: 'browser-domains', label: 'Browser tab domains', description: 'Requires browser extension · domain only', enabled: false },
  { id: 'app-activity', label: 'App activity (macOS)', description: 'Which app is in focus and for how long', enabled: false },
];

const GOOGLE_CALENDAR_LOGO_URL =
  'https://ssl.gstatic.com/calendar/images/dynamiclogo_2020q4/calendar_31_2x.png';

const IntegrationIcon = ({ integration }: { integration: Integration }) => {
  if (integration.id === 'gcal') {
    return (
      <img
        src={GOOGLE_CALENDAR_LOGO_URL}
        alt="Google Calendar"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    );
  }

  return <>{integration.icon}</>;
};

export const SettingsIntegrations = () => {
  const { user } = useAuthContext();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;

    const loadGoogleStatus = async () => {
      if (!user?.id) {
        if (active) {
          setGoogleConnected(false);
          setIsGoogleLoading(false);
        }
        return;
      }

      try {
        const integration = await getGoogleCalendarIntegration(user.id);
        if (active) {
          setGoogleConnected(Boolean(integration?.connected));
        }
      } catch (error) {
        console.warn("Failed to load Google Calendar integration state.", error);
        if (active) {
          setGoogleConnected(false);
          toast({
            title: "Google Calendar connect failed",
            description:
              error instanceof Error
                ? error.message
                : "We could not finish the Google Calendar connection.",
            variant: "destructive",
          });
        }
      } finally {
        if (active) {
          setIsGoogleLoading(false);
          setIsGoogleConnecting(false);
        }
      }
    };

    void loadGoogleStatus();

    return () => {
      active = false;
    };
  }, [toast, user?.id]);

  const integrations = useMemo(
    () =>
      defaultIntegrations.map((integration) =>
        integration.id === "gcal"
          ? {
              ...integration,
              connected: googleConnected,
            }
          : integration
      ),
    [googleConnected]
  );

  const handleConnect = async (id: string) => {
    if (id === "gcal") {
      setIsGoogleConnecting(true);

      try {
        await connectGoogleCalendar();
      } catch (error) {
        console.error(error);
        toast({
          title: "Google Calendar connect failed",
          description: "Check Supabase Google provider config and allowed redirect URLs.",
          variant: "destructive",
        });
        setIsGoogleConnecting(false);
      }

      return;
    }

    toast({ title: 'Connected', description: 'Integration connected successfully.' });
  };

  const handleDisconnect = async (id: string) => {
    if (id === "gcal") {
      try {
        await disconnectGoogleCalendar(user?.id);
        setGoogleConnected(false);
        toast({ title: "Google Calendar disconnected", description: "Calendar sync has been turned off." });
      } catch (error) {
        console.error(error);
        toast({
          title: "Disconnect failed",
          description: "We could not remove the Google Calendar connection.",
          variant: "destructive",
        });
      }
      return;
    }

    const prev = integrations.find(i => i.id === id);
    toast({
      title: `${prev?.name} disconnected`,
      description: 'Undo within 4 seconds',
      action: <Button variant="outline" size="sm" className="text-[12px]">Undo</Button>,
    });
  };

  const connected = integrations.filter(i => i.connected);
  const available = integrations.filter(i => !i.connected);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-medium text-[36px] tracking-tight">Integrations</h1>
        <p className="text-[13px] text-muted mt-1">Connect data sources · AI uses only what you allow</p>
      </div>

      <div className="mb-10">
        <h3 className="font-medium text-[16px] mb-1">Connected sources</h3>
        <p className="text-[13px] text-muted mb-4">Active sources. AI uses signals from these tools</p>
        <div className="space-y-3">
          {connected.map(int => (
            <IntegrationCard key={int.id} integration={int} onDisconnect={handleDisconnect} />
          ))}
          {connected.length === 0 && <p className="text-[13px] text-muted py-4">No connected sources yet.</p>}
        </div>
      </div>

      <div className="h-px bg-border mb-10" />

      <div>
        <h3 className="font-medium text-[16px] mb-1">Available sources</h3>
        <p className="text-[13px] text-muted mb-4">Connect more sources for higher AI accuracy.</p>
        <div className="space-y-3">
          {available.map(int => (
            <div key={int.id} className="border border-border bg-card rounded-lg p-6 flex items-center gap-4 shadow-card">
              <div className={`w-9 h-9 rounded-[10px] ${int.iconBg} flex items-center justify-center text-primary-foreground text-[10px] shrink-0 font-medium overflow-hidden`}>
                <IntegrationIcon integration={int} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">{int.name}</p>
                <p className="text-[12px] text-muted">{int.description}</p>
              </div>
              {int.id === "gcal" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-[10px] px-4"
                  onClick={() => void handleConnect(int.id)}
                  disabled={isGoogleConnecting || isGoogleLoading}
                >
                  {isGoogleConnecting ? "Connecting..." : "Connect"}
                </Button>
              ) : (
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-[10px]" onClick={() => void handleConnect(int.id)} title="Connect">
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const IntegrationCard = ({ integration: int, onDisconnect }: { integration: Integration; onDisconnect: (id: string) => void }) => (
  <div className="border border-[hsl(205_85%_88%)] bg-[hsl(202_100%_98%)] rounded-lg p-6 flex items-start gap-4">
    <div className={`w-9 h-9 rounded-[10px] ${int.iconBg} flex items-center justify-center text-primary-foreground text-[10px] shrink-0 font-medium mt-0.5 overflow-hidden`}>
      <IntegrationIcon integration={int} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-medium">{int.name}</p>
      <p className="text-[12px] text-muted">{int.description}</p>
      {int.badges && (
        <div className="flex flex-wrap gap-1 mt-2">
          {int.badges.map(b => (
            <span key={b.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
              b.allowed ? 'bg-tf-green/10 text-tf-green' : 'bg-tf-red/10 text-tf-red'
            }`}>
              {b.allowed ? '✓' : '✗'} {b.label}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="flex items-center gap-1.5 shrink-0">
      <Button variant="outline" size="icon" className="h-10 w-10 rounded-[10px]" title="Configure">
        <SettingsIcon className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-[10px] text-destructive hover:text-destructive/80" onClick={() => onDisconnect(int.id)} title="Disconnect">
        <Unplug className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

export const SettingsPrivacy = () => {
  const [collectionToggles, setCollectionToggles] = useState<CollectionToggle[]>(defaultCollectionToggles);
  const [addingCustomSource, setAddingCustomSource] = useState(false);
  const [customSourceInput, setCustomSourceInput] = useState('');
  const [ignoredDomains, setIgnoredDomains] = useState(['gmail.com', 'youtube.com', 'twitter.com', 'linkedin.com']);
  const [addingDomain, setAddingDomain] = useState(false);
  const [domainInput, setDomainInput] = useState('');
  const [collectFrom, setCollectFrom] = useState('08:00');
  const [collectTo, setCollectTo] = useState('20:00');
  const [excludeWeekends, setExcludeWeekends] = useState(true);
  const [excludePrivate, setExcludePrivate] = useState(true);

  const toggleCollection = (id: string) => {
    setCollectionToggles(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const addCustomSource = () => {
    const name = customSourceInput.trim();
    if (!name) return;
    setCollectionToggles(prev => [...prev, { id: `custom-${Date.now()}`, label: name, description: 'Custom data source', enabled: false, custom: true }]);
    setCustomSourceInput('');
    setAddingCustomSource(false);
  };

  const removeCustomSource = (id: string) => {
    setCollectionToggles(prev => prev.filter(t => t.id !== id));
  };

  const addDomain = () => {
    const d = domainInput.trim();
    if (!d || ignoredDomains.includes(d)) return;
    setIgnoredDomains(prev => [...prev, d]);
    setDomainInput('');
    setAddingDomain(false);
  };

  const removeDomain = (domain: string) => {
    setIgnoredDomains(prev => prev.filter(d => d !== domain));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-medium text-[36px] tracking-tight">Data & Privacy</h1>
        <p className="text-[13px] text-muted mt-1">Control exactly what AI collects and when</p>
      </div>

      <div className="mb-10">
        <h3 className="font-medium text-[16px] mb-1">What AI collects</h3>
        <p className="text-[13px] text-muted mb-4">Toggle individual data types. Changes take effect on next sync.</p>
        <div className="border border-border bg-card rounded-lg px-6 shadow-card">
          {collectionToggles.map((t, idx) => (
            <div key={t.id} className={`flex items-center justify-between py-3.5 ${idx < collectionToggles.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">{t.label}</p>
                <p className="text-[12px] text-muted">{t.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch checked={t.enabled} onCheckedChange={() => toggleCollection(t.id)} className="data-[state=checked]:bg-tf-green" />
                {t.custom && (
                  <button onClick={() => removeCustomSource(t.id)} className="text-muted hover:text-tf-red transition-colors p-0.5">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {addingCustomSource ? (
            <div className="flex items-center gap-2 py-3.5 border-t border-border">
              <Input autoFocus value={customSourceInput} onChange={e => setCustomSourceInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomSource()} placeholder="App or data source name…" className="h-10 text-[13px] flex-1" />
              <Button size="sm" onClick={addCustomSource}>Add</Button>
              <button onClick={() => { setAddingCustomSource(false); setCustomSourceInput(''); }} className="text-muted hover:text-foreground transition-colors p-1"><X className="h-3.5 w-3.5" /></button>
            </div>
          ) : (
            <div className="py-3.5 border-t border-border">
              <button onClick={() => setAddingCustomSource(true)} className="border border-dashed border-border rounded-[10px] px-3 py-1.5 text-[12px] text-muted hover:text-foreground hover:border-foreground/40 transition-colors">
                <Plus className="h-3 w-3 inline mr-1 -mt-px" /> Add custom source
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-medium text-[16px] mb-1">Collection hours</h3>
        <p className="text-[13px] text-muted mb-4">AI only collects data within these hours.</p>
        <div className="border border-border bg-card rounded-lg p-6 shadow-card">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[14px] font-medium w-[100px]">Collect from</span>
            <Input value={collectFrom} onChange={e => setCollectFrom(e.target.value)} className="w-[70px] h-10 text-center text-[13px] tabular-nums" />
            <span className="text-[13px] text-muted">to</span>
            <Input value={collectTo} onChange={e => setCollectTo(e.target.value)} className="w-[70px] h-10 text-center text-[13px] tabular-nums" />
          </div>
          <div className="flex items-center justify-between py-3.5 border-t border-border">
            <div>
              <p className="text-[14px] font-medium">Exclude weekends</p>
              <p className="text-[12px] text-muted">Sat and Sun are never tracked</p>
            </div>
            <Switch checked={excludeWeekends} onCheckedChange={setExcludeWeekends} className="data-[state=checked]:bg-tf-green" />
          </div>
          <div className="flex items-center justify-between py-3.5 border-t border-border">
            <div>
              <p className="text-[14px] font-medium">Exclude private calendar events</p>
              <p className="text-[12px] text-muted">Events marked "private" are always ignored</p>
            </div>
            <Switch checked={excludePrivate} onCheckedChange={setExcludePrivate} className="data-[state=checked]:bg-tf-green" />
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-medium text-[16px] mb-1">Always ignore</h3>
        <p className="text-[13px] text-muted mb-4">Domains and apps that are never tracked.</p>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {ignoredDomains.map(d => (
            <span key={d} className="bg-card border border-border px-4 py-2 rounded-full text-[14px] text-muted-foreground flex items-center gap-2 font-medium">
              {d}
              <button onClick={() => removeDomain(d)} className="text-destructive hover:text-destructive/80 text-[13px] font-semibold">✕</button>
            </span>
          ))}
          {addingDomain ? (
            <span className="flex items-center gap-2">
              <Input autoFocus value={domainInput} onChange={e => setDomainInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addDomain()} placeholder="domain.com" className="h-10 w-[160px] text-[14px] rounded-full" />
              <Button size="sm" onClick={addDomain} className="rounded-full">Add</Button>
              <button onClick={() => { setAddingDomain(false); setDomainInput(''); }} className="text-muted hover:text-foreground p-0.5"><X className="h-4 w-4" /></button>
            </span>
          ) : (
            <button onClick={() => setAddingDomain(true)} className="border border-dashed border-border rounded-[10px] px-5 py-2.5 text-[14px] text-muted hover:text-foreground hover:border-foreground/40 transition-colors bg-card">
              +&nbsp;&nbsp;Add domain or app
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-border mb-10" />

      <div className="mb-10">
        <h3 className="font-medium text-[16px] mb-1">Your data</h3>
        <p className="text-[13px] text-muted mb-4">Raw signals are deleted after 30 days.</p>

        <div className="border border-border bg-card rounded-lg p-6 mb-3 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] font-medium">Raw activity signals</p>
            <Button variant="outline" size="sm">Export</Button>
          </div>
          <p className="text-[13px] text-muted">Calendar events, Figma sessions, Jira activity. Auto-deleted after 30 days.</p>
        </div>
        <div className="border border-border bg-card rounded-lg p-6 mb-4 shadow-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] font-medium">Submitted timesheets</p>
            <Button variant="outline" size="sm">Export all</Button>
          </div>
          <p className="text-[13px] text-muted">Your confirmed and submitted time entries.</p>
        </div>
        <Button variant="destructive" size="sm">Delete all my raw data</Button>
      </div>
    </div>
  );
};

export const SettingsProfile = () => {
  const { currentUser, setCurrentUser } = useAppContext();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [email, setEmail] = useState(currentUser.email);
  const [location, setLocation] = useState(currentUser.location);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFullName(currentUser.name);
    setRole(currentUser.role);
    setEmail(currentUser.email);
    setLocation(currentUser.location);
  }, [currentUser]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const savedUser = await updateCurrentUser({
        name: fullName.trim(),
        role: role.trim(),
        email: email.trim(),
        location: location.trim(),
      }, user?.id);

      setCurrentUser(savedUser);
      toast({
        title: 'Profile updated',
        description: 'Your profile changes were saved.',
      });
    } catch (error) {
      toast({
        title: 'Could not save profile',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
  <div>
    <div className="mb-8">
      <h1 className="font-medium text-[36px] tracking-tight">Profile</h1>
      <p className="text-[13px] text-muted mt-1">Manage your account details</p>
    </div>

    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-xl font-semibold">
          {currentUser.initials}
        </div>
        <div>
          <p className="text-[16px] font-medium">{currentUser.name}</p>
          <p className="text-[13px] text-muted">{currentUser.role} · {currentUser.location}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted font-medium">Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted font-medium">Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted font-medium">Profession</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label className="text-[11px] uppercase tracking-wider text-muted font-medium">Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <Button
        className="mt-6"
        onClick={handleSave}
        disabled={isSaving || !fullName.trim() || !role.trim() || !email.trim() || !location.trim()}
      >
        {isSaving ? 'Saving...' : 'Save changes'}
      </Button>
    </div>
  </div>
);
};

export const SettingsNotifications = () => {
  const [dailyReminders, setDailyReminders] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [weeklyEmail, setWeeklyEmail] = useState(false);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-medium text-[36px] tracking-tight">Notifications</h1>
        <p className="text-[13px] text-muted mt-1">Choose how and when you get notified</p>
      </div>

      <div className="border border-border bg-card rounded-lg px-6 shadow-card">
        {[
          { label: 'Daily reminders', desc: 'Get notified to log your time each day', checked: dailyReminders, onChange: setDailyReminders },
          { label: 'AI suggestions ready', desc: 'Notification when AI draft is ready', checked: aiSuggestions, onChange: setAiSuggestions },
          { label: 'Weekly summary emails', desc: 'Receive a weekly summary of logged time', checked: weeklyEmail, onChange: setWeeklyEmail },
          { label: 'Deadline alerts', desc: 'Reminder before submission deadline', checked: deadlineAlerts, onChange: setDeadlineAlerts },
        ].map((item, idx, arr) => (
          <div key={item.label} className={`flex items-center justify-between py-3.5 ${idx < arr.length - 1 ? 'border-b border-border' : ''}`}>
            <div>
              <p className="text-[14px] font-medium">{item.label}</p>
              <p className="text-[12px] text-muted">{item.desc}</p>
            </div>
            <Switch checked={item.checked} onCheckedChange={item.onChange} className="data-[state=checked]:bg-tf-green" />
          </div>
        ))}
      </div>
    </div>
  );
};

const Settings = () => null;
export default Settings;
