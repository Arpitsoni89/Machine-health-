import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Wrench, 
  X, 
  Radio, 
  ArrowRight, 
  ShieldCheck, 
  Activity,
  Sparkles
} from 'lucide-react';
import { OwnerWorkDoneNotification } from '../types';
import { triggerHaptic } from '../utils/notificationHelpers';

interface TaskCompletedToastProps {
  notification: OwnerWorkDoneNotification | null;
  onDismiss: () => void;
  onViewDetails: () => void;
  durationMs?: number;
}

export const TaskCompletedToast: React.FC<TaskCompletedToastProps> = ({
  notification,
  onDismiss,
  onViewDetails,
  durationMs = 5500,
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!notification) return;

    setProgress(100);
    const intervalTime = 50;
    const step = (100 / (durationMs / intervalTime));

    const timer = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            onDismiss();
            return 0;
          }
          return Math.max(0, prev - step);
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [notification, durationMs, isPaused, onDismiss]);

  if (!notification) return null;

  return (
    <div 
      className="fixed top-4 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-[440px] z-50 animate-in slide-in-from-top-4 fade-in duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl shadow-emerald-950/40 text-white">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="p-4 space-y-3 relative z-10">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Task Completed</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {notification.timestamp || 'Just now'}
              </span>
            </div>

            <button
              onClick={() => {
                triggerHaptic(10);
                onDismiss();
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Info */}
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                <span>{notification.technicianName}</span>
                <span className="text-[10px] font-mono font-bold bg-slate-800 text-sky-400 border border-slate-700 px-1.5 py-0.2 rounded">
                  {notification.technicianBadge}
                </span>
              </p>

              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                Completed repair on <strong className="text-emerald-300">{notification.machineName}</strong>. 
                Vibration & thermal baselines normalized.
              </p>

              {/* Sensor Verification Strip */}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-300 font-mono bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 flex-wrap">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Activity className="w-3 h-3" />
                  <span>{notification.sensorVerification.vibrationRMS}</span>
                </div>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-300 font-sans font-medium">
                  {notification.sensorVerification.isoZone || 'Zone A Normal'}
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 font-sans">
                  Health 98%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
            <span className="text-[11px] text-emerald-400/90 flex items-center gap-1 font-medium">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Owner notified via SMS & WhatsApp</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  triggerHaptic(20);
                  onViewDetails();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <span>View Full Log</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Dismissal Progress Bar */}
        <div className="h-1 w-full bg-slate-800">
          <div 
            className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
