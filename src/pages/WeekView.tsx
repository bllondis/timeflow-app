import { Check, Clock, Download, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useWeekDataQuery } from '@/hooks/useTimeflowQueries';

const WeekView = () => {
  const { data: weekData } = useWeekDataQuery();
  const week = weekData ?? {
    weekNumber: 0,
    label: "Week",
    rangeLabel: "",
    expectedHours: 40,
    days: [],
  };
  const totalHours = week.days.reduce((acc, d) => acc + d.hours, 0);
  const expected = week.expectedHours;

  const chartData = week.days.map((day, i) => ({
    name: `${day.day} ${10 + i}`,
    hours: day.hours,
    status: day.status,
    target: 8,
  }));

  return (
    <div>
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-medium text-[36px] text-foreground tracking-tight">
            {week.label || `Week ${week.weekNumber}`}
          </h1>
          <p className="text-[13px] text-muted mt-1.5">
            {week.rangeLabel} · {totalHours}h of {expected}h expected
          </p>
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

      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] text-muted">Weekly progress</span>
          <span className="text-[13px] text-foreground font-medium tabular-nums">{totalHours}h / {expected}h</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #B2EBF2, #90CAF9, #E1BEE7)' }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalHours / expected) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Chart */}
      <motion.div
        className="bg-card border border-border rounded-lg shadow-card p-6 mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h3 className="text-[14px] font-medium text-foreground mb-1">Daily breakdown</h3>
        <p className="text-[12px] text-muted-foreground mb-6">Hours logged per day vs 8h target</p>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="15%">
              <defs>
                {/* Submitted — full day: cyan→green (heatmap full) */}
                <linearGradient id="barGradSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B2EBF2" />
                  <stop offset="100%" stopColor="#DCEDC8" />
                </linearGradient>
                {/* Pending — partial: cyan→blue (heatmap partial) */}
                <linearGradient id="barGradPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E0F7FA" />
                  <stop offset="100%" stopColor="#E3F2FD" />
                </linearGradient>
                {/* Future — missing: peach→orange (heatmap missing) */}
                <linearGradient id="barGradFuture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFCCBC" />
                  <stop offset="100%" stopColor="#FFE0B2" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: 'hsl(220 9% 46%)' }}
                axisLine={{ stroke: 'hsl(220 13% 91%)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: 'hsl(220 9% 46%)' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 10]}
                tickFormatter={(v) => `${v}h`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(0 0% 100%)',
                  border: '1px solid hsl(220 13% 91%)',
                  borderRadius: '10px',
                  fontSize: '13px',
                  boxShadow: '0 8px 24px rgba(0,0,0,.08)',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => [`${value}h`, 'Logged']}
                cursor={{ fill: 'hsl(220 14% 96%)', radius: 8 }}
              />
              <ReferenceLine y={8} stroke="hsl(220 9% 46%)" strokeDasharray="6 4" strokeWidth={1} strokeOpacity={0.4} />
              <Bar dataKey="hours" radius={[10, 10, 4, 4]} animationDuration={1200} animationEasing="ease-out">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status === 'submitted' ? 'url(#barGradSubmitted)' :
                      entry.status === 'pending' ? 'url(#barGradPending)' :
                      'url(#barGradFuture)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] rounded-full border border-border/50" style={{ background: 'linear-gradient(135deg, #B2EBF2, #DCEDC8)' }} />
            <span className="text-[12px] text-muted-foreground">Submitted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] rounded-full border border-border/50" style={{ background: 'linear-gradient(135deg, #E0F7FA, #E3F2FD)' }} />
            <span className="text-[12px] text-muted-foreground">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] rounded-full border border-border/50" style={{ background: 'linear-gradient(135deg, #FFCCBC, #FFE0B2)' }} />
            <span className="text-[12px] text-muted-foreground">No data</span>
          </div>
        </div>
      </motion.div>

      {/* Days */}
      <motion.div
        className="bg-card border border-border rounded-lg shadow-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="grid grid-cols-[100px_1fr_100px_120px] gap-4 px-6 py-3.5 border-b border-border">
          <span className="text-[11px] uppercase text-muted tracking-wider font-medium">Day</span>
          <span className="text-[11px] uppercase text-muted tracking-wider font-medium">Progress</span>
          <span className="text-[11px] uppercase text-muted tracking-wider font-medium text-right">Hours</span>
          <span className="text-[11px] uppercase text-muted tracking-wider font-medium text-center">Status</span>
        </div>

        {week.days.map((day, i) => (
          <motion.div
            key={day.day}
            className="grid grid-cols-[100px_1fr_100px_120px] gap-4 items-center px-6 py-4 border-b border-border/40 last:border-b-0 hover:bg-secondary/30 transition-colors duration-150"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
          >
            <span className="text-[14px] font-medium">
              {day.day} {10 + i}
            </span>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    day.status === 'submitted'
                      ? 'linear-gradient(90deg, #B2EBF2, #DCEDC8)'
                      : day.status === 'pending'
                      ? 'linear-gradient(90deg, #E0F7FA, #90CAF9)'
                      : 'hsl(220 14% 96%)',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(day.hours / 8) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[14px] font-semibold text-foreground text-right tabular-nums">{day.hours}h</span>
            <div className="text-center">
              {day.status === 'submitted' && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-tf-green/10 text-tf-green font-medium">
                  <Check className="h-3 w-3" /> Submitted
                </span>
              )}
              {day.status === 'pending' && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-tf-orange/10 text-tf-orange font-medium">
                  <Clock className="h-3 w-3" /> Pending
                </span>
              )}
              {day.status === 'future' && (
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-muted font-medium">
                  —
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default WeekView;
