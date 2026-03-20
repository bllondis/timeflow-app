import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { motion } from 'framer-motion';

const FloatingStar = ({ size, delay, duration, x, bottom }: { size: number; delay: number; duration: number; x: number; bottom: number }) => (
  <div
    className="absolute pointer-events-none"
    style={{ right: x, bottom: bottom }}
  >
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(255,255,255,0.2))' }}>
      <path d="M12 1L15 9L23 12L15 15L12 23L9 15L1 12L9 9L12 1Z" fill="rgba(37, 99, 235, 0.35)" stroke="rgba(37, 99, 235, 0.2)" strokeWidth="0.5" />
    </svg>
  </div>
);

const AIBanner = () => {
  const navigate = useNavigate();
  const { setDayStatus, entries } = useAppContext();

  const totalMinutes = entries.reduce((acc, e) => {
    const match = e.duration.match(/(\d+)h\s*(\d+)m/);
    if (match) return acc + parseInt(match[1]) * 60 + parseInt(match[2]);
    return acc;
  }, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const handleReview = () => {
    setDayStatus('reviewing');
    navigate('/review');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-lg p-12 mb-10"
      style={{
        background: 'linear-gradient(135deg, hsl(35 90% 85%) 0%, hsl(25 95% 80%) 30%, hsl(45 90% 82%) 60%, hsl(180 30% 82%) 100%)',
      }}
    >
      {/* Subtle glass overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px]" style={{ background: 'linear-gradient(135deg, #E0F7FA, #90CAF9)' }} />

      <div className="relative z-10 flex items-center justify-between gap-8">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'rgba(37, 99, 235, 0.12)' }}>
              <Sparkles className="h-5 w-5" style={{ color: '#2563EB' }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="type-hero" style={{ color: '#1E3A5F', fontSize: '18px' }}>
                Your AI draft is ready
              </h3>
              <p className="text-[13px]" style={{ color: '#5B7FA4' }}>
                <span className="font-semibold" style={{ color: '#1D4ED8' }}>{hours}h {mins}m</span> logged
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 relative overflow-visible">
          <FloatingStar size={14} delay={0} duration={4} x={-30} bottom={10} />
          <FloatingStar size={18} delay={0.6} duration={4.5} x={170} bottom={10} />
          <FloatingStar size={10} delay={1.2} duration={3.5} x={50} bottom={55} />
          <FloatingStar size={16} delay={1.8} duration={5} x={80} bottom={-30} />
          <FloatingStar size={12} delay={2.3} duration={3.8} x={-25} bottom={-25} />
          <Button
            onClick={handleReview}
            size="sm"
            className="relative z-10 border-none shadow-lg bg-white hover:bg-white/90"
            style={{ color: '#1D4ED8' }}
          >
            Review & Submit
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AIBanner;