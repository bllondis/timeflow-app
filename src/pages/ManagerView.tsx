import { useState } from 'react';
import { Download, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaterBubble from '@/components/dashboard/WaterBubble';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { useDeadlineQuery, useTeamMembersQuery } from '@/hooks/useTimeflowQueries';

const dayHeaders = ['Mon 7', 'Tue 8', 'Wed 9', 'Thu 10', 'Fri 11', 'Sat 12', 'Sun 13'];

const ManagerView = () => {
  const [tab, setTab] = useState('heatmap');
  const { data: teamMembers = [] } = useTeamMembersQuery();
  const { data: deadline } = useDeadlineQuery();

  const submitted = teamMembers.filter(m => m.days.slice(0, 3).every(d => d >= 7)).length;
  const pending = teamMembers.length - submitted;
  const totalHours = teamMembers.reduce((acc, m) => acc + m.days.reduce((a, b) => a + b, 0), 0);

  const handleSendReminder = (name: string) => {
    toast.success(`Reminder sent to ${name} ✓`);
  };

  const handleApproveAll = () => {
    toast.success('All ready timesheets approved');
  };

  const getExtendedDays = (days: number[]) => [...days, 0, 0];

  const getCellType = (hours: number, dayIndex: number): 'full' | 'partial' | 'missing' | 'today' | 'future' => {
    if (dayIndex >= 4) return 'future';
    if (dayIndex === 3) return 'today';
    if (hours === 0) return 'missing';
    if (hours >= 7) return 'full';
    return 'partial';
  };

  const cellStyles: Record<string, string> = {
    full: 'text-[#2a6a5a] font-semibold',
    partial: 'text-[#3a6a8a] font-medium',
    missing: 'text-[#a05030] font-semibold',
    today: 'bg-[#E8ECF8] text-[#62719A] font-medium',
    future: 'bg-[#F8FAFC]',
  };

  const cellGradients: Record<string, string | undefined> = {
    full: 'linear-gradient(135deg, #B2EBF2, #DCEDC8)',
    partial: 'linear-gradient(135deg, #E0F7FA, #E3F2FD)',
    missing: 'linear-gradient(135deg, #FFCCBC, #FFE0B2)',
  };

  const needsAttention = [
    { name: 'Anna P.', fullName: 'Anna Petrenko', initials: 'AP', issue: '3 days missing', detail: `Tue–Thu not logged · deadline in ${deadline?.daysLeft ?? 0} days`, severity: 'high' as const },
    { name: 'Mykola S.', fullName: 'Mykola Shevchenko', initials: 'MY', issue: 'partial Mon + gaps', detail: 'Wed–Thu missing · 4h partial on Mon', severity: 'medium' as const },
  ];

  const getMissingDays = (days: number[]) => days.slice(0, 3).filter(d => d === 0).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-medium text-[36px] text-foreground tracking-tight">
            Team Timesheets — Week 10
          </h1>
          <p className="text-[13px] text-muted mt-1.5">
            {teamMembers.length} members · Deadline: {deadline?.date ?? 'Fri 17:00'} · {deadline?.daysLeft ?? 0} days left
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button onClick={handleApproveAll} size="sm">
            Approve all ready →
          </Button>
        </div>
      </div>

      {/* Stats — Bold KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {/* M1 — Team submitted */}
        <div className="rounded-[14px] p-6 min-h-[140px] flex items-center justify-between gap-4 bg-card border border-border">
          <div className="flex flex-col gap-1.5">
            <span className="type-kpi-label">Team submitted</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[36px] font-semibold text-foreground">{submitted}</span>
              <span className="text-[18px] font-medium" style={{ color: '#6B6661' }}>/{teamMembers.length}</span>
            </div>
            <span className="text-[12px] text-muted-foreground">{Math.round((submitted / teamMembers.length) * 100)}% of team this week</span>
          </div>
          <WaterBubble percentage={Math.round((submitted / teamMembers.length) * 100)} gradientColors={['#C8E6C9', '#DCEDC8']} bgColor="rgba(0,0,0,.04)" size={76} />
        </div>

        {/* M2 — Needs attention */}
        <div className="rounded-[14px] p-6 min-h-[140px] flex items-center justify-between gap-4 bg-card border border-border">
          <div className="flex flex-col gap-1.5">
            <span className="type-kpi-label">Needs attention</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[36px] font-semibold text-tf-orange">{pending}</span>
            </div>
            <span className="text-[12px] text-tf-orange">members haven't submitted</span>
          </div>
          <WaterBubble percentage={Math.round((pending / teamMembers.length) * 100)} gradientColors={['#FFCCBC', '#FFE0B2']} bgColor="rgba(0,0,0,.04)" size={76} textColor="#C44A14" animationDelay={-0.8} />
        </div>

        {/* M3 — Total hours logged */}
        <div className="rounded-[14px] p-6 min-h-[140px] flex items-center justify-between gap-4 bg-card border border-border">
          <div className="flex flex-col gap-1.5">
            <span className="type-kpi-label">Total hours logged</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[36px] font-semibold text-foreground">{totalHours}</span>
              <span className="text-[18px] font-medium" style={{ color: '#6B6661' }}>h</span>
            </div>
            <span className="text-[12px] text-muted-foreground">of ~200h expected</span>
          </div>
          <WaterBubble percentage={Math.min(Math.round((totalHours / 200) * 100), 100)} gradientColors={['#BBDEFB', '#B3E5FC']} bgColor="rgba(0,0,0,.04)" size={76} animationDelay={-1.6} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mb-10">
        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-0">
          <TabsTrigger value="heatmap" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-[13px]">
            Heatmap
          </TabsTrigger>
          <TabsTrigger value="list" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-[13px]">
            List view
          </TabsTrigger>
          <TabsTrigger value="attention" className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2.5 text-[13px] flex items-center gap-1.5">
            Needs attention
            <span className="bg-tf-orange/10 text-tf-orange px-1.5 py-0.5 rounded-md text-[11px] font-medium">
              {needsAttention.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="mt-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: '140px repeat(7, 1fr)' }}>
              <div />
              {dayHeaders.map(day => (
                <div key={day} className="text-center text-[11px] text-muted py-2 uppercase tracking-wider font-medium">{day}</div>
              ))}
              {teamMembers.map(member => {
                const extDays = getExtendedDays(member.days);
                return (
                  <div key={member.name} className="contents">
                    <div className="flex items-center gap-2 min-h-[40px] pr-2">
                      <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-semibold shrink-0">
                        {member.initials}
                      </div>
                      <span className="text-[12px] font-medium truncate">
                        {member.name.split(' ')[0]} {member.name.split(' ')[1][0]}.
                      </span>
                    </div>
                    {extDays.map((hours, i) => {
                      const cellType = getCellType(hours, i);
                      const isMissing = cellType === 'missing';
                      const missingCount = getMissingDays(member.days);

                      const gradient = cellGradients[cellType];
                      const cell = (
                        <div
                          className={`min-h-[40px] rounded-[8px] flex items-center justify-center text-[11px] transition-all duration-150 ${cellStyles[cellType]} ${isMissing ? 'cursor-pointer hover:opacity-80' : ''}`}
                          style={gradient ? { background: gradient } : undefined}
                        >
                          {cellType === 'future' ? '' : cellType === 'today' ? '–' : `${hours}h`}
                        </div>
                      );

                      if (isMissing) {
                        return (
                          <Popover key={i}>
                            <PopoverTrigger asChild>{cell}</PopoverTrigger>
                            <PopoverContent className="w-[220px] p-4 rounded-[10px]" side="top" align="center">
                              <p className="text-[14px] font-medium mb-1">{member.name}</p>
                              <p className="text-[12px] text-muted mb-3">{missingCount} day{missingCount !== 1 ? 's' : ''} not logged</p>
                              <Button onClick={() => handleSendReminder(member.name.split(' ')[0])} className="w-full" size="sm">
                                <Send className="h-3 w-3 mr-1.5" /> Send reminder
                              </Button>
                            </PopoverContent>
                          </Popover>
                        );
                      }
                      return <div key={i}>{cell}</div>;
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border">
              {[
                { gradient: 'linear-gradient(135deg, #B2EBF2, #DCEDC8)', label: 'Full day' },
                { gradient: 'linear-gradient(135deg, #E0F7FA, #E3F2FD)', label: 'Partial' },
                { gradient: 'linear-gradient(135deg, #FFCCBC, #FFE0B2)', label: 'Missing' },
                { className: 'bg-[#E8ECF8]', label: 'Today' },
                { className: 'bg-[#F8FAFC]', label: 'Future' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className={`h-3.5 w-5 rounded-[4px] ${'className' in item ? item.className : ''}`}
                    style={'gradient' in item ? { background: item.gradient } : undefined}
                  />
                  <span className="text-[11px] text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="font-medium text-[18px] mb-5 text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted" /> Needs attention
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {needsAttention.map(person => (
                <div key={person.fullName} className={`rounded-lg p-6 border ${
                  person.severity === 'high' ? 'bg-tf-red/[0.03] border-tf-red/15' : 'bg-tf-yellow/[0.03] border-tf-yellow/15'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-medium text-foreground">{person.name} — {person.issue}</p>
                      <p className="text-[12px] text-muted mt-0.5">{person.detail}</p>
                    </div>
                    <Button onClick={() => handleSendReminder(person.fullName)} variant="outline" size="sm" className="shrink-0 ml-3">
                      Send reminder
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="bg-card border border-border rounded-lg shadow-card">
            {teamMembers.map((member, idx) => {
              const memberTotal = member.days.reduce((a, b) => a + b, 0);
              const status = member.days.slice(0, 3).every(d => d >= 7) ? 'submitted' : 'pending';
              return (
                <div key={member.name} className={`flex items-center justify-between p-5 ${idx < teamMembers.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-[11px] font-semibold">{member.initials}</div>
                    <div>
                      <p className="text-[14px] font-medium">{member.name}</p>
                      <p className="text-[12px] text-muted">{memberTotal}h this week</p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                    status === 'submitted' ? 'bg-tf-green/10 text-tf-green' : 'bg-tf-orange/10 text-tf-orange'
                  }`}>{status}</span>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="attention" className="mt-6">
          <div className="space-y-4">
            {needsAttention.map(person => (
              <div key={person.fullName} className={`rounded-lg p-6 border ${
                person.severity === 'high' ? 'bg-tf-red/[0.03] border-tf-red/15' : 'bg-tf-yellow/[0.03] border-tf-yellow/15'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-[12px] font-semibold">{person.initials}</div>
                    <div>
                      <p className="text-[16px] font-medium">{person.fullName}</p>
                      <p className={`text-[14px] flex items-center gap-1 ${person.severity === 'high' ? 'text-tf-orange' : 'text-tf-yellow'}`}>
                        <AlertTriangle className="h-3.5 w-3.5" /> {person.issue}
                      </p>
                      <p className="text-[12px] text-muted mt-0.5">{person.detail}</p>
                    </div>
                  </div>
                  <Button onClick={() => handleSendReminder(person.fullName)} variant="outline" size="sm">
                    <Send className="h-3 w-3 mr-1.5" /> Send reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerView;
