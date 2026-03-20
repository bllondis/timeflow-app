import { Sparkles, Check, Users } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.png';

const Topbar = () => {
  const { role, dayStatus, deadline } = useAppContext();

  const statusTag = () => {
    if (role === 'manager') {
      return (
        <span className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-medium bg-tf-orange/20 text-tf-orange">
          <Users className="h-3.5 w-3.5" /> {deadline.lateCount} late
        </span>
      );
    }
    if (dayStatus === 'pending') {
      return (
        <span className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-medium bg-white/10 text-white/90">
          <Sparkles className="h-3.5 w-3.5" /> Your AI draft is ready
        </span>
      );
    }
    if (dayStatus === 'reviewing') {
      return (
        <span className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-medium bg-white/10 text-white/90">
          Reviewing...
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-medium bg-tf-green/20 text-tf-green">
        <Check className="h-3.5 w-3.5" /> Up to date
      </span>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-foreground backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity duration-150">
          <div className="h-7 w-7 rounded-[8px] flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #E0F7FA, #90CAF9)' }}>
            <img src={logoIcon} alt="Timeflow" className="h-5 w-5 object-contain brightness-0 invert-0" />
          </div>
          <span className="font-semibold text-[15px] text-white tracking-tight">Timeflow</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {statusTag()}
      </div>
    </header>
  );
};

export default Topbar;
