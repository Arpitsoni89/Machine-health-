import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:right-auto z-50 flex items-center justify-between sm:justify-start gap-2.5 rounded-2xl bg-slate-900/95 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl border border-amber-500/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </span>
        <div>
          <span className="text-amber-400 font-bold">Offline Mode Active</span>
          <p className="text-[11px] text-slate-300 font-normal">
            Telemetry is running from local cache.
          </p>
        </div>
      </div>
      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono shrink-0">
        PWA Cached
      </span>
    </div>
  );
};
