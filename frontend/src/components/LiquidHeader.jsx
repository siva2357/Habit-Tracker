import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Clock, 
  LogOut, 
  ShieldCheck,
  ArrowLeft,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from './Button';

export default function LiquidHeader({ title, subtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully', 'Session Ended');
    navigate('/login');
  };

  const isModuleView = !!title;
  const isDashboard = location.pathname === '/dashboard';

  // For Dashboard: MUST ONLY be for Control Panel (strictly '/', no history navigation)
  // For other modules: returns to wherever they originated (Dashboard or Control Panel)
  const fromPath = isDashboard 
    ? '/' 
    : (location.state?.from || '/');
    
  const fromLabel = isDashboard 
    ? 'Control Panel' 
    : (location.state?.fromName || (fromPath === '/dashboard' ? 'Dashboard' : 'Control Panel'));

  const handleBack = () => {
    if (isDashboard) {
      navigate('/');
      return;
    }
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/');
    }
  };

  return (
    <header className="liquid-glass-header">
      <div className="liquid-glass-header-inner">
        {/* Brand Logo & Dynamic Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* TrackIt Logo (Always visible on all screens) */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group shrink-0"
            title="Go to Control Panel"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Track<span className="text-indigo-600">It</span>
              </span>
              {!isModuleView && (
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/50 hidden xs:inline">
                  Personal
                </span>
              )}
            </div>
          </div>

          {/* Module-Specific Context: Divider + Back Button + Module Title */}
          {isModuleView && (
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="h-5 w-px bg-slate-200 shrink-0" />

              {/* Contextual Back Button */}
              <button
                onClick={handleBack}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border border-slate-200 text-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 shadow-2xs cursor-pointer"
                title={`Back to ${fromLabel}`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">Back to</span>
                <span>{fromLabel}</span>
              </button>

              {/* Module Title & Subtitle */}
              <div className="truncate hidden md:block border-l border-slate-200 pl-2.5 ml-0.5">
                <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{title}</h2>
                {subtitle && <p className="text-[10px] text-slate-400 hidden xl:block truncate">{subtitle}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Right Controls: Clock (hidden on mobile), Admin Badge, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Live Clock Pill (Tablet & Desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{dateStr} • {timeStr}</span>
          </div>

          {/* Admin Pill */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[11px] sm:text-xs font-semibold text-indigo-800 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xs:inline">Admin</span>
          </div>

          {/* Reusable Logout Button */}
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={handleLogout}
            title="Sign out"
            className="text-xs py-1 px-2.5 sm:py-1.5 sm:px-3"
          >
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
