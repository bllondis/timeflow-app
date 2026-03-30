import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useAppContext, TimeEntry } from '@/contexts/AppContext';
import AIBanner from '@/components/dashboard/AIBanner';
import SubmittedBanner from '@/components/dashboard/SubmittedBanner';
import StatsRow from '@/components/dashboard/StatsRow';
import EntriesTable from '@/components/dashboard/EntriesTable';
import AddEntryDialog from '@/components/AddEntryDialog';
import { toast } from 'sonner';
import { saveTimeEntry } from '@/services/timeflow';

const Dashboard = () => {
  const { dayStatus, showAiBanner, entries, setEntries, currentUser } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<TimeEntry | null>(null);

  const today = new Date();
  const currentHour = today.getHours();
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
        ? 'Good afternoon'
        : 'Good evening';

  const handleAddEntry = () => {
    setEditEntry(null);
    setDialogOpen(true);
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditEntry(entry);
    setDialogOpen(true);
  };

  const handleSaveEntry = async (entry: Omit<TimeEntry, 'id'> & {id?: number;}) => {
    const savedEntry = await saveTimeEntry(entry);

    if (entry.id) {
      setEntries(entries.map((e) => e.id === savedEntry.id ? savedEntry : e));
      toast.success('Entry updated');
      return;
    }

    setEntries([...entries, savedEntry]);
    toast.success('Entry added');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-medium text-[36px] text-foreground tracking-tight leading-tight">
            {greeting}, {currentUser.name.split(' ')[0]}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-[14px] text-muted-foreground">
            <span className="text-foreground font-semibold">{format(today, 'EEE d')}</span>{' '}
            <span className="text-muted-foreground">{format(today, 'MMMM yyyy')}</span>
          </span>
        </div>
      </div>

      {/* AI Banner or Submitted Banner */}
      {dayStatus === 'submitted' ?
      <SubmittedBanner /> :
      showAiBanner ?
      <AIBanner /> :
      null}

      {/* Stats */}
      <StatsRow />

      {/* Entries Table */}
      <div className="bg-card rounded-lg border border-border shadow-card">
        <EntriesTable onAddEntry={handleAddEntry} onEditEntry={handleEditEntry} />
      </div>

      {/* Dialog */}
      <AddEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editEntry={editEntry}
        onSave={handleSaveEntry} />
      
    </div>);

};

export default Dashboard;
