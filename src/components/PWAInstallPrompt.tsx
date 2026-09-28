import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, CheckCircle, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTheme } from '../context/ThemeContext';

export const PWAInstallButton: React.FC<{ compact?: boolean; className?: string }> = ({ compact = false, className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { themeConfig } = useTheme();

  // If already installed running in standalone app mode, hide
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>App Installed</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={className || `flex items-center gap-1.5 min-h-[38px] px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 shadow-2xs ${
          isInstallable || isIOS
            ? `${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white`
            : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
        }`}
        title="Install MachineMind as Native App on Desktop / Mobile"
        aria-label="Install App"
      >
        <Smartphone className="w-3.5 h-3.5 shrink-0" />
        <span className={compact ? 'hidden md:inline' : ''}>Install App</span>
        <span className="hidden lg:inline-block px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px] font-mono">
          PWA
        </span>
      </button>

      {/* iOS / General Install Guide Modal */}
      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Install MachineMind</h3>
                  <p className="text-[11px] text-slate-500">Run standalone with instant access</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80 space-y-2.5">
                <div className="font-bold text-sky-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>How to Install on Mobile / Tablet:</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs text-sky-700 font-bold shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900">1. Tap Share Menu</strong>
                    <p className="text-[11px] text-slate-500">In Safari or Chrome bottom bar, tap the Share icon.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs text-sky-700 font-bold shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900">2. "Add to Home Screen"</strong>
                    <p className="text-[11px] text-slate-500">Scroll down and tap <em>Add to Home Screen</em> to install.</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">✨ Native App Perks:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                  <li>Zero browser address bar clutter</li>
                  <li>Fast full-screen telemetry monitoring</li>
                  <li>Offline vibration and telemetry caching</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-98 shadow-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { themeConfig } = useTheme();

  if (isInstalled || dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-xl bg-white/20 shrink-0">
            <Smartphone className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <span className="font-bold">Install MachineMind App:</span>{' '}
            <span className="text-sky-100 hidden sm:inline">Add to your Home Screen for instant offline telemetry & fullscreen experience.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isInstallable ? (
            <button
              onClick={install}
              className="px-3 py-1 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold transition shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
            </button>
          ) : (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="px-3 py-1 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold transition shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get App</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Install MachineMind</h3>
                  <p className="text-[11px] text-slate-500">Add to your Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs text-sky-700 font-bold shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900">1. Tap the Share button</strong> in your mobile browser toolbar.
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white shadow-2xs text-sky-700 font-bold shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900">2. Tap "Add to Home Screen"</strong> to install MachineMind.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-98 shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
