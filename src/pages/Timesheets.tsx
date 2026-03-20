import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ChevronRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { useCatchupDaysQuery } from '@/hooks/useTimeflowQueries';
import type { CatchupDay } from '@/types/timeflow';

const Timesheets = () => {
  const navigate = useNavigate();
  const [submittedDays, setSubmittedDays] = useState<string[]>([]);
  const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
  const { data: catchupDays = [] } = useCatchupDaysQuery();

  const handleSubmitDay = (dayLabel: string) => {
    const day = catchupDays.find(d => d.day === dayLabel);
    if (!day) return;
    // Navigate to review screen with this day's entries
    navigateToReview(day, undefined);
  };

  const handleConfirmAll = () => {
    setSubmittedDays(catchupDays.map(d => d.day));
    toast.success(`All ${catchupDays.length} days confirmed`);
  };

  const navigateToReview = (
    day: CatchupDay,
    highlightEntryId: number | undefined
  ) => {
    navigate('/review', {
      state: {
        source: 'timesheets',
        dayLabel: day.day,
        totalHours: day.hours,
        entries: day.entries.map(e => ({
          id: e.id,
          project: e.project,
          task: e.task,
          timeRange: '',
          duration: e.duration,
          confidence: e.confidence,
          source: 'AI',
          confirmed: e.confidence === 'high',
        })),
        highlightEntryId,
      },
    });
  };

  const handleEntryClick = (dayLabel: string, entryId: number) => {
    const day = catchupDays.find(d => d.day === dayLabel);
    if (!day) return;
    navigateToReview(day, entryId);
  };

  const pendingDays = catchupDays.filter(d => !submittedDays.includes(d.day));

  return (
    <div>
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-medium text-[36px] text-foreground tracking-tight">
            Catch up on missed days
          </h1>
          <p className="text-[13px] text-muted mt-1.5">
            We prepared drafts for Mon–Wed · review when ready
          </p>
        </div>
      </div>

      {/* AI banner */}
      <div className="relative overflow-hidden rounded-lg p-12 mb-10">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #E0F7FA, #90CAF9)' }} />
        
        {/* Decorative stars */}
        <div className="absolute pointer-events-none" style={{ right: 20, bottom: 15 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(255,255,255,0.2))' }}>
            <path d="M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9L12 1Z" fill="rgba(37, 99, 235, 0.35)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute pointer-events-none" style={{ right: 170, bottom: 12 }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(255,255,255,0.2))' }}>
            <path d="M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9L12 1Z" fill="rgba(37, 99, 235, 0.35)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute pointer-events-none" style={{ right: 50, bottom: 55 }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(255,255,255,0.2))' }}>
            <path d="M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9L12 1Z" fill="rgba(37, 99, 235, 0.35)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute pointer-events-none" style={{ right: 100, top: 12 }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(255,255,255,0.2))' }}>
            <path d="M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9L12 1Z" fill="rgba(37, 99, 235, 0.35)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.5" />
          </svg>
        </div>
        <div className="absolute pointer-events-none" style={{ right: 240, bottom: 20 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(255,255,255,0.2))' }}>
            <path d="M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9L12 1Z" fill="rgba(37, 99, 235, 0.35)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'rgba(37, 99, 235, 0.12)' }}>
            <Sparkles className="h-5 w-5" style={{ color: '#2563EB' }} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-semibold text-[18px]" style={{ color: '#1E3A5F' }}>
              AI reconstructed Mon–Wed from your activity
            </h3>
            <p className="text-[13px]" style={{ color: '#5B7FA4' }}>
              Based on your calendar events, browser activity, and app usage.
            </p>
          </div>
        </div>
      </div>

      {/* Days accordion */}
      <Accordion type="single" collapsible defaultValue="day-0" className="space-y-6">
        {catchupDays.map((day, idx) => {
          const isSubmitted = submittedDays.includes(day.day);
          const lowConfidence = day.entries.filter(e => e.confidence === 'low').length;

          return (
            <AccordionItem
              key={idx}
              value={`day-${idx}`}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-card"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-3">
                    {isSubmitted ? (
                      <div className="h-7 w-7 rounded-lg bg-tf-green/10 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-tf-green" />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-muted">{idx + 1}</span>
                      </div>
                    )}
                    <span className="font-medium text-[14px]">{day.day}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-tf-teal/10 text-tf-teal font-medium">
                      {day.hours}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted font-medium">
                      {day.entriesCount} entries
                    </span>
                    {lowConfidence > 0 && !isSubmitted && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-tf-yellow/10 text-tf-yellow font-medium">
                        {lowConfidence} to review
                      </span>
                    )}
                  </div>
                  {!isSubmitted && (
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubmitDay(day.day)}
                      >
                        Submit
                      </Button>
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-5">
                <div className="border-t border-border pt-3">
                  {day.entries.map(entry => {
                    const isLowConfidence = entry.confidence === 'low';
                    const isHovered = hoveredEntry === entry.id;

                    return (
                      <div
                        key={entry.id}
                        onClick={() => handleEntryClick(day.day, entry.id)}
                        onMouseEnter={() => setHoveredEntry(entry.id)}
                        onMouseLeave={() => setHoveredEntry(null)}
                        className={`group flex items-center justify-between py-4 border-b border-border/40 last:border-b-0 cursor-pointer transition-all duration-150 rounded-md -mx-2 px-2 ${
                          isLowConfidence
                            ? 'bg-tf-yellow/[0.03] hover:bg-tf-yellow/[0.06]'
                            : 'hover:bg-secondary/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isLowConfidence ? (
                            <div className="h-5 w-5 rounded-md bg-tf-yellow flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-foreground leading-none">!</span>
                            </div>
                          ) : (
                            <div className="h-5 w-5 rounded-md bg-foreground flex items-center justify-center shrink-0">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="text-[14px] font-medium">{entry.project}</p>
                            <p className="text-[12px] text-muted">{entry.task}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[14px] font-semibold tabular-nums">{entry.duration}</span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                            entry.confidence === 'high' ? 'bg-tf-teal/10 text-tf-teal' : 'bg-tf-yellow/10 text-tf-yellow'
                          }`}>
                            {entry.confidence === 'high' ? 'High confidence' : 'Needs review'}
                          </span>
                          <div className={`flex items-center gap-1 transition-opacity duration-150 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                          }`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleEntryClick(day.day, entry.id); }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-muted-foreground/40 transition-opacity duration-150 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                          }`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {pendingDays.length > 0 && (
        <div className="flex items-center justify-end mt-10">
          <Button onClick={handleConfirmAll}>
            Confirm all {pendingDays.length} days →
          </Button>
        </div>
      )}
    </div>
  );
};

export default Timesheets;
