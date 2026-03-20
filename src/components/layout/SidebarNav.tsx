import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import { useAppContext } from '@/contexts/AppContext';
import { useAuthContext } from '@/contexts/AuthContext';
import { Clock, CalendarDays, FileText, Settings as SettingsIcon, Users, BarChart3, AlertTriangle, Plug, Shield, User, Bell, Sparkles, ChevronDown, LogOut } from 'lucide-react';
import userAvatar from '@/assets/user-avatar.jpg';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

const SidebarNav = () => {
  const { role, setRole, dayStatus, unreadCount, currentUser, deadline, entries } = useAppContext();
  const { signOut } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const totalHours = entries.reduce((acc, entry) => {
    const match = entry.duration.match(/(\d+)h\s*(\d+)m/);
    if (!match) return acc;
    return acc + Number(match[1]) + Number(match[2]) / 60;
  }, 0);

  const switchRole = (newRole: 'employee' | 'manager') => {
    setRole(newRole);
    navigate(newRole === 'manager' ? '/manager' : '/');
    setPopoverOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setPopoverOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItem = (to: string, label: string, icon: React.ReactNode, badge?: React.ReactNode) => (
    <NavLink
      to={to}
      end
      className={`flex items-center gap-2.5 px-3 py-[9px] mx-3 text-[13px] rounded-[10px] transition-all duration-150 ${
        isActive(to)
          ? 'bg-card font-medium text-foreground shadow-float'
          : 'text-muted hover:text-foreground hover:bg-card/60'
      }`}
      activeClassName=""
    >
      {icon}
      <span className="flex-1">{label}</span>
      {badge}
    </NavLink>
  );

  const countBadge = (n: number, alert = false) => (
    <span className={`text-[11px] min-w-[18px] text-center px-1.5 py-0.5 rounded-md font-medium ${
      alert ? 'bg-tf-orange/10 text-tf-orange' : 'bg-primary/10 text-primary'
    }`}>{n}</span>
  );
  const statusBadge = (label: string, variant: 'done' | 'pending') => (
    <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
      variant === 'done' ? 'bg-tf-green/10 text-tf-green' : 'bg-secondary text-muted'
    }`}>{label}</span>
  );
  const metricLabel = (text: string) => (
    <span className="text-[11px] text-muted font-medium">{text}</span>
  );

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-[240px] bg-background border-r border-border/60 flex flex-col z-40">
      {/* User block with role switcher */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors duration-120 cursor-pointer border-b border-border/60 text-left">
            <img src={userAvatar} alt={currentUser.name} className="h-[30px] w-[30px] rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold leading-tight text-foreground">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`h-1.5 w-1.5 rounded-full ${role === 'employee' ? 'bg-tf-green' : 'bg-primary'}`} />
                <span className="text-[10px] font-mono text-muted">{role === 'employee' ? 'Employee' : 'Manager'} view</span>
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-muted flex-shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" side="bottom" className="w-[220px] p-0 rounded-[10px] shadow-modal" sideOffset={4}>
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-border/40">
            <p className="text-[13px] font-semibold text-foreground">{currentUser.name}</p>
            <p className="text-[10px] font-mono text-muted">{currentUser.email}</p>
          </div>
          {/* Role options */}
          <div className="py-1">
            <div className={`flex items-center gap-2 px-3.5 py-2 text-[13px] ${role === 'employee' ? 'text-tf-green font-medium' : 'text-foreground hover:bg-secondary/50 cursor-pointer'}`}
              onClick={() => role !== 'employee' && switchRole('employee')}>
              <span className={`h-1.5 w-1.5 rounded-full ${role === 'employee' ? 'bg-tf-green' : 'bg-muted'}`} />
              {role === 'employee' ? 'Employee view' : 'Switch to Employee view'}
            </div>
            <div className={`flex items-center gap-2 px-3.5 py-2 text-[13px] ${role === 'manager' ? 'text-primary font-medium' : 'text-foreground hover:bg-secondary/50 cursor-pointer'}`}
              onClick={() => role !== 'manager' && switchRole('manager')}>
              <span className={`h-1.5 w-1.5 rounded-full ${role === 'manager' ? 'bg-primary' : 'bg-muted'}`} />
              {role === 'manager' ? 'Manager view' : 'Switch to Manager view'}
            </div>
          </div>
          <div className="h-px bg-border/40" />
          {/* Account actions */}
          <div className="py-1">
            <button onClick={() => { navigate('/settings/integrations'); setPopoverOpen(false); }}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-foreground hover:bg-secondary/50 transition-colors">
              <SettingsIcon className="h-3.5 w-3.5 text-muted" /> Settings
            </button>
            <button
              onClick={() => void handleSignOut()}
              className="w-full flex items-center gap-2 px-3.5 py-2 text-[13px] text-destructive hover:bg-destructive/5 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        <p className="text-[11px] uppercase tracking-wider text-muted font-medium px-6 pt-4 pb-2">Main</p>
        {navItem('/', 'Today', <Clock className="h-4 w-4" />,
          dayStatus === 'submitted' ? statusBadge('Done', 'done') : statusBadge('Pending', 'pending')
        )}
        {navItem('/week', 'This week', <CalendarDays className="h-4 w-4" />, metricLabel(`${totalHours.toFixed(1)}h`))}
        {navItem('/timesheets', 'Timesheets', <FileText className="h-4 w-4" />, countBadge(2, true))}
        {navItem('/insights', 'AI Insights', <Sparkles className="h-4 w-4" />,
          <span className="text-[11px] px-1.5 py-0.5 rounded-md font-medium bg-primary/10 text-primary">97%</span>
        )}
        {navItem('/notifications', 'Notifications', <Bell className="h-4 w-4" />,
          unreadCount > 0 ? (
            <span className="text-[9px] min-w-[18px] text-center px-1.5 py-0.5 rounded-full font-mono font-medium bg-primary/10 text-primary">{unreadCount}</span>
          ) : undefined
        )}

        {role === 'manager' && <div className="h-px bg-border/60 mx-5 my-3" />}

        {role === 'manager' && (
          <>
            <p className="text-[11px] uppercase tracking-wider text-muted font-medium px-6 pt-4 pb-2">Team</p>
            {navItem('/manager', 'Team view', <Users className="h-4 w-4" />, countBadge(2, true))}
            {navItem('/approvals', 'Approvals', <FileText className="h-4 w-4" />, countBadge(3, true))}
            {navItem('/reports', 'Reports', <BarChart3 className="h-4 w-4" />)}
          </>
        )}

        <div className="h-px bg-border/60 mx-5 my-3" />

        <p className="text-[11px] uppercase tracking-wider text-muted font-medium px-6 pt-4 pb-2">Settings</p>
        {navItem('/settings/integrations', 'Integrations', <Plug className="h-4 w-4" />)}
        {navItem('/settings/privacy', 'Data & Privacy', <Shield className="h-4 w-4" />)}
        {navItem('/settings/profile', 'Profile', <User className="h-4 w-4" />)}
        {navItem('/settings/notifications', 'Notifications', <Bell className="h-4 w-4" />)}
      </nav>

      {/* Deadline widget */}
      <div className="mx-4 mb-4 p-3.5 rounded-[10px] bg-card border border-border/60">
        <p className={`text-[11px] uppercase font-medium flex items-center gap-1 ${
          role === 'manager' || deadline.daysLeft <= 1 ? 'text-tf-red' : 'text-tf-orange'
        }`}>
          <AlertTriangle className="h-3 w-3" />
          {role === 'manager' ? 'DEADLINE SOON' : 'DEADLINE'}
        </p>
        <p className="text-[14px] font-semibold mt-1.5">{deadline.date.split(' · ')[0]}</p>
        <p className="text-[12px] text-muted mt-0.5">
          {role === 'manager' ? (
            <span className="text-muted">{deadline.lateCount} team members late</span>
          ) : (
            <>{deadline.daysLeft} days left · {deadline.weekLabel}</>
          )}
        </p>
      </div>
    </aside>
  );
};

export default SidebarNav;
