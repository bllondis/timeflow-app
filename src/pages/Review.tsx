import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Sparkles, AlertTriangle, Columns2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppContext, TimeEntry } from '@/contexts/AppContext';
import { toast } from 'sonner';
import AIAccuracyIndicator from '@/components/AIAccuracyIndicator';

interface ReviewLocationState {
  source: 'timesheets';
  dayLabel: string;
  totalHours: string;
  entries: TimeEntry[];
  highlightEntryId?: number;
}

const Review = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { entries: globalEntries, setEntries: setGlobalEntries, setDayStatus, setShowAiBanner } = useAppContext();

  const locationState = location.state as ReviewLocationState | null;
  const isFromTimesheets = locationState?.source === 'timesheets';

  // Local entries state for catchup flow
  const [localEntries, setLocalEntries] = useState<TimeEntry[]>(
    isFromTimesheets ? locationState.entries : []
  );

  const entries = isFromTimesheets ? localEntries : globalEntries;
  const setEntries = isFromTimesheets ? setLocalEntries : setGlobalEntries;

  const dayLabel = isFromTimesheets ? locationState.dayLabel : 'Monday, 10 March';
  const backPath = isFromTimesheets ? '/timesheets' : '/';
  const backLabel = isFromTimesheets ? 'Back to Timesheets' : 'Back to Dashboard';

  // Scroll to highlighted entry
  const highlightId = locationState?.highlightEntryId;
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlightId && highlightRef.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightId]);

  const actionRequiredEntries = entries.filter(e => e.confidence === 'low' && !e.confirmed);
  const confirmedEntries = entries.filter(e => e.confidence !== 'low' || e.confirmed);

  const totalMinutes = entries.reduce((acc, e) => {
    const match = e.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
    return acc;
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const actionsRequired = actionRequiredEntries.length;
  const totalSteps = actionsRequired;
  const progressPercent = totalSteps === 0 ? 100 : ((entries.filter(e => e.confirmed).length) / entries.length) * 100;

  const handleApprove = (id: number, updates?: { project: string; task: string; duration: string }) => {
    setEntries(entries.map(e =>
      e.id === id ? { ...e, ...(updates || {}), confirmed: true, confidence: 'confirmed' as const } : e
    ));
    toast.success('Entry approved');
  };

  const handleDiscard = (id: number) => {
    setEntries(entries.filter(e => e.id !== id));
    toast.success('Entry discarded');
  };

  const handleSplit = (originalEntry: TimeEntry, entry1: { project: string; task: string; duration: string }, entry2: { project: string; task: string; duration: string }) => {
    const newEntries = entries.filter(e => e.id !== originalEntry.id);
    const splitEntry1: TimeEntry = { ...originalEntry, id: Date.now(), project: entry1.project, task: entry1.task, duration: entry1.duration, confidence: 'confirmed', confirmed: true };
    const splitEntry2: TimeEntry = { ...originalEntry, id: Date.now() + 1, project: entry2.project, task: entry2.task, duration: entry2.duration, confidence: 'confirmed', confirmed: true };
    setEntries([...newEntries, splitEntry1, splitEntry2].sort((a, b) => a.id - b.id));
    toast.success('Entry split into 2');
  };

  const canSubmit = actionsRequired === 0;

  const handleSubmitDay = () => {
    if (isFromTimesheets) {
      navigate('/timesheets');
      toast.success(`${dayLabel.split(',')[0]} submitted`, {
        description: `${hours}h ${mins}m logged across ${entries.length} entries.`,
      });
    } else {
      setDayStatus('submitted');
      setShowAiBanner(false);
      navigate('/');
      toast.success('Day confirmed & submitted', {
        description: `${hours}h ${mins}m logged across ${entries.length} entries.`,
      });
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate(backPath)}
        className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-150 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> {backLabel}
      </button>

      <div className="mb-6">
        <div>
          <h1 className="font-medium text-[36px] text-foreground tracking-tight">
            Review AI Suggestions
          </h1>
          <p className="text-[13px] text-muted mt-1.5">
            {dayLabel} · {entries.length} drafted entries
          </p>
        </div>
      </div>

      <div className="w-full h-1.5 bg-secondary rounded-full mb-10 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-6">
        {confirmedEntries.map(entry => (
          <div
            key={entry.id}
            ref={highlightId === entry.id ? highlightRef : undefined}
            className={highlightId === entry.id ? 'ring-2 ring-primary/40 rounded-lg' : ''}
          >
            <ConfirmedCard entry={entry} />
          </div>
        ))}
        {actionRequiredEntries.map(entry => (
          <div
            key={entry.id}
            ref={highlightId === entry.id ? highlightRef : undefined}
            className={highlightId === entry.id ? 'ring-2 ring-tf-yellow/60 rounded-lg' : ''}
          >
            <ActionRequiredCard
              entry={entry}
              onApprove={(updates) => handleApprove(entry.id, updates)}
              onDiscard={() => handleDiscard(entry.id)}
              onSplit={(e1, e2) => handleSplit(entry, e1, e2)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-10 pt-2">
        <Button
          onClick={handleSubmitDay}
          disabled={!canSubmit}
          size="sm"
          className={!canSubmit ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Submit Day →
        </Button>
      </div>
    </div>
  );
};

const ConfirmedCard = ({ entry }: { entry: TimeEntry }) => (
  <div className="bg-card border border-border rounded-lg px-6 py-5 flex items-center gap-4 shadow-card transition-all duration-150 hover:shadow-card-hover">
    <div className="flex items-center gap-3 shrink-0">
      <div className="h-7 w-7 rounded-lg bg-tf-green/10 flex items-center justify-center">
        <Check className="h-3.5 w-3.5 text-tf-green" />
      </div>
      <span className="text-[12px] text-muted w-[90px] tabular-nums">{entry.timeRange}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[14px] font-medium text-foreground truncate">{entry.project}</p>
      <p className="text-[12px] text-muted truncate">{entry.task}</p>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-[14px] font-semibold text-foreground tabular-nums">{entry.duration}</span>
      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted hover:text-foreground">
        <Pencil className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);

interface ActionRequiredCardProps {
  entry: TimeEntry;
  onApprove: (updates: { project: string; task: string; duration: string }) => void;
  onDiscard: () => void;
  onSplit: (e1: { project: string; task: string; duration: string }, e2: { project: string; task: string; duration: string }) => void;
}

const ActionRequiredCard = ({ entry, onApprove, onDiscard, onSplit }: ActionRequiredCardProps) => {
  const { projects } = useAppContext();
  const [project, setProject] = useState(entry.project);
  const [task, setTask] = useState(entry.task);
  const [duration, setDuration] = useState(entry.duration);
  const [splitOpen, setSplitOpen] = useState(false);

  return (
    <>
      <div className="border border-tf-yellow/20 rounded-lg bg-tf-yellow/[0.03] p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-tf-orange">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium text-[16px]">Action Required</span>
          </div>
          <span className="text-[12px] text-muted">{entry.timeRange}</span>
        </div>

        <div className="bg-card border border-border rounded-[10px] p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[14px] text-foreground leading-relaxed">
                Found <strong className="font-semibold">{duration}</strong> of continuous browser activity in{' '}
                <strong className="font-semibold">Notion</strong> and <strong className="font-semibold">Loom</strong>.
                Tentatively assigned to <strong className="font-semibold">{project.split(' · ')[0]}</strong>.
                Please confirm the project and task.
              </p>
              <AIAccuracyIndicator variant="compact" className="mt-2" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1fr_120px] gap-3 mb-5">
          <div>
            <label className="text-[11px] uppercase text-muted mb-1.5 block tracking-wider font-medium">Project</label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger className="bg-card text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p} value={p} className="text-[13px]">{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[11px] uppercase text-muted mb-1.5 block tracking-wider font-medium">Task</label>
            <Input value={task} onChange={e => setTask(e.target.value)} className="bg-card text-[13px]" />
          </div>
          <div>
            <label className="text-[11px] uppercase text-muted mb-1.5 block tracking-wider font-medium">Duration</label>
            <Input value={duration} onChange={e => setDuration(e.target.value)} className="bg-card text-[13px] tabular-nums" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => onApprove({ project, task, duration })} size="sm" className="gap-1.5">
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSplitOpen(true)} className="gap-1.5">
              <Columns2 className="h-3.5 w-3.5" /> Split entry
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onDiscard} className="text-tf-red hover:text-tf-red hover:bg-tf-red/5 gap-1.5">
            <Trash2 className="h-3.5 w-3.5" /> Discard
          </Button>
        </div>
      </div>

      <SplitEntryDialog open={splitOpen} onOpenChange={setSplitOpen} entry={entry} onSplit={onSplit} />
    </>
  );
};

interface SplitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: TimeEntry;
  onSplit: (e1: { project: string; task: string; duration: string }, e2: { project: string; task: string; duration: string }) => void;
}

const SplitEntryDialog = ({ open, onOpenChange, entry, onSplit }: SplitDialogProps) => {
  const { projects } = useAppContext();
  const [project1, setProject1] = useState(entry.project);
  const [task1, setTask1] = useState(entry.task);
  const [duration1, setDuration1] = useState('1h 15m');
  const [project2, setProject2] = useState(projects[0]);
  const [task2, setTask2] = useState('');
  const [duration2, setDuration2] = useState('1h 15m');

  const handleSplit = () => {
    onSplit(
      { project: project1, task: task1, duration: duration1 },
      { project: project2, task: task2, duration: duration2 }
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-lg shadow-modal">
        <DialogHeader>
          <DialogTitle className="font-medium text-[18px]">Split Entry</DialogTitle>
          <p className="text-[12px] text-muted">
            {entry.timeRange} · {entry.duration} total
          </p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <p className="text-[11px] uppercase text-muted tracking-wider font-medium">Entry 1</p>
            <Select value={project1} onValueChange={setProject1}>
              <SelectTrigger className="bg-card text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {projects.map(p => (<SelectItem key={p} value={p} className="text-[13px]">{p}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input value={task1} onChange={e => setTask1(e.target.value)} placeholder="Task" className="text-[13px]" />
            <Input value={duration1} onChange={e => setDuration1(e.target.value)} className="text-[13px] w-[120px] tabular-nums" />
          </div>

          <div className="border-t border-border" />

          <div className="space-y-2">
            <p className="text-[11px] uppercase text-muted tracking-wider font-medium">Entry 2</p>
            <Select value={project2} onValueChange={setProject2}>
              <SelectTrigger className="bg-card text-[13px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {projects.map(p => (<SelectItem key={p} value={p} className="text-[13px]">{p}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input value={task2} onChange={e => setTask2(e.target.value)} placeholder="Task" className="text-[13px]" />
            <Input value={duration2} onChange={e => setDuration2(e.target.value)} className="text-[13px] w-[120px] tabular-nums" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSplit}>Split & Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Review;
