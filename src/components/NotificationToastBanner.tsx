import React from 'react';
import { AlertOctagon, AlertTriangle, ArrowRight, X, UserCheck, CheckCircle2 } from 'lucide-react';
import { MaintenanceAlert } from '../types';
import { triggerHaptic } from '../utils/notificationHelpers';

interface NotificationToastBannerProps {
  alert: MaintenanceAlert | null;
  onOpenAlerts: () => void;
  onDismiss: () => void;
  onQuickDispatch?: (alert: MaintenanceAlert) => void;
}

export const NotificationToastBanner: React.FC<NotificationToastBannerProps> = ({
  alert,
  onOpenAlerts,
  onDismiss,
  onQuickDispatch,
}) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'critical';

  return (
    <div className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-top-4 duration-200">
      <div 
        className={`p-3.5 rounded-2xl shadow-xl border backdrop-blur-md flex items-start gap-3 transition-all ${
          isCritical
            ? 'bg-rose-900/95 text-white border-rose-700 shadow-rose-900/30 ring-1 ring-rose-500/50'
            : 'bg-slate-900/95 text-white border-slate-700 shadow-slate-900/30'
        }`}
      >
        <div className={`p-2 rounded-xl shrink-0 ${isCritical ? 'bg-rose-800 text-rose-200' : 'bg-amber-800 text-amber-200'}`}>
          {isCritical ? (
            <AlertOctagon className="w-5 h-5 animate-pulse" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
        </div>

        <div className="flex-1 min-w-0 text-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="font-extrabold text-xs uppercase tracking-wider text-rose-300 truncate">
              {isCritical ? '🚨 Critical IoT Spike' : '⚠️ Warning Anomaly'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
          </div>

          <p className="font-bold text-sm text-white mt-0.5 truncate">
            {alert.machineName}
          </p>
          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
            {alert.message}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic(20);
                onOpenAlerts();
              }}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>View Alert</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            {onQuickDispatch && !alert.assignedTo && (
              <button
                onClick={() => {
                  triggerHaptic(30);
                  onQuickDispatch(alert);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-700/80 hover:bg-rose-600 text-white font-semibold text-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <UserCheck className="w-3 h-3" />
                <span>Auto Dispatch</span>
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            triggerHaptic(10);
            onDismiss();
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          aria-label="Dismiss notification toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
