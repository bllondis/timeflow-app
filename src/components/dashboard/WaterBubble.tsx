import { useId } from 'react';

interface WaterBubbleProps {
  percentage: number;
  gradientColors: [string, string];
  bgColor?: string;
  textColor?: string;
  size?: number;
  animationDelay?: number;
}

const WaterBubble = ({
  percentage,
  gradientColors,
  bgColor = '#f0f4f8',
  textColor = '#0A0F1E',
  size = 80,
  animationDelay = 0,
}: WaterBubbleProps) => {
  const id = useId();
  const clipId = `clip-${id}`;
  const gradId = `grad-${id}`;
  const clamped = Math.max(0, Math.min(100, percentage));
  const waterY = size * (1 - clamped / 100);
  const waveAmp = size * 0.06;
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  // Build wave path
  const buildWavePath = (yBase: number) => {
    const step = size / 4;
    let d = `M${-size},${yBase}`;
    for (let x = -size; x <= size * 2; x += step) {
      const cp = x + step / 2;
      const cpY = yBase + (((x / step) % 2 === 0) ? -waveAmp : waveAmp);
      d += ` Q${cp},${cpY} ${x + step},${yBase}`;
    }
    d += ` L${size * 2},${size} L${-size},${size} Z`;
    return d;
  };

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="rounded-full overflow-hidden" width={size} height={size}>
        <defs>
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientColors[0]} />
            <stop offset="100%" stopColor={gradientColors[1]} />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle cx={cx} cy={cy} r={r} fill={bgColor} />
        {/* Water fill clipped to circle */}
        <g clipPath={`url(#${clipId})`}>
          <rect x="-10" y={waterY} width={size * 2.5} height={size} fill={`url(#${gradId})`} opacity="0.85" />
          {/* Animated wave */}
          <g style={{ animation: `wave 2.4s linear infinite`, animationDelay: `${animationDelay}s` }}>
            <path d={buildWavePath(waterY)} fill={`url(#${gradId})`} opacity="0.5" />
          </g>
        </g>
        {/* Circle border */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
      </svg>
      {/* Percentage text */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-semibold pointer-events-none z-10"
        style={{ fontSize: size * 0.2, color: textColor, textShadow: '0 0 8px rgba(255,255,255,.6)' }}
      >
        {Math.round(clamped)}%
      </span>
    </div>
  );
};

export default WaterBubble;
