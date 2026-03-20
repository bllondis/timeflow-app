import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';

const SubmittedBanner = () => {
  const { setDayStatus, entries } = useAppContext();

  const totalMinutes = entries.reduce((acc, e) => {
    const match = e.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
    return acc;
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const projectCount = new Set(entries.map(e => e.project.split(' · ')[0])).size;

  const handleUndo = () => {
    setDayStatus('pending');
  };

  return (
    <div className="border border-tf-green/15 rounded-lg bg-tf-green/[0.03] p-6 mb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-tf-green/10 flex items-center justify-center">
            <Check className="h-4 w-4 text-tf-green" />
          </div>
          <div>
            <h3 className="font-medium text-[16px] text-tf-green">
              Day confirmed & submitted
            </h3>
            <p className="text-[13px] text-muted">
              {hours}h {mins}m logged across {projectCount} projects.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleUndo}>
          Undo submission
        </Button>
      </div>
    </div>
  );
};

export default SubmittedBanner;
