import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, CalendarIcon, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { TimeEntry, useAppContext } from '@/contexts/AppContext';

interface AddEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editEntry?: TimeEntry | null;
  onSave: (entry: Omit<TimeEntry, 'id'> & { id?: number }) => void;
}

const quickDurations = [
  { label: '30m', hours: 0, mins: 30 },
  { label: '1h', hours: 1, mins: 0 },
  { label: '1h 30m', hours: 1, mins: 30 },
  { label: '2h', hours: 2, mins: 0 },
  { label: '3h', hours: 3, mins: 0 },
  { label: '4h', hours: 4, mins: 0 },
];

const getAiReviewCopy = (entry: TimeEntry) => {
  if (entry.aiReason) {
    return {
      title: 'Why AI suggested this',
      description: entry.aiReason,
    };
  }

  if (entry.source.toLowerCase() === 'calendar') {
    return {
      title: 'AI matched a calendar event',
      description: 'We detected this block from your calendar and turned it into a suggested time entry. You can edit the project, task, or duration before keeping it confirmed.',
    };
  }

  if (entry.source.toLowerCase() === 'figma') {
    return {
      title: 'AI matched focused design work',
      description: 'We picked up a focused work session from Figma activity and suggested this entry for review. Adjust the wording or time if you want a more accurate final record.',
    };
  }

  if (entry.source.toLowerCase() === 'browser') {
    return {
      title: 'AI inferred this from browser activity',
      description: 'This suggestion came from continuous browser activity, so it is a little more interpretive. If you are not happy with it, send it back to review and refine the details.',
    };
  }

  return {
    title: 'AI suggested this entry',
    description: 'This time entry was generated from an activity signal and can still be adjusted before final submission.',
  };
};

const AddEntryDialog = ({ open, onOpenChange, editEntry, onSave }: AddEntryDialogProps) => {
  const { projects } = useAppContext();
  const [project, setProject] = useState('');
  const [hours, setHours] = useState('0');
  const [mins, setMins] = useState('0');
  const [note, setNote] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [activeDuration, setActiveDuration] = useState<string | null>(null);
  const [markForReview, setMarkForReview] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setProject(editEntry.project);
      const match = editEntry.duration.match(/(\d+)h\s*(\d+)m/);
      if (match) { setHours(match[1]); setMins(match[2]); }
      setNote(editEntry.task);
      setMarkForReview(editEntry.confidence === 'low' && !editEntry.confirmed);
    } else {
      setProject(''); setHours('0'); setMins('0'); setNote('');
      setMarkForReview(false);
    }
  }, [editEntry, open]);

  const handleQuickDuration = (d: typeof quickDurations[0]) => {
    setHours(d.hours.toString());
    setMins(d.mins.toString());
    setActiveDuration(d.label);
  };

  const handleSave = () => {
    const now = new Date();
    const fieldsChanged = Boolean(
      editEntry && (
        editEntry.project !== project ||
        editEntry.task !== (note || 'Manual entry') ||
        editEntry.duration !== `${hours}h ${mins.padStart(2, '0')}m`
      )
    );
    const nextConfirmed = editEntry ? !markForReview : true;
    const nextConfidence = editEntry
      ? markForReview
        ? 'low' as const
        : 'confirmed' as const
      : 'high' as const;
    const entry = {
      id: editEntry?.id,
      project,
      task: note || 'Manual entry',
      timeRange: editEntry?.timeRange ?? `${format(now, 'HH:mm')}–${format(now, 'HH:mm')}`,
      duration: `${hours}h ${mins.padStart(2, '0')}m`,
      confidence: nextConfidence,
      source: editEntry?.source ?? 'Manual',
      confirmed: nextConfirmed,
      aiReason: editEntry?.aiReason,
      reviewStatus: editEntry
        ? markForReview
          ? 'needs_review' as const
          : fieldsChanged
            ? 'edited' as const
            : 'accepted' as const
        : 'accepted' as const,
    };
    onSave(entry);
    onOpenChange(false);
  };

  const aiReviewCopy = editEntry ? getAiReviewCopy(editEntry) : null;
  const statusLabel = markForReview
    ? 'Sent back to review'
    : editEntry?.reviewStatus === 'edited'
      ? 'Edited'
      : editEntry?.reviewStatus === 'accepted' || editEntry?.confirmed || editEntry?.confidence === 'confirmed'
        ? 'Accepted'
        : 'AI suggestion';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-lg shadow-modal">
        <DialogHeader>
          <DialogTitle className="font-medium text-[18px]">
            {editEntry ? 'Review entry' : 'Add time entry'}
          </DialogTitle>
          <p className="text-[12px] text-muted">{format(date, 'EEEE, d MMMM yyyy')}</p>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {editEntry && aiReviewCopy && (
            <div className="rounded-[12px] border border-border bg-secondary/30 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-9 w-9 rounded-[10px] flex items-center justify-center ${
                    markForReview ? 'bg-tf-yellow/10 text-tf-yellow' : 'bg-primary/10 text-primary'
                  }`}>
                    {markForReview ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-[14px] font-medium text-foreground">{aiReviewCopy.title}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                        markForReview
                          ? 'bg-tf-yellow/10 text-tf-yellow'
                          : editEntry?.reviewStatus === 'edited'
                            ? 'bg-primary/10 text-primary'
                          : 'bg-tf-teal/10 text-tf-teal'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted leading-relaxed">{aiReviewCopy.description}</p>
                    <p className="text-[12px] text-muted mt-2">
                      Source: <span className="text-foreground font-medium">{editEntry.source}</span>
                      {editEntry.timeRange ? <> · Signal window: <span className="text-foreground font-medium">{editEntry.timeRange}</span></> : null}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMarkForReview((prev) => !prev)}
                  className="shrink-0"
                >
                  {markForReview ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" /> Mark accepted
                    </>
                  ) : (
                    'Send back to review'
                  )}
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] uppercase text-muted mb-1.5 block tracking-wider font-medium">Project *</label>
            <Select value={project} onValueChange={setProject}>
              <SelectTrigger><SelectValue placeholder="Select project..." /></SelectTrigger>
              <SelectContent>
                {projects.map(p => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[11px] uppercase text-muted mb-1.5 block tracking-wider font-medium">Duration *</label>
            <div className="flex gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Input type="number" min={0} max={23} value={hours} onChange={e => { setHours(e.target.value); setActiveDuration(null); }} className="w-16 text-center tabular-nums" />
                <span className="text-[13px] text-muted">h</span>
              </div>
              <div className="flex items-center gap-1">
                <Input type="number" min={0} max={59} value={mins} onChange={e => { setMins(e.target.value); setActiveDuration(null); }} className="w-16 text-center tabular-nums" />
                <span className="text-[13px] text-muted">m</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickDurations.map(d => (
                <button
                  key={d.label}
                  onClick={() => handleQuickDuration(d)}
                  className={cn(
                    'px-3 py-1 text-[12px] rounded-[8px] border transition-all duration-150',
                    activeDuration === d.label
                      ? 'bg-foreground text-primary-foreground border-foreground'
                      : 'bg-card text-foreground border-border hover:bg-secondary'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase text-muted mb-1.5 block tracking-wider font-medium">Note (optional)</label>
            <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What were you working on?" rows={3} className="resize-none" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">{format(date, 'EEEE, d MMM yyyy')}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-[13px] text-primary">Change</Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-[10px]" align="end">
                <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={!project || (hours === '0' && mins === '0')}>
            {editEntry ? 'Save review' : 'Save entry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddEntryDialog;
