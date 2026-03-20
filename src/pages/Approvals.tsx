import { useEffect, useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTimesheetApprovalsQuery } from '@/hooks/useTimeflowQueries';
import type { TimesheetApproval } from '@/types/timeflow';

const Approvals = () => {
  const { data: fetchedApprovals = [] } = useTimesheetApprovalsQuery();
  const [approvals, setApprovals] = useState<TimesheetApproval[]>(fetchedApprovals);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [revisionNote, setRevisionNote] = useState('');

  useEffect(() => {
    setApprovals(fetchedApprovals);
  }, [fetchedApprovals]);

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  const handleApprove = (id: number) => {
    const item = approvals.find(a => a.id === id);
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'approved' as const } : a));
    setExpandedId(null);
    toast.success(`${item?.name}'s timesheet approved`, {
      action: { label: 'Undo', onClick: () => setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'pending' as const } : a)) },
    });
  };

  const handleRevision = (id: number) => {
    const item = approvals.find(a => a.id === id);
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'revision' as const } : a));
    setExpandedId(null);
    setRevisionNote('');
    toast.success(`Revision requested from ${item?.name}`, { description: revisionNote || 'No note added.' });
  };

  const handleApproveAll = () => {
    setApprovals(approvals.map(a => a.status === 'pending' ? { ...a, status: 'approved' as const } : a));
    toast.success(`${pendingCount} timesheets approved`);
  };

  const statusTag = (status: TimesheetApproval['status']) => {
    const styles = {
      pending: 'bg-tf-orange/10 text-tf-orange',
      approved: 'bg-tf-green/10 text-tf-green',
      revision: 'bg-tf-yellow/10 text-tf-yellow',
    };
    const labels = { pending: 'Pending', approved: 'Approved', revision: 'Revision sent' };
    return (
      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-medium text-[36px] text-foreground tracking-tight">Approvals</h1>
          <p className="text-[13px] text-muted mt-1.5">
            {pendingCount} pending · {approvals.length} total submissions
          </p>
        </div>
        {pendingCount > 0 && (
          <Button onClick={handleApproveAll} size="sm" className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Approve all {pendingCount}
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border shadow-card p-0">
        {approvals.map(item => {
          const isExpanded = expandedId === item.id;
          return (
            <div key={item.id}>
              <div
                className={`flex items-center gap-4 px-6 py-5 cursor-pointer transition-colors hover:bg-secondary/40 ${
                  item.status !== 'pending' ? 'opacity-60' : ''
                }`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-[11px] font-semibold shrink-0">
                  {item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground">{item.name}</p>
                  <p className="text-[12px] text-muted">{item.week}</p>
                </div>
                <div className="text-right shrink-0 mr-2">
                  <p className="text-[14px] font-semibold tabular-nums">{item.totalHours}h</p>
                  <p className="text-[11px] text-muted">{item.entries} entries</p>
                </div>
                <div className="text-right shrink-0 mr-2 hidden sm:block">
                  <p className="text-[12px] text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.submittedAt}
                  </p>
                </div>
                {statusTag(item.status)}
                <div className="shrink-0 text-muted">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>

              {isExpanded && item.status === 'pending' && (
                <div className="px-6 pb-5 pt-1 bg-secondary/20 border-t border-border">
                  <div className="grid grid-cols-5 gap-3 mb-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => {
                      const hrs = [8, 7.5, 8, 8, 7][i];
                      return (
                        <div key={day} className="bg-card border border-border rounded-[10px] p-3 text-center">
                          <p className="text-[11px] text-muted uppercase">{day}</p>
                          <p className="text-[14px] font-semibold tabular-nums">{hrs}h</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mb-4">
                    <label className="text-[11px] uppercase text-muted tracking-wider block mb-1.5 font-medium">
                      Note (optional)
                    </label>
                    <Textarea
                      value={revisionNote}
                      onChange={e => setRevisionNote(e.target.value)}
                      placeholder="Add a note explaining what needs to be corrected..."
                      className="bg-card text-[13px] resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Button onClick={() => handleApprove(item.id)} size="sm" className="gap-1.5">
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button variant="outline" onClick={() => handleRevision(item.id)} size="sm" className="text-tf-orange gap-1.5">
                      <Send className="h-3.5 w-3.5" /> Send back for revision
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Approvals;
