import { useState } from 'react';
import { Sparkles, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConnectedSource {
  name: string;
  category: 'calendar' | 'activity' | 'devtool' | 'browser';
}

interface AIAccuracyProps {
  variant?: 'full' | 'compact';
  className?: string;
}

const connectedSources: ConnectedSource[] = [
  { name: 'Google Calendar', category: 'calendar' },
  { name: 'Figma', category: 'activity' },
  { name: 'Jira', category: 'devtool' },
];

const availableSources = [
  { name: 'GitHub', action: 'Connect GitHub' },
  { name: 'Slack', action: 'Connect Slack' },
  { name: 'Browser Extension', action: 'Install Extension' },
];

function calculateAccuracy(sources: ConnectedSource[]): { score: number; level: ConfidenceLevel } {
  const baseScore = 40;
  const categoryBonus: Record<string, number> = { calendar: 18, activity: 16, devtool: 14, browser: 12 };
  const categories = new Set(sources.map(s => s.category));
  let score = baseScore;
  score += sources.length * 8;
  score += categories.size * 5;
  categories.forEach(cat => { score += categoryBonus[cat] || 0; });
  score = Math.min(score, 97);
  const level: ConfidenceLevel = score >= 80 ? 'high' : score >= 55 ? 'medium' : 'low';
  return { score, level };
}

const levelConfig = {
  high: { label: 'High confidence', color: 'text-tf-green', barColor: 'bg-tf-green', bgColor: 'bg-tf-green/[0.04]' },
  medium: { label: 'Moderate confidence', color: 'text-tf-yellow', barColor: 'bg-tf-yellow', bgColor: 'bg-tf-yellow/[0.04]' },
  low: { label: 'Limited signals', color: 'text-tf-orange', barColor: 'bg-tf-orange', bgColor: 'bg-tf-orange/[0.04]' },
};

const AIAccuracyIndicator = ({ variant = 'full', className = '' }: AIAccuracyProps) => {
  const [expanded, setExpanded] = useState(false);
  const { score, level } = calculateAccuracy(connectedSources);
  const config = levelConfig[level];
  const sourceNames = connectedSources.map(s => s.name).join(', ');

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-1.5">
          <Sparkles className={`h-3.5 w-3.5 ${config.color}`} />
          <span className="text-[12px] text-muted">AI Accuracy:</span>
          <span className={`text-[12px] font-semibold ${config.color}`}>{score}%</span>
        </div>
        <div className="w-[60px] h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${config.barColor} transition-all duration-500`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-[11px] font-medium ${config.color}`}>{config.label}</span>
      </div>
    );
  }

  return (
    <div className={`border border-border bg-card rounded-lg p-6 shadow-card ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className={`h-5 w-5 ${config.color}`} />
          <div>
            <h3 className="font-medium text-[16px] text-foreground">AI Accuracy</h3>
            <p className="text-[12px] text-muted mt-0.5">Based on signals from {sourceNames}.</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`font-semibold text-[32px] tracking-tight ${config.color}`}>{score}%</span>
          <p className={`text-[11px] font-medium ${config.color}`}>{config.label}</p>
        </div>
      </div>

      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${config.barColor} transition-all duration-700 ease-out`} style={{ width: `${score}%` }} />
      </div>

      <div className="flex justify-between mb-5">
        <span className="text-[11px] text-muted">Low</span>
        <span className="text-[11px] text-muted">Medium</span>
        <span className="text-[11px] text-muted">High</span>
      </div>

      <p className="text-[13px] text-muted mb-3">
        {config.label} based on {connectedSources.length} connected source{connectedSources.length !== 1 ? 's' : ''}.
      </p>

      {level !== 'high' && (
        <div className={`${config.bgColor} rounded-[10px] p-3 mb-3 border border-border`}>
          <p className={`text-[12px] font-medium ${config.color} mb-2`}>Connect more sources to improve accuracy.</p>
          <div className="flex flex-wrap gap-1.5">
            {availableSources.map(s => (
              <Button key={s.name} variant="outline" size="sm" className="gap-1">
                <Plus className="h-3 w-3" /> {s.action}
              </Button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-[12px] text-muted hover:text-foreground transition-colors duration-150"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? 'Hide' : 'Show'} signal breakdown
      </button>

      {expanded && (
        <div className="mt-3 border-t border-border pt-3 space-y-2">
          {connectedSources.map(s => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-[13px] font-medium">{s.name}</span>
              <span className="text-[12px] text-tf-green font-medium">Active · signals detected</span>
            </div>
          ))}
          {availableSources.map(s => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-[13px] text-muted">{s.name}</span>
              <span className="text-[12px] text-muted">Not connected</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAccuracyIndicator;
