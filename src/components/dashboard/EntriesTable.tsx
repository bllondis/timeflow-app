import { useState } from 'react';
import { Check, Pencil, X, Globe, Calendar as CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useAppContext, TimeEntry } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { deleteTimeEntry } from '@/services/timeflow';

interface EntriesTableProps {
  onAddEntry: () => void;
  onEditEntry: (entry: TimeEntry) => void;
}

const SourceIcon = ({ source }: { source: string }) => {
  const lower = source.toLowerCase();
  if (lower === 'figma') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <svg width="18" height="18" viewBox="0 0 38 57" fill="none" className="text-muted-foreground">
            <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="currentColor" fillOpacity="0.6"/>
            <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="currentColor" fillOpacity="0.4"/>
            <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="currentColor" fillOpacity="0.6"/>
            <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="currentColor" fillOpacity="0.5"/>
            <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="currentColor" fillOpacity="0.45"/>
          </svg>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">Figma</TooltipContent>
      </Tooltip>
    );
  }
  if (lower === 'calendar' || lower === 'google calendar') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <CalendarIcon className="h-[18px] w-[18px] text-muted-foreground/70" />
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">Calendar</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Globe className="h-[18px] w-[18px] text-muted-foreground/70" />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{source}</TooltipContent>
    </Tooltip>
  );
};

const ConfidenceTag = ({ entry }: { entry: TimeEntry }) => {
  if (entry.reviewStatus === 'edited') {
    return (
      <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-primary/10 text-primary">
        Edited
      </span>
    );
  }
  if (entry.reviewStatus === 'accepted' || entry.confidence === 'high' || entry.confidence === 'confirmed') {
    return (
      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
        entry.reviewStatus === 'accepted' || entry.confidence === 'confirmed'
          ? 'bg-tf-green/10 text-tf-green'
          : 'bg-tf-teal/10 text-tf-teal'
      }`}>
        {entry.reviewStatus === 'accepted' || entry.confidence === 'confirmed' ? 'Accepted' : 'High confidence'}
      </span>
    );
  }
  return (
    <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-tf-yellow/10 text-tf-yellow">
      Sent to review
    </span>
  );
};

const EntriesTable = ({ onAddEntry, onEditEntry }: EntriesTableProps) => {
  const navigate = useNavigate();
  const { entries, setEntries, dayStatus, setDayStatus, setShowAiBanner } = useAppContext();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const needsReview = entries.filter(e => e.confidence === 'low' && !e.confirmed).length;

  const totalMinutes = entries.reduce((acc, e) => {
    const match = e.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
    return acc;
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const handleConfirmDay = () => {
    if (needsReview > 0) {
      setDayStatus('reviewing');
      navigate('/review');
    } else {
      setDayStatus('submitted');
      setShowAiBanner(false);
      toast.success('Day confirmed & submitted', {
        description: `${hours}h ${mins}m logged across ${entries.length} entries.`,
        action: {
          label: 'Undo',
          onClick: () => setDayStatus('pending'),
        },
      });
    }
  };

  const handleDelete = async (id: number) => {
    const entry = entries.find(e => e.id === id);
    await deleteTimeEntry(id);
    setEntries(entries.filter(e => e.id !== id));
    toast.success('Entry removed', {
      action: {
        label: 'Undo',
        onClick: () => entry && setEntries([...entries, entry].sort((a, b) => a.id - b.id)),
      },
    });
  };

  const handleUnlock = () => {
    setDayStatus('pending');
    setShowAiBanner(true);
    toast.success('Timesheet unlocked for editing');
  };

  const handleReview = (entry: TimeEntry) => {
    navigate('/review', {
      state: {
        highlightEntryId: entry.id,
      },
    });
  };

  const entryNeedsReview = (entry: TimeEntry) =>
    entry.reviewStatus === 'needs_review' || (entry.confidence === 'low' && !entry.confirmed);

  const handleEntryOpen = (entry: TimeEntry) => {
    if (entryNeedsReview(entry)) {
      handleReview(entry);
      return;
    }

    onEditEntry(entry);
  };

  const isSubmitted = dayStatus === 'submitted';

  return (
    <div className={isSubmitted ? 'opacity-80' : ''}>
      {/* Table header */}
      <div className="grid grid-cols-[30px_1fr_130px_120px_60px_80px] gap-4 items-center px-6 py-3 border-b border-border">
        <div />
        <span className="text-[11px] uppercase text-muted-foreground/60 tracking-[0.06em] font-medium">Project / Task</span>
        <span className="text-[11px] uppercase text-muted-foreground/60 tracking-[0.06em] font-medium text-right">Duration</span>
        <span className="text-[11px] uppercase text-muted-foreground/60 tracking-[0.06em] font-medium text-center">Confidence</span>
        <span className="text-[11px] uppercase text-muted-foreground/60 tracking-[0.06em] font-medium text-center">Source</span>
        <div />
      </div>

      {/* Entries */}
      {entries.map(entry => {
        const isLowConfidence = entryNeedsReview(entry);
        return (
          <Tooltip key={entry.id}>
            <TooltipTrigger asChild>
              <div
                onMouseEnter={() => setHoveredRow(entry.id)}
                onMouseLeave={() => setHoveredRow(null)}
                onClick={() => handleEntryOpen(entry)}
                className={`group grid grid-cols-[30px_1fr_130px_120px_60px_80px] gap-4 items-center px-6 min-h-[64px] py-4 border-b border-border/30 transition-all duration-150 cursor-pointer ${
                  isLowConfidence ? 'bg-tf-yellow/[0.03]' : 'hover:bg-secondary/40'
                }`}
              >
                {/* Checkbox */}
                <div className="flex items-center justify-center">
                  {isLowConfidence ? (
                    <div className="h-5 w-5 rounded-md bg-tf-yellow flex items-center justify-center">
                      <span className="text-[11px] font-semibold text-foreground leading-none">!</span>
                    </div>
                  ) : (
                    <div className={`h-5 w-5 rounded-md flex items-center justify-center ${
                      isSubmitted ? 'bg-tf-green/15' : 'bg-foreground'
                    }`}>
                      <Check className={`h-3 w-3 ${isSubmitted ? 'text-tf-green' : 'text-primary-foreground'}`} />
                    </div>
                  )}
                </div>

                {/* Project / Task */}
                <div>
                  <p className="text-[14px] font-medium text-foreground">{entry.project}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    {entry.task} · {entry.timeRange}
                  </p>
                </div>

                {/* Duration */}
                <span className="text-[14px] font-semibold text-foreground text-right tabular-nums">{entry.duration}</span>

                {/* Confidence */}
                <div className="text-center">
                  <ConfidenceTag entry={isSubmitted && entry.confidence === 'low' ? { ...entry, confidence: 'confirmed', reviewStatus: 'accepted' } : entry} />
                </div>

                {/* Source */}
                <div className="flex items-center justify-center">
                  <SourceIcon source={entry.source} />
                </div>

                {/* Actions */}
                <div className={`flex items-center justify-end gap-1 transition-opacity duration-150 ${
                  hoveredRow === entry.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleEntryOpen(entry); }}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); void handleDelete(entry.id); }}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-tf-red"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              {isLowConfidence ? 'Review AI suggestion' : 'Edit entry'}
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-5">
        <div />
        <div className="flex items-center gap-2">
          {isSubmitted ? (
            <Button variant="outline" size="sm" onClick={handleUnlock}>
              🔒 Unlock for editing
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={onAddEntry}>
                + Add manually
              </Button>
              <Button size="sm" onClick={handleConfirmDay}>
                Confirm day →
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntriesTable;
