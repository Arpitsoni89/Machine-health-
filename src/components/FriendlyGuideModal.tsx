import React from 'react';
import { 
  X, 
  Sparkles, 
  Stethoscope, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  HeartHandshake
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FriendlyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDemo: () => void;
}

export const FriendlyGuideModal: React.FC<FriendlyGuideModalProps> = ({
  isOpen,
  onClose,
  onExploreDemo,
}) => {
  const { themeConfig } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition"
          aria-label="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-2xl ${themeConfig.badgeBg} ${themeConfig.textClass} flex items-center justify-center`}>
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              Welcome to MachineMind
            </h3>
            <p className={`text-xs font-semibold ${themeConfig.textClass}`}>
              Friendly predictive maintenance for your plant
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          We built MachineMind to solve a ₹12 Lakh Crore problem: sudden industrial breakdowns. Think of it as a <strong>friendly 24/7 doctor for your factory machines</strong>.
        </p>

        <div className="space-y-3.5 mb-6 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">1. Real-Time Equipment Vitals</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                We track heat, vibration, and power continuous telemetry so subtle friction is spotted weeks before damage occurs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className={`p-1.5 rounded-xl ${themeConfig.badgeBg} ${themeConfig.textClass} shrink-0 mt-0.5`}>
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">2. AI Flags What Humans Miss</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                No human can watch thousands of data points without fatigue. Our AI defines normal baselines and flags real deviations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">3. Clear, Stress-Free Action Directives</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Instead of emergency panic, get planned maintenance schedules and one-click dispatch before lines stop.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Google Identity Protected</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onExploreDemo();
            }}
            className={`px-4 py-2.5 rounded-xl ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5`}
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
