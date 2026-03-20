import { useAppContext } from '@/contexts/AppContext';
import WaterBubble from './WaterBubble';

const StatsRow = () => {
  const { entries } = useAppContext();

  const totalMinutes = entries.reduce((acc, e) => {
    const match = e.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
    return acc;
  }, 0);
  const hoursToday = parseFloat((totalMinutes / 60).toFixed(1));
  const targetHours = 8;
  const percentage = Math.min(Math.round((hoursToday / targetHours) * 100), 100);
  const loggedTodayBubblePercentage = Math.min(80, percentage);

  const weeklyHours = 32;
  const weekTarget = 40;
  const weekDelta = 4;
  const weekPercentage = Math.min(Math.round((weeklyHours / weekTarget) * 100), 100);
  const submittedDays = 3;
  const totalDays = 5;
  const progressPercentage = Math.round((submittedDays / totalDays) * 100);

  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      {/* Card 1 — Logged today */}
      <div className="rounded-[14px] p-6 min-h-[140px] flex items-center justify-between gap-4 bg-card border border-border">
        <div className="flex flex-col gap-1.5">
          <span className="type-kpi-label">Logged today</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[36px] font-semibold text-foreground">{hoursToday}</span>
            <span className="text-[18px] font-medium" style={{ color: '#6B6661' }}>h</span>
          </div>
          <span className="text-[12px] text-muted-foreground">{percentage}% of {targetHours}h target</span>
        </div>
        <WaterBubble percentage={loggedTodayBubblePercentage} gradientColors={['#E0F7FA', '#E3F2FD']} bgColor="rgba(0,0,0,.04)" size={76} />
      </div>

      {/* Card 2 — This week */}
      <div className="rounded-[14px] p-6 min-h-[140px] flex items-center justify-between gap-4 bg-card border border-border">
        <div className="flex flex-col gap-1.5">
          <span className="type-kpi-label">This week</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[36px] font-semibold text-foreground">{weeklyHours}</span>
            <span className="text-[18px] font-medium" style={{ color: '#6B6661' }}>h</span>
          </div>
          <span className="text-[12px] font-normal text-tf-teal">↑ +{weekDelta}h vs last week</span>
        </div>
        <WaterBubble percentage={weekPercentage} gradientColors={['#B2EBF2', '#DCEDC8']} bgColor="rgba(0,0,0,.04)" size={76} animationDelay={-0.8} />
      </div>

      {/* Card 3 — Projects approved */}
      <div className="rounded-[14px] p-6 min-h-[140px] flex items-center justify-between gap-4 bg-card border border-border">
        <div className="flex flex-col gap-1.5">
          <span className="type-kpi-label">Projects approved</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-[36px] font-semibold text-foreground">{submittedDays}</span>
            <span className="text-[18px] font-medium" style={{ color: '#6B6661' }}>/{totalDays}</span>
          </div>
          <span className="text-[12px] text-muted-foreground">{progressPercentage}% complete</span>
        </div>
        <WaterBubble percentage={progressPercentage} gradientColors={['#FCE4EC', '#E1BEE7']} bgColor="rgba(0,0,0,.04)" size={76} animationDelay={-1.6} />
      </div>
    </div>
  );
};

export default StatsRow;
