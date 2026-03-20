import { useNavigate } from 'react-router-dom';
import { Sparkles, AlertTriangle, Check, Radio, BrainCircuit, Download, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { motion } from 'framer-motion';

const signalSources = [
  { name: 'Google Calendar', icon: 'Cal', iconBg: 'bg-[hsl(217_89%_51%)]', status: 'Active · 4 events', active: true, barWidth: 100 },
  { name: 'Figma', icon: 'Fig', iconBg: 'bg-[hsl(0_0%_12%)]', status: 'Active · 3h 15m', active: true, barWidth: 85 },
  { name: 'Jira', icon: 'Jira', iconBg: 'bg-[hsl(214_100%_40%)]', status: 'Active · 6 tickets', active: true, barWidth: 60 },
  { name: 'GitHub', icon: 'GH', iconBg: 'bg-[hsl(210_12%_16%)]', status: 'Not connected', active: false, barWidth: 0 },
  { name: 'Browser', icon: '🌐', iconBg: 'bg-secondary border border-border', status: 'Not installed', active: false, barWidth: 0 },
];

const timelineItems = [
  { time: '09:14', dotColor: 'border-tf-green bg-tf-green/10', title: 'Figma · ACME Corp Design', sub: 'Homepage redesign session', duration: '3h 15m', warn: false },
  { time: '13:00', dotColor: 'border-tf-teal bg-tf-teal/10', title: 'Google Meet · Sprint planning', sub: 'Calendar event · Internal', duration: '1h 00m', warn: false },
  { time: '14:05', dotColor: 'border-tf-yellow bg-tf-yellow/10', title: 'Browser activity ⚠', sub: 'Notion + Loom · project unclear', duration: '2h 30m', warn: true },
  { time: '16:40', dotColor: 'border-primary bg-primary/10', title: 'Google Meet · Kick-off call', sub: 'Calendar event · ACME Corp', duration: '0h 45m', warn: false },
];

const suggestions = [
  { icon: 'GH', iconBg: 'bg-[hsl(210_12%_16%)]', title: 'Connect GitHub', sub: 'AI will recognize coding sessions and link them to Jira tickets automatically', boost: '+8% accuracy', primary: true },
  { icon: '🌐', iconBg: 'bg-secondary border border-border', title: 'Install Browser Extension', sub: "Resolve gaps like today's 2h 30m · AI identifies research vs meetings", boost: '+12% accuracy', primary: false },
];

const FloatingStar = ({ size, x, bottom }: { size: number; x: number; bottom: number }) => (
  <div className="absolute pointer-events-none" style={{ right: x, bottom }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(255,255,255,0.2))' }}>
      <path d="M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9L12 1Z" fill="rgba(37, 99, 235, 0.35)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.5" />
    </svg>
  </div>
);

const Insights = () => {
  const navigate = useNavigate();
  const { entries } = useAppContext();

  const totalMinutes = entries.reduce((acc, e) => {
    const match = e.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
    return acc;
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const activeSources = signalSources.filter(s => s.active).length;
  const score = 97;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-medium text-[36px] text-foreground tracking-tight">AI Insights</h1>
          <p className="text-[13px] text-muted mt-1.5">How AI reconstructs your day · updated daily at 17:00</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <History className="h-3.5 w-3.5" /> History
          </Button>
        </div>
      </div>

      {/* Accuracy Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-lg p-8 mb-6"
      >
        {/* Gradient background — same as AI Banner */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #E0F7FA, #90CAF9)' }} />

        <div className="relative z-10 flex items-center gap-10">
          {/* Score */}
          <div className="shrink-0 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'rgba(37, 99, 235, 0.12)' }}>
              <Sparkles className="h-6 w-6" style={{ color: '#2563EB' }} />
            </div>
            <div>
              <p className="font-semibold text-[48px] leading-none tracking-tight" style={{ color: '#1E3A5F' }}>{score}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-[2] min-w-0">
            <div className="flex justify-between text-[11px] mb-2" style={{ color: '#2563EB' }}>
              <span>Low</span><span>Medium</span><span>High</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #4DD0E1, #2563EB)' }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[13px] font-semibold mt-2" style={{ color: '#1E3A5F' }}>
              AI accuracy · today
            </p>
          </div>

          {/* Decorative stars */}
          <div className="shrink-0 relative w-[80px] h-[60px]">
            <FloatingStar size={18} x={0} bottom={40} />
            <FloatingStar size={14} x={50} bottom={5} />
            <FloatingStar size={10} x={15} bottom={15} />
            <FloatingStar size={16} x={60} bottom={45} />
          </div>
        </div>
      </motion.div>

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Signal Sources */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <Radio className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-[16px]">Signal sources</span>
            <span className="ml-auto text-[12px] px-2 py-0.5 rounded-md bg-tf-green/10 text-tf-green font-medium">{activeSources} active</span>
          </div>
          <div className="space-y-0">
            {signalSources.map(s => (
              <div key={s.name} className="flex items-center gap-3 py-3.5 border-b border-border/40 last:border-b-0">
                <div className={`w-7 h-7 rounded-[8px] ${s.iconBg} flex items-center justify-center text-primary-foreground text-[10px] shrink-0 font-medium`}>
                  {s.icon}
                </div>
                <span className="text-[14px] font-medium flex-1">{s.name}</span>
                <div className="w-[60px] h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.active ? (s.barWidth > 70 ? 'bg-tf-green' : 'bg-tf-teal') : ''}`}
                    style={{ width: `${s.barWidth}%` }}
                  />
                </div>
                <span className={`text-[12px] ${s.active ? 'text-tf-green' : 'text-muted'}`}>{s.status}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/settings/integrations')}
            className="mt-4 text-[13px] text-primary hover:underline font-medium"
          >
            + Connect more sources →
          </button>
        </div>

        {/* Reconstruction Timeline */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-[16px]">Today's reconstruction</span>
            <span className="ml-auto text-[12px] px-2 py-0.5 rounded-md bg-tf-teal/10 text-tf-teal font-medium">
              {hours}h {mins}m
            </span>
          </div>
          <div className="flex flex-col">
            {timelineItems.map((item, idx) => (
              <div key={item.time} className="grid grid-cols-[50px_12px_1fr] gap-2.5 items-start">
                <span className="text-[12px] text-muted text-right pt-0.5 tabular-nums">{item.time}</span>
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 shrink-0 ${item.dotColor}`} />
                  {idx < timelineItems.length - 1 && <div className="w-0.5 flex-1 bg-border min-h-[28px] mt-0.5" />}
                </div>
                <div className="pb-4">
                  <p className={`text-[14px] font-medium ${item.warn ? 'text-tf-yellow' : ''}`}>{item.title}</p>
                  <p className="text-[12px] text-muted">{item.sub}</p>
                  <p className={`text-[14px] font-semibold tabular-nums mt-0.5 ${item.warn ? 'text-tf-yellow' : 'text-foreground'}`}>{item.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gaps */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card mb-6">
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="h-4 w-4 text-tf-yellow" />
          <span className="font-medium text-[16px]">Gaps AI detected</span>
          <span className="ml-auto text-[12px] px-2 py-0.5 rounded-md bg-tf-yellow/10 text-tf-yellow font-medium">1 unresolved</span>
        </div>
        <div className="bg-tf-yellow/[0.04] border border-tf-yellow/15 rounded-[10px] p-4 flex items-center gap-3 mb-3">
          <AlertTriangle className="h-4 w-4 text-tf-yellow shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium text-tf-yellow">Today · 14:05–16:35 · 2h 30m unassigned</p>
            <p className="text-[12px] text-muted mt-0.5">Browser activity detected in Notion and Loom. Could not determine project.</p>
          </div>
          <button onClick={() => navigate('/review')} className="text-[13px] text-primary hover:underline shrink-0 font-medium">
            Review now →
          </button>
        </div>
        <p className="text-[13px] text-muted">No other gaps detected for today ✓</p>
      </div>

      {/* Suggestions */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-card">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-[16px]">Improve AI accuracy</span>
          <span className="ml-auto text-[12px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">2 suggestions</span>
        </div>
        <div className="space-y-3">
          {suggestions.map(s => (
            <div key={s.title} className="flex items-center gap-3 p-4 border border-border rounded-[10px] hover:bg-secondary/40 transition-colors duration-150">
              <div className={`w-8 h-8 rounded-[8px] ${s.iconBg} flex items-center justify-center text-primary-foreground text-[10px] shrink-0 font-medium`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium">{s.title}</p>
                <p className="text-[12px] text-muted mt-0.5">{s.sub}</p>
              </div>
              <span className="text-[12px] text-tf-teal shrink-0 font-medium">{s.boost}</span>
              <Button
                size="sm"
                variant={s.primary ? 'default' : 'outline'}
                className="shrink-0"
              >
                {s.primary ? 'Connect →' : 'Install →'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;
